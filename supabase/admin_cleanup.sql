/*
  ADMIN CLEANUP SCRIPT
  Run this in Supabase SQL Editor to clean up users and set tiers.
*/

-- 1. Delete ALL users except the 3 authorized ones
-- This will CASCADE delete their profiles, usage data, tickets, etc.
DELETE FROM auth.users 
WHERE email NOT IN (
    'atirek.sd11@gmail.com',
    'kroniq.ca@gmail.com',
    'aistearunica@gmail.com'
);

-- 2. Update 'atirek.sd11@gmail.com' -> PREMIUM (1,000,000 tokens)
UPDATE public.profiles
SET plan = 'premium', tokens_limit = 1000000
FROM auth.users u
WHERE public.profiles.id = u.id AND u.email = 'atirek.sd11@gmail.com';

-- 3. Update 'kroniq.ca@gmail.com' -> PRO (300,000 tokens)
UPDATE public.profiles
SET plan = 'pro', tokens_limit = 300000
FROM auth.users u
WHERE public.profiles.id = u.id AND u.email = 'kroniq.ca@gmail.com';

-- 4. Update 'aistearunica@gmail.com' -> STARTER (50,000 tokens)
UPDATE public.profiles
SET plan = 'starter', tokens_limit = 50000
FROM auth.users u
WHERE public.profiles.id = u.id AND u.email = 'aistearunica@gmail.com';
