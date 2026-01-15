-- 政治・経済 Timeline Events Table
-- Run this SQL in your Supabase SQL Editor

CREATE TABLE IF NOT EXISTS politics_economics_events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  event_date DATE NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('政治', '経済', '国際関係', '社会政策', 'その他')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster filtering and searching
CREATE INDEX IF NOT EXISTS idx_event_date ON politics_economics_events(event_date DESC);
CREATE INDEX IF NOT EXISTS idx_category ON politics_economics_events(category);
CREATE INDEX IF NOT EXISTS idx_title_search ON politics_economics_events USING gin(to_tsvector('japanese', title));

-- Enable Row Level Security (optional but recommended)
ALTER TABLE politics_economics_events ENABLE ROW LEVEL SECURITY;

-- Policy to allow read access to all users
CREATE POLICY "Allow public read access" ON politics_economics_events
  FOR SELECT USING (true);

-- Policy to allow insert/update/delete (adjust based on your needs)
CREATE POLICY "Allow authenticated users to insert" ON politics_economics_events
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow authenticated users to update" ON politics_economics_events
  FOR UPDATE USING (true);

CREATE POLICY "Allow authenticated users to delete" ON politics_economics_events
  FOR DELETE USING (true);

-- Sample data for testing
INSERT INTO politics_economics_events (title, description, event_date, category) VALUES
  ('サンプルイベント1', '政治に関する説明1', '2024-06-15', '政治'),
  ('サンプルイベント2', '経済に関する説明2', '2024-07-20', '経済'),
  ('サンプルイベント3', '国際関係に関する説明3', '2024-08-10', '国際関係');