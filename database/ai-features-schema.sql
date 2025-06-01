-- AI Features Database Schema
-- Run this script in your Supabase SQL editor

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

-- Deal Coach Suggestions table for storing AI-generated deal coaching advice
CREATE TABLE IF NOT EXISTS deal_coach_suggestions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    deal_id UUID REFERENCES deals(id) ON DELETE CASCADE NOT NULL,
    suggestions TEXT NOT NULL,
    deal_context JSONB DEFAULT '{}',
    generated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Objection Handler Responses table for storing AI-generated objection responses
CREATE TABLE IF NOT EXISTS objection_responses (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    objection TEXT NOT NULL,
    suggested_response TEXT NOT NULL,
    response_strategy VARCHAR(255) NOT NULL,
    key_points TEXT[] NOT NULL DEFAULT '{}',
    tone VARCHAR(50) CHECK (tone IN ('professional', 'empathetic', 'confident', 'consultative')) DEFAULT 'professional',
    context_data JSONB DEFAULT '{}',
    generated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Win-Loss Analysis table for storing AI-generated deal analysis
CREATE TABLE IF NOT EXISTS win_loss_analyses (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    deal_id UUID REFERENCES deals(id) ON DELETE CASCADE NOT NULL,
    outcome VARCHAR(10) CHECK (outcome IN ('won', 'lost')) NOT NULL,
    explanation TEXT NOT NULL,
    key_factors TEXT[] NOT NULL DEFAULT '{}',
    lessons_learned TEXT[] NOT NULL DEFAULT '{}',
    recommendations TEXT[] NOT NULL DEFAULT '{}',
    confidence_score INTEGER CHECK (confidence_score >= 1 AND confidence_score <= 100) DEFAULT 50,
    context_data JSONB DEFAULT '{}',
    generated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for better performance
CREATE INDEX IF NOT EXISTS idx_contact_personas_contact_id ON contact_personas(contact_id);
CREATE INDEX IF NOT EXISTS idx_contact_personas_created_by ON contact_personas(created_by);
CREATE INDEX IF NOT EXISTS idx_contact_personas_generated_at ON contact_personas(generated_at);

CREATE INDEX IF NOT EXISTS idx_deal_coach_suggestions_deal_id ON deal_coach_suggestions(deal_id);
CREATE INDEX IF NOT EXISTS idx_deal_coach_suggestions_created_by ON deal_coach_suggestions(created_by);
CREATE INDEX IF NOT EXISTS idx_deal_coach_suggestions_generated_at ON deal_coach_suggestions(generated_at);

CREATE INDEX IF NOT EXISTS idx_objection_responses_created_by ON objection_responses(created_by);
CREATE INDEX IF NOT EXISTS idx_objection_responses_generated_at ON objection_responses(generated_at);
CREATE INDEX IF NOT EXISTS idx_objection_responses_tone ON objection_responses(tone);

CREATE INDEX IF NOT EXISTS idx_win_loss_analyses_deal_id ON win_loss_analyses(deal_id);
CREATE INDEX IF NOT EXISTS idx_win_loss_analyses_created_by ON win_loss_analyses(created_by);
CREATE INDEX IF NOT EXISTS idx_win_loss_analyses_outcome ON win_loss_analyses(outcome);
CREATE INDEX IF NOT EXISTS idx_win_loss_analyses_generated_at ON win_loss_analyses(generated_at);

-- RLS (Row Level Security) policies
ALTER TABLE contact_personas ENABLE ROW LEVEL SECURITY;
ALTER TABLE deal_coach_suggestions ENABLE ROW LEVEL SECURITY;
ALTER TABLE objection_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE win_loss_analyses ENABLE ROW LEVEL SECURITY;

-- Contact Personas policies - users can only see their own personas
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'contact_personas' 
        AND policyname = 'Users can view own contact personas'
    ) THEN
        CREATE POLICY "Users can view own contact personas" ON contact_personas FOR SELECT USING (created_by = auth.uid());
    END IF;
END
$$;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'contact_personas' 
        AND policyname = 'Users can insert own contact personas'
    ) THEN
        CREATE POLICY "Users can insert own contact personas" ON contact_personas FOR INSERT WITH CHECK (created_by = auth.uid());
    END IF;
