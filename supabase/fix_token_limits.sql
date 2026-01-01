-- =============================================
-- KroniQ AI - Complete Tier Limits & Token System
-- Run this in Supabase SQL Editor
-- Last Updated: January 1, 2026
-- =============================================

-- ========================================
-- TIER CONFIGURATION REFERENCE
-- ========================================
-- 
-- All limits reset DAILY at midnight UTC
--
-- | TIER     | TOKENS/DAY | IMAGES | VIDEOS | MUSIC | PPT | TTS |
-- |----------|------------|--------|--------|-------|-----|-----|
-- | FREE     | 15,000     | 3      | 1      | 3     | 2   | 5   |
-- | STARTER  | 50,000     | 15     | 3      | 10    | 10  | 20  |
-- | PRO      | 300,000    | 50     | 10     | 40    | 30  | 75  |
-- | PREMIUM  | 1,000,000  | 150    | 30     | 120   | 100 | 200 |
--
-- ========================================

-- ========================================
-- STEP 0: Fix Profile Creation Trigger (for photo_url)
-- This ensures new Google OAuth signups get their profile picture
-- ========================================

-- Create or replace the function that handles new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (
    id,
    email,
    display_name,
    photo_url,
    plan,
    tokens_limit,
    tokens_used
  )
  VALUES (
    new.id,
    new.email,
    COALESCE(
      new.raw_user_meta_data->>'full_name',
      new.raw_user_meta_data->>'name',
      new.raw_user_meta_data->>'display_name',
      split_part(new.email, '@', 1)
    ),
    COALESCE(
      new.raw_user_meta_data->>'avatar_url',
      new.raw_user_meta_data->>'picture',
      new.raw_user_meta_data->>'photo_url'
    ),
    'free',
    15000,
    0
  )
  ON CONFLICT (id) DO UPDATE SET
    display_name = COALESCE(
      EXCLUDED.display_name,
      profiles.display_name
    ),
    photo_url = COALESCE(
      EXCLUDED.photo_url,
      profiles.photo_url
    );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop existing trigger and recreate
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Also update existing users who don't have photo_url but have it in auth.users metadata
UPDATE profiles p
SET photo_url = (
  SELECT COALESCE(
    au.raw_user_meta_data->>'avatar_url',
    au.raw_user_meta_data->>'picture'
  )
  FROM auth.users au
  WHERE au.id = p.id
)
WHERE p.photo_url IS NULL;

-- ========================================
-- STEP 1: Fix Column Defaults
-- ========================================

-- Set correct default for tokens_limit (15K for free tier)
ALTER TABLE profiles 
ALTER COLUMN tokens_limit SET DEFAULT 15000;

-- Ensure all tracking columns exist
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS daily_tokens_used integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS last_daily_reset timestamp with time zone DEFAULT now(),
ADD COLUMN IF NOT EXISTS images_used integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS videos_used integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS music_used integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS tts_used integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS ppt_used integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS messages_used integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS last_usage_reset_at timestamp with time zone;

-- ========================================
-- STEP 2: Fix Existing Users with Wrong Limits
-- ========================================

-- FIX FREE tier users (should have 15K, not 150K)
UPDATE profiles 
SET tokens_limit = 15000 
WHERE plan = 'free' AND tokens_limit > 15000;

-- FIX STARTER tier users (should have 50K)
UPDATE profiles 
SET tokens_limit = 50000 
WHERE plan = 'starter' AND (tokens_limit < 50000 OR tokens_limit > 50000);

-- FIX PRO tier users (should have 300K)
UPDATE profiles 
SET tokens_limit = 300000 
WHERE plan = 'pro' AND (tokens_limit < 300000 OR tokens_limit > 300000);

-- FIX PREMIUM tier users (should have 1M)
UPDATE profiles 
SET tokens_limit = 1000000 
WHERE plan = 'premium' AND (tokens_limit < 1000000 OR tokens_limit > 1000000);

-- ========================================
-- STEP 3: Create Tier Limits Lookup Table
-- ========================================

-- Drop if exists and recreate
DROP TABLE IF EXISTS tier_limits;

CREATE TABLE tier_limits (
    plan text PRIMARY KEY,
    daily_tokens integer NOT NULL,
    daily_images integer NOT NULL,
    daily_videos integer NOT NULL,
    daily_music integer NOT NULL,
    daily_ppt integer NOT NULL,
    daily_tts integer NOT NULL,
    price_monthly decimal(10,2) DEFAULT 0,
    description text
);

-- Insert tier configurations
INSERT INTO tier_limits (plan, daily_tokens, daily_images, daily_videos, daily_music, daily_ppt, daily_tts, price_monthly, description) VALUES
    ('free', 15000, 3, 1, 3, 2, 5, 0, 'Free tier with basic access'),
    ('starter', 50000, 15, 3, 10, 10, 20, 4.99, 'Starter tier for casual users'),
    ('pro', 300000, 50, 10, 40, 30, 75, 14.99, 'Pro tier for power users'),
    ('premium', 1000000, 150, 30, 120, 100, 200, 29.99, 'Premium tier with maximum limits')
