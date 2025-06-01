-- AI Features Database Schema Setup Script
-- Run this script in your Supabase SQL editor to set up AI features
-- This script is safe to run multiple times (uses IF NOT EXISTS)

-- Contact Personas table for storing AI-generated behavioral profiles
CREATE TABLE IF NOT EXISTS contact_personas (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    contact_id UUID REFERENCES contacts(id) ON DELETE CASCADE NOT NULL,
    persona_summary TEXT NOT NULL,
    behavioral_traits TEXT[] NOT NULL DEFAULT '{}',
    communication_preferences TEXT[] NOT NULL DEFAULT '{}',
    buying_patterns TEXT[] NOT NULL DEFAULT '{}',
    generated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Deal Coach Suggestions table for storing AI coaching advice
CREATE TABLE IF NOT EXISTS deal_coach_suggestions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    deal_id UUID REFERENCES deals(id) ON DELETE CASCADE NOT NULL,
    suggestions TEXT NOT NULL,
    context_data JSONB DEFAULT '{}',
    generated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Objection Responses table for storing AI objection handling responses
CREATE TABLE IF NOT EXISTS objection_responses (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    objection TEXT NOT NULL,
    suggested_response TEXT NOT NULL,
    response_strategy TEXT NOT NULL,
    tone TEXT NOT NULL,
    key_points TEXT[] NOT NULL DEFAULT '{}',
    context_data JSONB DEFAULT '{}',
    generated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Win-Loss Analyses table for storing AI win-loss explanations
CREATE TABLE IF NOT EXISTS win_loss_analyses (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    deal_id UUID REFERENCES deals(id) ON DELETE CASCADE NOT NULL,
    outcome TEXT NOT NULL CHECK (outcome IN ('won', 'lost')),
    explanation TEXT NOT NULL,
    key_factors TEXT[] NOT NULL DEFAULT '{}',
    lessons_learned TEXT[] NOT NULL DEFAULT '{}',
    context_data JSONB DEFAULT '{}',
    generated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_contact_personas_contact_id ON contact_personas(contact_id);
CREATE INDEX IF NOT EXISTS idx_contact_personas_created_by ON contact_personas(created_by);
CREATE INDEX IF NOT EXISTS idx_contact_personas_generated_at ON contact_personas(generated_at DESC);

CREATE INDEX IF NOT EXISTS idx_deal_coach_suggestions_deal_id ON deal_coach_suggestions(deal_id);
CREATE INDEX IF NOT EXISTS idx_deal_coach_suggestions_created_by ON deal_coach_suggestions(created_by);
CREATE INDEX IF NOT EXISTS idx_deal_coach_suggestions_generated_at ON deal_coach_suggestions(generated_at DESC);

CREATE INDEX IF NOT EXISTS idx_objection_responses_created_by ON objection_responses(created_by);
CREATE INDEX IF NOT EXISTS idx_objection_responses_generated_at ON objection_responses(generated_at DESC);
CREATE INDEX IF NOT EXISTS idx_objection_responses_objection_text ON objection_responses USING gin(to_tsvector('english', objection));

CREATE INDEX IF NOT EXISTS idx_win_loss_analyses_deal_id ON win_loss_analyses(deal_id);
CREATE INDEX IF NOT EXISTS idx_win_loss_analyses_created_by ON win_loss_analyses(created_by);
CREATE INDEX IF NOT EXISTS idx_win_loss_analyses_generated_at ON win_loss_analyses(generated_at DESC);
CREATE INDEX IF NOT EXISTS idx_win_loss_analyses_outcome ON win_loss_analyses(outcome);

-- Enable Row Level Security (RLS) on all tables
ALTER TABLE contact_personas ENABLE ROW LEVEL SECURITY;
ALTER TABLE deal_coach_suggestions ENABLE ROW LEVEL SECURITY;
ALTER TABLE objection_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE win_loss_analyses ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for contact_personas
CREATE POLICY IF NOT EXISTS "Users can view their own contact personas" ON contact_personas
    FOR SELECT USING (auth.uid() = created_by);

CREATE POLICY IF NOT EXISTS "Users can insert their own contact personas" ON contact_personas
    FOR INSERT WITH CHECK (auth.uid() = created_by);

CREATE POLICY IF NOT EXISTS "Users can update their own contact personas" ON contact_personas
    FOR UPDATE USING (auth.uid() = created_by);

CREATE POLICY IF NOT EXISTS "Users can delete their own contact personas" ON contact_personas
    FOR DELETE USING (auth.uid() = created_by);

-- Create RLS policies for deal_coach_suggestions
CREATE POLICY IF NOT EXISTS "Users can view their own deal coach suggestions" ON deal_coach_suggestions
    FOR SELECT USING (auth.uid() = created_by);

CREATE POLICY IF NOT EXISTS "Users can insert their own deal coach suggestions" ON deal_coach_suggestions
    FOR INSERT WITH CHECK (auth.uid() = created_by);

CREATE POLICY IF NOT EXISTS "Users can update their own deal coach suggestions" ON deal_coach_suggestions
    FOR UPDATE USING (auth.uid() = created_by);

CREATE POLICY IF NOT EXISTS "Users can delete their own deal coach suggestions" ON deal_coach_suggestions
    FOR DELETE USING (auth.uid() = created_by);

-- Create RLS policies for objection_responses
CREATE POLICY IF NOT EXISTS "Users can view their own objection responses" ON objection_responses
    FOR SELECT USING (auth.uid() = created_by);

CREATE POLICY IF NOT EXISTS "Users can insert their own objection responses" ON objection_responses
    FOR INSERT WITH CHECK (auth.uid() = created_by);

CREATE POLICY IF NOT EXISTS "Users can update their own objection responses" ON objection_responses
    FOR UPDATE USING (auth.uid() = created_by);

CREATE POLICY IF NOT EXISTS "Users can delete their own objection responses" ON objection_responses
    FOR DELETE USING (auth.uid() = created_by);

-- Create RLS policies for win_loss_analyses
CREATE POLICY IF NOT EXISTS "Users can view their own win loss analyses" ON win_loss_analyses
    FOR SELECT USING (auth.uid() = created_by);

CREATE POLICY IF NOT EXISTS "Users can insert their own win loss analyses" ON win_loss_analyses
    FOR INSERT WITH CHECK (auth.uid() = created_by);

CREATE POLICY IF NOT EXISTS "Users can update their own win loss analyses" ON win_loss_analyses
    FOR UPDATE USING (auth.uid() = created_by);

CREATE POLICY IF NOT EXISTS "Users can delete their own win loss analyses" ON win_loss_analyses
    FOR DELETE USING (auth.uid() = created_by);

-- Create functions to automatically update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at columns
CREATE TRIGGER IF NOT EXISTS update_contact_personas_updated_at 
    BEFORE UPDATE ON contact_personas 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER IF NOT EXISTS update_deal_coach_suggestions_updated_at 
    BEFORE UPDATE ON deal_coach_suggestions 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER IF NOT EXISTS update_objection_responses_updated_at 
    BEFORE UPDATE ON objection_responses 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER IF NOT EXISTS update_win_loss_analyses_updated_at 
    BEFORE UPDATE ON win_loss_analyses 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Grant necessary permissions (adjust as needed for your setup)
GRANT ALL ON contact_personas TO authenticated;
GRANT ALL ON deal_coach_suggestions TO authenticated;
GRANT ALL ON objection_responses TO authenticated;
GRANT ALL ON win_loss_analyses TO authenticated;

-- Success message
SELECT 'AI Features database schema setup completed successfully!' as message; 