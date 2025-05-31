-- Phase 3: Tasks, Communications, and Purchase History Tables

-- Tasks table
CREATE TABLE tasks (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    deal_id UUID REFERENCES deals(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    due_date DATE,
    status VARCHAR(50) CHECK (status IN ('pending', 'completed', 'overdue')) DEFAULT 'pending',
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Communications table
CREATE TABLE communications (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    contact_id UUID REFERENCES contacts(id) ON DELETE CASCADE NOT NULL,
    deal_id UUID REFERENCES deals(id) ON DELETE CASCADE,
    type VARCHAR(50) CHECK (type IN ('phone_call', 'email', 'meeting', 'note')) NOT NULL,
    subject VARCHAR(255),
    content TEXT,
    communication_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Purchase History table
CREATE TABLE purchase_history (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    contact_id UUID REFERENCES contacts(id) ON DELETE CASCADE NOT NULL,
    deal_id UUID REFERENCES deals(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    amount DECIMAL(15,2) NOT NULL,
    product_service VARCHAR(255) NOT NULL,
    status VARCHAR(50) CHECK (status IN ('completed', 'pending', 'refunded', 'cancelled')) DEFAULT 'completed',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

-- Indexes for better performance
CREATE INDEX idx_tasks_deal_id ON tasks(deal_id);
CREATE INDEX idx_tasks_user_id ON tasks(user_id);
CREATE INDEX idx_tasks_status ON tasks(status);
CREATE INDEX idx_tasks_due_date ON tasks(due_date);

CREATE INDEX idx_communications_contact_id ON communications(contact_id);
CREATE INDEX idx_communications_deal_id ON communications(deal_id);
CREATE INDEX idx_communications_user_id ON communications(user_id);
CREATE INDEX idx_communications_type ON communications(type);
CREATE INDEX idx_communications_date ON communications(communication_date);

CREATE INDEX idx_purchase_history_contact_id ON purchase_history(contact_id);
CREATE INDEX idx_purchase_history_deal_id ON purchase_history(deal_id);
CREATE INDEX idx_purchase_history_date ON purchase_history(date);
CREATE INDEX idx_purchase_history_status ON purchase_history(status);

-- RLS (Row Level Security) policies
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE communications ENABLE ROW LEVEL SECURITY;
ALTER TABLE purchase_history ENABLE ROW LEVEL SECURITY;

-- Tasks policies - users can only see their own tasks
CREATE POLICY "Users can view own tasks" ON tasks FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users can insert own tasks" ON tasks FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can update own tasks" ON tasks FOR UPDATE USING (user_id = auth.uid());
CREATE POLICY "Users can delete own tasks" ON tasks FOR DELETE USING (user_id = auth.uid());

-- Communications policies - users can only see their own communications
CREATE POLICY "Users can view own communications" ON communications FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users can insert own communications" ON communications FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can update own communications" ON communications FOR UPDATE USING (user_id = auth.uid());
CREATE POLICY "Users can delete own communications" ON communications FOR DELETE USING (user_id = auth.uid());

-- Purchase history policies - users can only see their own purchase history
CREATE POLICY "Users can view own purchase history" ON purchase_history FOR SELECT USING (created_by = auth.uid());
CREATE POLICY "Users can insert own purchase history" ON purchase_history FOR INSERT WITH CHECK (created_by = auth.uid());
CREATE POLICY "Users can update own purchase history" ON purchase_history FOR UPDATE USING (created_by = auth.uid());
CREATE POLICY "Users can delete own purchase history" ON purchase_history FOR DELETE USING (created_by = auth.uid());

-- Create triggers for updated_at
CREATE TRIGGER update_tasks_updated_at BEFORE UPDATE ON tasks
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_communications_updated_at BEFORE UPDATE ON communications
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_purchase_history_updated_at BEFORE UPDATE ON purchase_history
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column(); 