ON CONFLICT (plan) DO UPDATE SET
    daily_tokens = EXCLUDED.daily_tokens,
    daily_images = EXCLUDED.daily_images,
    daily_videos = EXCLUDED.daily_videos,
    daily_music = EXCLUDED.daily_music,
    daily_ppt = EXCLUDED.daily_ppt,
    daily_tts = EXCLUDED.daily_tts,
    price_monthly = EXCLUDED.price_monthly,
    description = EXCLUDED.description;

-- ========================================
-- STEP 3.5: Create Daily Usage Tracking Table
-- (This table is queried by generationLimitsService.ts)
-- ========================================

CREATE TABLE IF NOT EXISTS daily_usage (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    date date NOT NULL DEFAULT CURRENT_DATE,
    images_generated integer DEFAULT 0,
    videos_generated integer DEFAULT 0,
    music_generated integer DEFAULT 0,
    tts_generated integer DEFAULT 0,
    ppt_generated integer DEFAULT 0,
    tokens_used integer DEFAULT 0,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    UNIQUE(user_id, date)
);

-- Enable RLS on daily_usage
ALTER TABLE daily_usage ENABLE ROW LEVEL SECURITY;

-- Users can only see/edit their own daily usage
DROP POLICY IF EXISTS "Users can read own daily usage" ON daily_usage;
CREATE POLICY "Users can read own daily usage" ON daily_usage
    FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own daily usage" ON daily_usage;
CREATE POLICY "Users can insert own daily usage" ON daily_usage
    FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own daily usage" ON daily_usage;
CREATE POLICY "Users can update own daily usage" ON daily_usage
    FOR UPDATE USING (auth.uid() = user_id);

-- Index for fast lookups
CREATE INDEX IF NOT EXISTS idx_daily_usage_user_date ON daily_usage(user_id, date);

-- ========================================
-- STEP 4: Daily Reset Function
-- ========================================

-- Drop existing function first (in case return type changed)
DROP FUNCTION IF EXISTS reset_daily_usage();

-- Function to reset daily usage for all users
CREATE OR REPLACE FUNCTION reset_daily_usage()
RETURNS integer AS $$
DECLARE
    rows_updated integer;
BEGIN
    UPDATE profiles 
    SET 
        tokens_used = 0,
        images_used = 0,
        videos_used = 0,
        music_used = 0,
        tts_used = 0,
        ppt_used = 0,
        messages_used = 0,
        last_usage_reset_at = now()
    WHERE last_usage_reset_at IS NULL 
       OR DATE(last_usage_reset_at) < CURRENT_DATE;
    
    GET DIAGNOSTICS rows_updated = ROW_COUNT;
    RETURN rows_updated;
END;
$$ LANGUAGE plpgsql;

-- ========================================
-- STEP 5: Function to Get User Limits
-- ========================================

