-- ============================================
-- Super KroniQ Usage Tracking Table
-- Run this in your Supabase SQL Editor
-- ============================================

-- Create usage_tracking table
CREATE TABLE IF NOT EXISTS public.usage_tracking (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    feature TEXT NOT NULL CHECK (feature IN ('chat', 'image', 'video', 'tts', 'ppt', 'code')),
    count INTEGER DEFAULT 1,
    period_start TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    lifetime_video_used BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Unique constraint for upsert operations
    UNIQUE(user_id, feature, period_start)
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_usage_tracking_user_feature 
ON public.usage_tracking(user_id, feature);

CREATE INDEX IF NOT EXISTS idx_usage_tracking_period 
ON public.usage_tracking(period_start);

-- Enable RLS
ALTER TABLE public.usage_tracking ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only see their own usage
CREATE POLICY "Users can view own usage" ON public.usage_tracking
    FOR SELECT USING (auth.uid() = user_id);

-- Policy: Users can insert their own usage
CREATE POLICY "Users can insert own usage" ON public.usage_tracking
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Policy: Users can update their own usage
CREATE POLICY "Users can update own usage" ON public.usage_tracking
    FOR UPDATE USING (auth.uid() = user_id);

-- ============================================
-- Function to increment usage (for upsert)
-- ============================================
CREATE OR REPLACE FUNCTION increment_usage_count(
    p_user_id UUID,
    p_feature TEXT,
    p_period_start TIMESTAMP WITH TIME ZONE
)
RETURNS void AS $$
BEGIN
    INSERT INTO public.usage_tracking (user_id, feature, count, period_start)
    VALUES (p_user_id, p_feature, 1, p_period_start)
    ON CONFLICT (user_id, feature, period_start)
    DO UPDATE SET 
        count = usage_tracking.count + 1,
        updated_at = NOW();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- Function to check if user can use feature
-- ============================================
CREATE OR REPLACE FUNCTION check_usage_limit(
    p_user_id UUID,
    p_feature TEXT,
    p_limit INTEGER,
    p_period_start TIMESTAMP WITH TIME ZONE
)
RETURNS TABLE (
    allowed BOOLEAN,
    current_count INTEGER,
    remaining INTEGER
) AS $$
DECLARE
    v_count INTEGER;
BEGIN
    SELECT COALESCE(SUM(count), 0) INTO v_count
    FROM public.usage_tracking
    WHERE user_id = p_user_id
      AND feature = p_feature
      AND period_start >= p_period_start;
    
    RETURN QUERY SELECT 
        v_count < p_limit AS allowed,
        v_count AS current_count,
        GREATEST(0, p_limit - v_count) AS remaining;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- Grant permissions
-- ============================================
GRANT ALL ON public.usage_tracking TO authenticated;
GRANT EXECUTE ON FUNCTION increment_usage_count TO authenticated;
GRANT EXECUTE ON FUNCTION check_usage_limit TO authenticated;
