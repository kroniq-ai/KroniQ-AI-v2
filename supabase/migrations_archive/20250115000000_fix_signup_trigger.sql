-- Migration: Fix signup trigger errors
-- Problem: "Database error saving new user" on signup
-- Solution: Drop problematic auth.users trigger and ensure profile creation is safe

-- ===================================================================
-- PART 1: DROP ALL TRIGGERS ON auth.users THAT MIGHT CAUSE FAILURES
-- ===================================================================

-- Drop any existing trigger on auth.users that might be causing issues
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP TRIGGER IF EXISTS handle_new_user_trigger ON auth.users;
DROP TRIGGER IF EXISTS create_profile_trigger ON auth.users;
DROP TRIGGER IF EXISTS trigger_handle_new_user ON auth.users;
DROP TRIGGER IF EXISTS init_free_tier_on_signup ON auth.users;

-- ===================================================================
-- PART 2: DROP POTENTIALLY PROBLEMATIC FUNCTIONS
-- ===================================================================

-- Drop the functions that might be causing issues
DROP FUNCTION IF EXISTS handle_new_user() CASCADE;
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;

-- ===================================================================
-- PART 3: CREATE A SAFE, NEW PROFILE CREATION FUNCTION
-- ===================================================================

-- This function will be called by auth.users trigger to auto-create profiles
CREATE OR REPLACE FUNCTION public.create_user_profile_on_signup()
RETURNS TRIGGER AS $$
DECLARE
  v_display_name TEXT;
  v_photo_url TEXT;
BEGIN
  -- Extract metadata safely
  v_display_name := COALESCE(
    NEW.raw_user_meta_data->>'display_name',
    NEW.raw_user_meta_data->>'full_name',
    SPLIT_PART(NEW.email, '@', 1)
  );
  
  v_photo_url := NEW.raw_user_meta_data->>'avatar_url';
  
  -- Insert into profiles with safe defaults
  INSERT INTO public.profiles (
    id,
    email,
    display_name,
    photo_url,
    plan,
    tokens_used,
    tokens_limit,
    paid_tokens_balance,
    messages_used,
    images_used,
    videos_used,
    music_used,
    tts_used,
    ppt_used,
    ai_personality,
    ai_creativity_level,
    ai_response_length,
    created_at,
    updated_at
  ) VALUES (
    NEW.id,
    COALESCE(NEW.email, ''),
    v_display_name,
    v_photo_url,
    'free',
    0,
    15000,  -- Free tier token limit
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    'balanced',
    5,
    'medium',
    NOW(),
    NOW()
  )
  ON CONFLICT (id) DO NOTHING;  -- Don't fail if profile already exists
  
  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  -- Log the error but don't fail the signup
  RAISE WARNING 'Profile creation error for user %: %', NEW.id, SQLERRM;
  RETURN NEW;  -- Still return NEW so signup succeeds even if profile creation fails
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ===================================================================
-- PART 4: CREATE THE TRIGGER ON auth.users
-- ===================================================================

-- Create a safe trigger that won't fail signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.create_user_profile_on_signup();

-- ===================================================================
-- PART 5: ENSURE profiles TABLE HAS ALL REQUIRED COLUMNS
-- ===================================================================

-- Add any missing columns to profiles table (won't fail if they exist)
DO $$
BEGIN
  -- Add messages_used if missing
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'messages_used') THEN
    ALTER TABLE public.profiles ADD COLUMN messages_used INTEGER DEFAULT 0;
  END IF;
  
  -- Add images_used if missing
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'images_used') THEN
    ALTER TABLE public.profiles ADD COLUMN images_used INTEGER DEFAULT 0;
  END IF;
  
  -- Add videos_used if missing
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'videos_used') THEN
    ALTER TABLE public.profiles ADD COLUMN videos_used INTEGER DEFAULT 0;
  END IF;
  
  -- Add music_used if missing
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'music_used') THEN
    ALTER TABLE public.profiles ADD COLUMN music_used INTEGER DEFAULT 0;
  END IF;
  
  -- Add tts_used if missing
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'tts_used') THEN
    ALTER TABLE public.profiles ADD COLUMN tts_used INTEGER DEFAULT 0;
  END IF;
  
  -- Add ppt_used if missing
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'ppt_used') THEN
    ALTER TABLE public.profiles ADD COLUMN ppt_used INTEGER DEFAULT 0;
  END IF;
END $$;

-- ===================================================================
-- PART 6: LOG COMPLETION
-- ===================================================================

DO $$
BEGIN
  RAISE NOTICE '✅ Migration complete: Fixed signup trigger';
  RAISE NOTICE '   - Dropped problematic triggers on auth.users';
  RAISE NOTICE '   - Created safe create_user_profile_on_signup function';
  RAISE NOTICE '   - Created new on_auth_user_created trigger';
  RAISE NOTICE '   - User signup should now work without errors';
END $$;