-- Function to get limits for a user based on their plan
CREATE OR REPLACE FUNCTION get_user_limits(user_id uuid)
RETURNS TABLE (
    plan text,
    tokens_limit integer,
    tokens_remaining integer,
    images_limit integer,
    images_remaining integer,
    videos_limit integer,
    videos_remaining integer,
    music_limit integer,
    music_remaining integer,
    ppt_limit integer,
    ppt_remaining integer,
    tts_limit integer,
    tts_remaining integer
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        p.plan,
        tl.daily_tokens,
        GREATEST(0, tl.daily_tokens - COALESCE(p.tokens_used, 0)),
        tl.daily_images,
        GREATEST(0, tl.daily_images - COALESCE(p.images_used, 0)),
        tl.daily_videos,
        GREATEST(0, tl.daily_videos - COALESCE(p.videos_used, 0)),
        tl.daily_music,
        GREATEST(0, tl.daily_music - COALESCE(p.music_used, 0)),
        tl.daily_ppt,
        GREATEST(0, tl.daily_ppt - COALESCE(p.ppt_used, 0)),
        tl.daily_tts,
        GREATEST(0, tl.daily_tts - COALESCE(p.tts_used, 0))
    FROM profiles p
    JOIN tier_limits tl ON tl.plan = p.plan
    WHERE p.id = user_id;
END;
$$ LANGUAGE plpgsql;

-- ========================================
-- STEP 6: Function to Check if User Can Perform Action
-- ========================================

CREATE OR REPLACE FUNCTION can_use_feature(
    user_id uuid,
    feature_type text,  -- 'tokens', 'images', 'videos', 'music', 'ppt', 'tts'
    amount integer DEFAULT 1
)
RETURNS boolean AS $$
DECLARE
    user_plan text;
    current_used integer;
    daily_limit integer;
BEGIN
    -- Get user's plan
    SELECT plan INTO user_plan FROM profiles WHERE id = user_id;
    IF user_plan IS NULL THEN
        RETURN false;
    END IF;
    
    -- Get current usage and limit
    CASE feature_type
        WHEN 'tokens' THEN
            SELECT COALESCE(tokens_used, 0) INTO current_used FROM profiles WHERE id = user_id;
            SELECT daily_tokens INTO daily_limit FROM tier_limits WHERE plan = user_plan;
        WHEN 'images' THEN
            SELECT COALESCE(images_used, 0) INTO current_used FROM profiles WHERE id = user_id;
            SELECT daily_images INTO daily_limit FROM tier_limits WHERE plan = user_plan;
        WHEN 'videos' THEN
            SELECT COALESCE(videos_used, 0) INTO current_used FROM profiles WHERE id = user_id;
            SELECT daily_videos INTO daily_limit FROM tier_limits WHERE plan = user_plan;
        WHEN 'music' THEN
            SELECT COALESCE(music_used, 0) INTO current_used FROM profiles WHERE id = user_id;
            SELECT daily_music INTO daily_limit FROM tier_limits WHERE plan = user_plan;
        WHEN 'ppt' THEN
            SELECT COALESCE(ppt_used, 0) INTO current_used FROM profiles WHERE id = user_id;
            SELECT daily_ppt INTO daily_limit FROM tier_limits WHERE plan = user_plan;
        WHEN 'tts' THEN
            SELECT COALESCE(tts_used, 0) INTO current_used FROM profiles WHERE id = user_id;
            SELECT daily_tts INTO daily_limit FROM tier_limits WHERE plan = user_plan;
        ELSE
            RETURN false;
    END CASE;
    
    RETURN (current_used + amount) <= daily_limit;
END;
$$ LANGUAGE plpgsql;

-- ========================================
-- STEP 7: Function to Upgrade User Tier
-- ========================================

CREATE OR REPLACE FUNCTION upgrade_user_tier(
    user_id uuid,
    new_plan text
)
RETURNS boolean AS $$
DECLARE
    new_token_limit integer;
BEGIN
    -- Get the new token limit from tier_limits
    SELECT daily_tokens INTO new_token_limit 
    FROM tier_limits 
    WHERE plan = new_plan;
    
    IF new_token_limit IS NULL THEN
        RETURN false;  -- Invalid plan
    END IF;
    
    -- Update user's plan and token limit
    UPDATE profiles 
    SET 
        plan = new_plan,
        tokens_limit = new_token_limit,
        updated_at = now()
    WHERE id = user_id;
    
    RETURN FOUND;
END;
$$ LANGUAGE plpgsql;

-- ========================================
-- STEP 8: Enable Row Level Security
-- ========================================

-- Enable RLS if not already enabled
ALTER TABLE tier_limits ENABLE ROW LEVEL SECURITY;

-- Drop existing policy if exists, then create
DROP POLICY IF EXISTS "Anyone can read tier limits" ON tier_limits;
CREATE POLICY "Anyone can read tier limits" ON tier_limits
    FOR SELECT USING (true);

-- ========================================
-- STEP 9: Create Index for Performance
-- ========================================

CREATE INDEX IF NOT EXISTS idx_profiles_plan ON profiles(plan);
CREATE INDEX IF NOT EXISTS idx_profiles_last_reset ON profiles(last_usage_reset_at);

-- ========================================
-- VERIFICATION QUERIES
-- ========================================

-- Show all tier limits
SELECT * FROM tier_limits ORDER BY daily_tokens;

-- Show user count per plan with their limits
SELECT 
    p.plan,
    COUNT(*) as user_count,
    tl.daily_tokens,
    tl.daily_images,
    tl.daily_videos,
    tl.daily_music,
    tl.daily_ppt,
    tl.daily_tts
FROM profiles p
LEFT JOIN tier_limits tl ON tl.plan = p.plan
GROUP BY p.plan, tl.daily_tokens, tl.daily_images, tl.daily_videos, tl.daily_music, tl.daily_ppt, tl.daily_tts
ORDER BY tl.daily_tokens;

-- ========================================
-- CRON JOB SETUP (Run in Supabase Dashboard)
-- ========================================
-- 
-- To automatically reset usage daily, set up a cron job in Supabase:
-- 
-- 1. Go to Database > Extensions
-- 2. Enable pg_cron if not enabled
-- 3. Run this:
-- 
-- SELECT cron.schedule(
--     'daily-usage-reset',
--     '0 0 * * *',  -- Every day at midnight UTC
--     $$SELECT reset_daily_usage()$$
-- );
--
-- ========================================

-- Run once to test the reset function
-- SELECT reset_daily_usage();
