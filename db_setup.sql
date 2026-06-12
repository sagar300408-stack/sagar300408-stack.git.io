-- ==========================================
-- Database Setup Script for Originyx
-- Run this in your Supabase SQL Editor
-- ==========================================

-- 1. Create the project_requests table
CREATE TABLE IF NOT EXISTS public.project_requests (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  business_name TEXT NOT NULL,
  phone TEXT,
  industry TEXT NOT NULL,
  project_type TEXT NOT NULL,
  workflow_description TEXT NOT NULL,
  challenges TEXT NOT NULL,
  desired_outcome TEXT NOT NULL,
  notes TEXT,
  status TEXT DEFAULT 'New' NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  source_page TEXT,
  source_cta TEXT,
  product_interest TEXT,
  lead_score INTEGER DEFAULT 0
);

-- 2. Enable Row Level Security (RLS)
ALTER TABLE public.project_requests ENABLE ROW LEVEL SECURITY;

-- 3. Create RLS Policies
-- Policy to allow authenticated users to submit project requests
CREATE POLICY "Allow authenticated users to insert own project requests" ON public.project_requests
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Policy to allow authenticated users to view their own project requests
CREATE POLICY "Allow authenticated users to view own project requests" ON public.project_requests
  FOR SELECT USING (auth.uid() = user_id);

-- 4. Enable indexes for performance on foreign keys and emails
CREATE INDEX IF NOT EXISTS idx_project_requests_user_id ON public.project_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_project_requests_email ON public.project_requests(email);
