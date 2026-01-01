-- User Account Updates - January 1, 2026
-- Run this in Supabase SQL Editor

-- 1. Give PRO tier to deepak.dahiya123@gmail.com
UPDATE public.profiles 
SET plan = 'Pro', 
    tokens_limit = 220000  -- PRO tier monthly tokens
WHERE email = 'deepak.dahiya123@gmail.com';

-- 2. Give 20,000 tokens to cardozaoscar452@gmail.com
UPDATE public.profiles 
SET tokens_limit = 20000
WHERE email = 'cardozaoscar452@gmail.com';

-- 3. Give PREMIUM tier to jsdahiya@gmail.com  
UPDATE public.profiles 
SET plan = 'Premium',
    tokens_limit = 560000  -- PREMIUM tier monthly tokens
WHERE email = 'jsdahiya@gmail.com';

-- Verify the updates
SELECT email, plan, tokens_limit 
FROM public.profiles 
WHERE email IN ('deepak.dahiya123@gmail.com', 'cardozaoscar452@gmail.com', 'jsdahiya@gmail.com');
