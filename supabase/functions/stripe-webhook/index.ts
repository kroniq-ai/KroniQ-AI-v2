import 'jsr:@supabase/functions-js/edge-runtime.d.ts';
import Stripe from 'npm:stripe@17.7.0';
import { createClient } from 'npm:@supabase/supabase-js@2.49.1';

const stripeSecret = Deno.env.get('STRIPE_SECRET_KEY')!;
const stripeWebhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET')!;
const stripe = new Stripe(stripeSecret, {
  appInfo: {
    name: 'Bolt Integration',
    version: '1.0.0',
  },
});

const supabase = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);

Deno.serve(async (req) => {
  try {
    // Handle OPTIONS request for CORS preflight
    if (req.method === 'OPTIONS') {
      return new Response(null, { status: 204 });
    }

    if (req.method !== 'POST') {
      return new Response('Method not allowed', { status: 405 });
    }

    // get the signature from the header
    const signature = req.headers.get('stripe-signature');

    if (!signature) {
      return new Response('No signature found', { status: 400 });
    }

    // get the raw body
    const body = await req.text();

    // verify the webhook signature
    let event: Stripe.Event;

    try {
      event = await stripe.webhooks.constructEventAsync(body, signature, stripeWebhookSecret);
    } catch (error: any) {
      console.error(`Webhook signature verification failed: ${error.message}`);
      return new Response(`Webhook signature verification failed: ${error.message}`, { status: 400 });
    }

    EdgeRuntime.waitUntil(handleEvent(event));

    return Response.json({ received: true });
  } catch (error: any) {
    console.error('Error processing webhook:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});

async function handleEvent(event: Stripe.Event) {
  const stripeData = event?.data?.object ?? {};

  if (!stripeData) {
    return;
  }

  if (!('customer' in stripeData)) {
    return;
  }

  // for one time payments, we only listen for the checkout.session.completed event
  if (event.type === 'payment_intent.succeeded' && event.data.object.invoice === null) {
    return;
  }

  const { customer: customerId } = stripeData;

  if (!customerId || typeof customerId !== 'string') {
    console.error(`No customer received on event: ${JSON.stringify(event)}`);
  } else {
    let isSubscription = true;

    if (event.type === 'checkout.session.completed') {
      const { mode } = stripeData as Stripe.Checkout.Session;

      isSubscription = mode === 'subscription';

      console.info(`Processing ${isSubscription ? 'subscription' : 'one-time payment'} checkout session`);
    }

    const { mode, payment_status } = stripeData as Stripe.Checkout.Session;

    if (isSubscription) {
      console.info(`Starting subscription sync for customer: ${customerId}`);
      await syncCustomerFromStripe(customerId);
    } else if (mode === 'payment' && payment_status === 'paid') {
      try {
        // Extract the necessary information from the session
        const {
          id: checkout_session_id,
          payment_intent,
          amount_subtotal,
          amount_total,
          currency,
          metadata,
        } = stripeData as Stripe.Checkout.Session;

        // Insert the order into the stripe_orders table
        const { error: orderError } = await supabase.from('stripe_orders').insert({
          checkout_session_id,
          payment_intent_id: payment_intent,
          customer_id: customerId,
          amount_subtotal,
          amount_total,
          currency,
          payment_status,
          status: 'completed',
        });

        if (orderError) {
          console.error('Error inserting order:', orderError);
          return;
        }

        // Handle message credit purchase
        if (metadata && metadata.pack_id && metadata.user_id) {
          const { data: packData, error: packError } = await supabase
            .from('token_packs')
            .select('tokens, price_usd')
            .eq('id', metadata.pack_id)
            .maybeSingle();

          if (!packError && packData) {
            const messagesCount = packData.tokens;
            const packPrice = parseFloat(packData.price_usd);

            const { error: creditsError } = await supabase.rpc('add_message_credits', {
              p_user_id: metadata.user_id,
              p_messages: messagesCount,
              p_pack_price: packPrice,
              p_stripe_payment_id: payment_intent as string,
            });

            if (creditsError) {
              console.error('Error adding message credits:', creditsError);
            } else {
              console.info(`Successfully added ${messagesCount} messages to user ${metadata.user_id}`);

              // Upgrade user to paid tier via edge function
              try {
                const tierResponse = await fetch(`${Deno.env.get('SUPABASE_URL')}/functions/v1/manage-user-tier`, {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')}`
                  },
                  body: JSON.stringify({
                    action: 'upgrade',
                    userId: metadata.user_id,
                    tokensPurchased: messagesCount,
                    stripeCustomerId: customerId
                  })
                });

                if (!tierResponse.ok) {
                  console.error('Error upgrading user to paid tier:', await tierResponse.text());
                } else {
                  const tierResult = await tierResponse.json();
                  console.info(`Successfully upgraded user ${metadata.user_id} to paid tier:`, tierResult);
                }
              } catch (tierError) {
                console.error('Exception upgrading user to paid tier:', tierError);
              }
            }
          }
        }

        console.info(`Successfully processed one-time payment for session: ${checkout_session_id}`);
      } catch (error) {
        console.error('Error processing one-time payment:', error);
      }
    }
  }
}

// based on the excellent https://github.com/t3dotgg/stripe-recommendations
async function syncCustomerFromStripe(customerId: string) {
  try {
    // fetch latest subscription data from Stripe
    const subscriptions = await stripe.subscriptions.list({
      customer: customerId,
      limit: 1,
      status: 'all',
      expand: ['data.default_payment_method'],
    });

    // TODO verify if needed
    if (subscriptions.data.length === 0) {
      console.info(`No active subscriptions found for customer: ${customerId}`);
      const { error: noSubError } = await supabase.from('stripe_subscriptions').upsert(
        {
          customer_id: customerId,
          subscription_status: 'not_started',
        },
        {
          onConflict: 'customer_id',
        },
      );

      if (noSubError) {
        console.error('Error updating subscription status:', noSubError);
        throw new Error('Failed to update subscription status in database');
      }
    }

    // assumes that a customer can only have a single subscription
    const subscription = subscriptions.data[0];
    const priceId = subscription?.items?.data?.[0]?.price?.id;

    // store subscription state
    const { error: subError } = await supabase.from('stripe_subscriptions').upsert(
      {
        customer_id: customerId,
        subscription_id: subscription.id,
        price_id: priceId,
        current_period_start: subscription.current_period_start,
        current_period_end: subscription.current_period_end,
        cancel_at_period_end: subscription.cancel_at_period_end,
        ...(subscription.default_payment_method && typeof subscription.default_payment_method !== 'string'
          ? {
            payment_method_brand: subscription.default_payment_method.card?.brand ?? null,
            payment_method_last4: subscription.default_payment_method.card?.last4 ?? null,
          }
          : {}),
        status: subscription.status,
      },
      {
        onConflict: 'customer_id',
      },
    );

    if (subError) {
      console.error('Error syncing subscription:', subError);
      throw new Error('Failed to sync subscription in database');
    }

    // Update user's subscription tier in profiles table
    await updateUserSubscriptionTier(customerId, subscription.status, priceId);

    console.info(`Successfully synced subscription for customer: ${customerId}`);
  } catch (error) {
    console.error(`Failed to sync subscription for customer ${customerId}:`, error);
    throw error;
  }
}

// Map Stripe price IDs to subscription tiers
const PRICE_TO_TIER: Record<string, 'starter' | 'pro' | 'premium'> = {
  'price_1Skd0CFBTh5tg3ftUqapwbFS': 'starter',  // Starter $5/month
  'price_1Skd4YFBTh5tg3ftMYD6xjBg': 'pro',      // Pro $12/month
  'price_1Skd3LFBTh5tg3ftCYnDFxwb': 'premium',  // Premium $29/month
};

async function updateUserSubscriptionTier(
  customerId: string,
  subscriptionStatus: string,
  priceId?: string,
  customerEmail?: string
) {
  try {
    let userId: string | null = null;

    // First, try to find the user by Stripe customer ID
    const { data: profileByCustomerId } = await supabase
      .from('profiles')
      .select('id')
      .eq('stripe_customer_id', customerId)
      .maybeSingle();

    if (profileByCustomerId) {
      userId = profileByCustomerId.id;
      console.log(`Found user by stripe_customer_id: ${userId}`);
    }

    // Fallback: Try to find by email (from Stripe customer)
    if (!userId && customerEmail) {
      const { data: profileByEmail } = await supabase
        .from('profiles')
        .select('id')
        .eq('email', customerEmail)
        .maybeSingle();

      if (profileByEmail) {
        userId = profileByEmail.id;
        console.log(`Found user by email ${customerEmail}: ${userId}`);

        // Store the stripe_customer_id for future lookups
        await supabase
          .from('profiles')
          .update({ stripe_customer_id: customerId })
          .eq('id', userId);
        console.log(`Stored stripe_customer_id ${customerId} for user ${userId}`);
      }
    }

    // Fallback: Try to get email from Stripe customer object
    if (!userId && customerId) {
      try {
        const customer = await stripe.customers.retrieve(customerId);
        if (customer && !customer.deleted && 'email' in customer && customer.email) {
          const { data: profileByStripeEmail } = await supabase
            .from('profiles')
            .select('id')
            .eq('email', customer.email)
            .maybeSingle();

          if (profileByStripeEmail) {
            userId = profileByStripeEmail.id;
            console.log(`Found user by Stripe customer email ${customer.email}: ${userId}`);

            // Store the stripe_customer_id for future lookups
            await supabase
              .from('profiles')
              .update({ stripe_customer_id: customerId })
              .eq('id', userId);
          }
        }
      } catch (stripeErr) {
        console.error('Error fetching Stripe customer:', stripeErr);
      }
    }

    if (!userId) {
      console.warn(`No user found for customer ID: ${customerId}, email: ${customerEmail}`);
      return;
    }

    // Determine the tier based on price ID
    const tier = priceId ? (PRICE_TO_TIER[priceId] || 'free') : 'free';
    const isActive = ['active', 'trialing'].includes(subscriptionStatus);

    // Update the user's profile - USE 'plan' COLUMN
    const { error: updateError } = await supabase
      .from('profiles')
      .update({
        plan: isActive ? tier : 'free',
      })
      .eq('id', userId);

    if (updateError) {
      console.error('Error updating user subscription tier:', updateError);
    } else {
      console.info(`✅ Updated user ${userId} to plan: ${tier}, status: ${subscriptionStatus}`);
    }
  } catch (error) {
    console.error('Error in updateUserSubscriptionTier:', error);
  }
}