-- Add missing columns to matches table
-- Run this SQL in your Supabase SQL Editor

-- Add match_time column (TEXT type for storing match time as HH:MM)
ALTER TABLE matches
ADD COLUMN IF NOT EXISTS match_time TEXT;

-- Add difficulty_score columns
ALTER TABLE matches
ADD COLUMN IF NOT EXISTS difficulty_score_a NUMERIC DEFAULT 3,
ADD COLUMN IF NOT EXISTS difficulty_score_b NUMERIC DEFAULT 5;

-- Add comments for clarity
COMMENT ON COLUMN matches.match_time IS 'Match time (HH:MM format as text)';
COMMENT ON COLUMN matches.difficulty_score_a IS 'Difficulty score for team A (1-10)';
COMMENT ON COLUMN matches.difficulty_score_b IS 'Difficulty score for team B (1-10)';

