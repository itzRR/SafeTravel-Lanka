-- SafeTravel Lanka - Database Schema

-- Create the community reports table
CREATE TABLE public.community_reports (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    type VARCHAR(50) NOT NULL,
    location VARCHAR(255) NOT NULL,
    district VARCHAR(100) NOT NULL,
    lat FLOAT NOT NULL,
    lng FLOAT NOT NULL,
    description TEXT NOT NULL,
    severity INTEGER NOT NULL CHECK (severity >= 1 AND severity <= 5),
    timestamp TIMESTAMPTZ DEFAULT NOW(),
    upvotes INTEGER DEFAULT 0,
    verified BOOLEAN DEFAULT FALSE,
    reporter_name VARCHAR(100) NOT NULL
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.community_reports ENABLE ROW LEVEL SECURITY;

-- Allow anyone to read the reports
CREATE POLICY "Allow public read access"
ON public.community_reports
FOR SELECT
TO anon
USING (true);

-- Allow anyone to submit a new report
CREATE POLICY "Allow public insert"
ON public.community_reports
FOR INSERT
TO anon
WITH CHECK (true);
