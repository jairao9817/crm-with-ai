-- Phase 4: Communication Notes Feature

-- Communication Notes table for storing notes about user replies
CREATE TABLE communication_notes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    communication_id UUID REFERENCES communications(id) ON DELETE CASCADE NOT NULL,
    note_content TEXT NOT NULL,
    note_type VARCHAR(50) CHECK (note_type IN ('reply', 'follow_up', 'general', 'important')) DEFAULT 'reply',
    created_by UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for better performance
CREATE INDEX idx_communication_notes_communication_id ON communication_notes(communication_id);
CREATE INDEX idx_communication_notes_created_by ON communication_notes(created_by);
CREATE INDEX idx_communication_notes_type ON communication_notes(note_type);
CREATE INDEX idx_communication_notes_created_at ON communication_notes(created_at);

-- RLS (Row Level Security) policies
ALTER TABLE communication_notes ENABLE ROW LEVEL SECURITY;

-- Communication notes policies - users can only see their own notes
CREATE POLICY "Users can view own communication notes" ON communication_notes FOR SELECT USING (created_by = auth.uid());
CREATE POLICY "Users can insert own communication notes" ON communication_notes FOR INSERT WITH CHECK (created_by = auth.uid());
CREATE POLICY "Users can update own communication notes" ON communication_notes FOR UPDATE USING (created_by = auth.uid());
CREATE POLICY "Users can delete own communication notes" ON communication_notes FOR DELETE USING (created_by = auth.uid());

-- Create trigger for updated_at
CREATE TRIGGER update_communication_notes_updated_at BEFORE UPDATE ON communication_notes
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column(); 