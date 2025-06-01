-- Migration: Add Communication Notes Table
-- Run this script in your Supabase SQL editor

-- Drop table if exists (for development only)
-- DROP TABLE IF EXISTS communication_notes;

-- Communication Notes table for storing notes about user replies
CREATE TABLE IF NOT EXISTS communication_notes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    communication_id UUID REFERENCES communications(id) ON DELETE CASCADE NOT NULL,
    note_content TEXT NOT NULL,
    note_type VARCHAR(50) CHECK (note_type IN ('reply', 'follow_up', 'general', 'important')) DEFAULT 'reply',
    created_by UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for better performance
CREATE INDEX IF NOT EXISTS idx_communication_notes_communication_id ON communication_notes(communication_id);
CREATE INDEX IF NOT EXISTS idx_communication_notes_created_by ON communication_notes(created_by);
CREATE INDEX IF NOT EXISTS idx_communication_notes_type ON communication_notes(note_type);
CREATE INDEX IF NOT EXISTS idx_communication_notes_created_at ON communication_notes(created_at);

-- RLS (Row Level Security) policies
ALTER TABLE communication_notes ENABLE ROW LEVEL SECURITY;

-- Communication notes policies - users can only see their own notes
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'communication_notes' 
        AND policyname = 'Users can view own communication notes'
    ) THEN
        CREATE POLICY "Users can view own communication notes" ON communication_notes FOR SELECT USING (created_by = auth.uid());
    END IF;
END
$$;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'communication_notes' 
        AND policyname = 'Users can insert own communication notes'
    ) THEN
        CREATE POLICY "Users can insert own communication notes" ON communication_notes FOR INSERT WITH CHECK (created_by = auth.uid());
    END IF;
END
$$;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'communication_notes' 
        AND policyname = 'Users can update own communication notes'
    ) THEN
        CREATE POLICY "Users can update own communication notes" ON communication_notes FOR UPDATE USING (created_by = auth.uid());
    END IF;
END
$$;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'communication_notes' 
        AND policyname = 'Users can delete own communication notes'
    ) THEN
        CREATE POLICY "Users can delete own communication notes" ON communication_notes FOR DELETE USING (created_by = auth.uid());
    END IF;
END
$$;

-- Create trigger for updated_at (only if the function exists)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'update_updated_at_column') THEN
        CREATE TRIGGER update_communication_notes_updated_at 
        BEFORE UPDATE ON communication_notes
        FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;
END
$$; 