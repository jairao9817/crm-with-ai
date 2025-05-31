-- Contacts table
CREATE TABLE contacts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    phone VARCHAR(50),
    company VARCHAR(255),
    job_title VARCHAR(255),
    preferences JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    updated_by UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

-- Deals table
CREATE TABLE deals (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    contact_id UUID REFERENCES contacts(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    stage VARCHAR(50) CHECK (stage IN ('lead', 'prospect', 'negotiation', 'closed-won', 'closed-lost')) DEFAULT 'lead',
    monetary_value DECIMAL(15,2) DEFAULT 0,
    expected_close_date DATE,
    probability_percentage INTEGER CHECK (probability_percentage >= 0 AND probability_percentage <= 100) DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    updated_by UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

-- Indexes for better performance
CREATE INDEX idx_contacts_email ON contacts(email);
CREATE INDEX idx_contacts_company ON contacts(company);
CREATE INDEX idx_contacts_created_by ON contacts(created_by);
CREATE INDEX idx_deals_contact_id ON deals(contact_id);
CREATE INDEX idx_deals_user_id ON deals(user_id);
CREATE INDEX idx_deals_stage ON deals(stage);
CREATE INDEX idx_deals_created_by ON deals(created_by);

-- RLS (Row Level Security) policies
ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE deals ENABLE ROW LEVEL SECURITY;

-- Contacts policies - users can only see their own contacts
CREATE POLICY "Users can view own contacts" ON contacts FOR SELECT USING (created_by = auth.uid());
CREATE POLICY "Users can insert own contacts" ON contacts FOR INSERT WITH CHECK (created_by = auth.uid());
CREATE POLICY "Users can update own contacts" ON contacts FOR UPDATE USING (created_by = auth.uid());
CREATE POLICY "Users can delete own contacts" ON contacts FOR DELETE USING (created_by = auth.uid());

-- Deals policies - users can only see their own deals
CREATE POLICY "Users can view own deals" ON deals FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users can insert own deals" ON deals FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can update own deals" ON deals FOR UPDATE USING (user_id = auth.uid());
CREATE POLICY "Users can delete own deals" ON deals FOR DELETE USING (user_id = auth.uid());

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_contacts_updated_at BEFORE UPDATE ON contacts
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_deals_updated_at BEFORE UPDATE ON deals
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column(); 