END
$$;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'contact_personas' 
        AND policyname = 'Users can update own contact personas'
    ) THEN
        CREATE POLICY "Users can update own contact personas" ON contact_personas FOR UPDATE USING (created_by = auth.uid());
    END IF;
END
$$;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'contact_personas' 
        AND policyname = 'Users can delete own contact personas'
    ) THEN
        CREATE POLICY "Users can delete own contact personas" ON contact_personas FOR DELETE USING (created_by = auth.uid());
    END IF;
END
$$;

-- Deal Coach Suggestions policies - users can only see their own suggestions
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'deal_coach_suggestions' 
        AND policyname = 'Users can view own deal coach suggestions'
    ) THEN
        CREATE POLICY "Users can view own deal coach suggestions" ON deal_coach_suggestions FOR SELECT USING (created_by = auth.uid());
    END IF;
END
$$;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'deal_coach_suggestions' 
        AND policyname = 'Users can insert own deal coach suggestions'
    ) THEN
        CREATE POLICY "Users can insert own deal coach suggestions" ON deal_coach_suggestions FOR INSERT WITH CHECK (created_by = auth.uid());
    END IF;
END
$$;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'deal_coach_suggestions' 
        AND policyname = 'Users can update own deal coach suggestions'
    ) THEN
        CREATE POLICY "Users can update own deal coach suggestions" ON deal_coach_suggestions FOR UPDATE USING (created_by = auth.uid());
    END IF;
END
$$;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'deal_coach_suggestions' 
        AND policyname = 'Users can delete own deal coach suggestions'
    ) THEN
        CREATE POLICY "Users can delete own deal coach suggestions" ON deal_coach_suggestions FOR DELETE USING (created_by = auth.uid());
    END IF;
END
$$;

-- Objection Responses policies - users can only see their own responses
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'objection_responses' 
        AND policyname = 'Users can view own objection responses'
    ) THEN
        CREATE POLICY "Users can view own objection responses" ON objection_responses FOR SELECT USING (created_by = auth.uid());
    END IF;
END
$$;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'objection_responses' 
        AND policyname = 'Users can insert own objection responses'
    ) THEN
        CREATE POLICY "Users can insert own objection responses" ON objection_responses FOR INSERT WITH CHECK (created_by = auth.uid());
    END IF;
END
$$;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'objection_responses' 
        AND policyname = 'Users can update own objection responses'
    ) THEN
        CREATE POLICY "Users can update own objection responses" ON objection_responses FOR UPDATE USING (created_by = auth.uid());
    END IF;
END
$$;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'objection_responses' 
        AND policyname = 'Users can delete own objection responses'
    ) THEN
        CREATE POLICY "Users can delete own objection responses" ON objection_responses FOR DELETE USING (created_by = auth.uid());
    END IF;
END
$$;

-- Win-Loss Analyses policies - users can only see their own analyses
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'win_loss_analyses' 
        AND policyname = 'Users can view own win loss analyses'
    ) THEN
        CREATE POLICY "Users can view own win loss analyses" ON win_loss_analyses FOR SELECT USING (created_by = auth.uid());
    END IF;
END
$$;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'win_loss_analyses' 
        AND policyname = 'Users can insert own win loss analyses'
    ) THEN
        CREATE POLICY "Users can insert own win loss analyses" ON win_loss_analyses FOR INSERT WITH CHECK (created_by = auth.uid());
    END IF;
END
$$;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'win_loss_analyses' 
        AND policyname = 'Users can update own win loss analyses'
    ) THEN
        CREATE POLICY "Users can update own win loss analyses" ON win_loss_analyses FOR UPDATE USING (created_by = auth.uid());
    END IF;
END
$$;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'win_loss_analyses' 
        AND policyname = 'Users can delete own win loss analyses'
    ) THEN
        CREATE POLICY "Users can delete own win loss analyses" ON win_loss_analyses FOR DELETE USING (created_by = auth.uid());
    END IF;
END
$$;

-- Create triggers for updated_at
CREATE TRIGGER update_contact_personas_updated_at BEFORE UPDATE ON contact_personas
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_deal_coach_suggestions_updated_at BEFORE UPDATE ON deal_coach_suggestions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_objection_responses_updated_at BEFORE UPDATE ON objection_responses
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_win_loss_analyses_updated_at BEFORE UPDATE ON win_loss_analyses
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column(); 