-- Setup script for user settings table
-- Run this in your Supabase SQL editor

-- User Settings table
CREATE TABLE IF NOT EXISTS user_settings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
    openai_api_key TEXT,
    preferences JSONB DEFAULT '{
        "notifications": {
            "emailNotifications": true,
            "pushNotifications": false,
            "marketingEmails": false,
            "securityAlerts": true
        },
        "privacy": {
            "profileVisibility": "private",
            "dataSharing": false,
            "analyticsTracking": true
        },
        "preferences": {
            "language": "en",
            "timezone": "UTC",
            "dateFormat": "MM/DD/YYYY",
            "currency": "USD"
        }
    }',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for better performance
CREATE INDEX IF NOT EXISTS idx_user_settings_user_id ON user_settings(user_id);

-- RLS (Row Level Security) policies
ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (for re-running the script)
DROP POLICY IF EXISTS "Users can view own settings" ON user_settings;
DROP POLICY IF EXISTS "Users can insert own settings" ON user_settings;
DROP POLICY IF EXISTS "Users can update own settings" ON user_settings;
DROP POLICY IF EXISTS "Users can delete own settings" ON user_settings;

-- User settings policies - users can only see their own settings
CREATE POLICY "Users can view own settings" ON user_settings FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users can insert own settings" ON user_settings FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can update own settings" ON user_settings FOR UPDATE USING (user_id = auth.uid());
CREATE POLICY "Users can delete own settings" ON user_settings FOR DELETE USING (user_id = auth.uid());

-- Create trigger for updated_at (only if the function exists)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'update_updated_at_column') THEN
        DROP TRIGGER IF EXISTS update_user_settings_updated_at ON user_settings;
        CREATE TRIGGER update_user_settings_updated_at 
            BEFORE UPDATE ON user_settings
            FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;
END $$;

-- Verify the table was created successfully
SELECT 'User settings table created successfully!' as status; 