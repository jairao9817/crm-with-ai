-- Embedding Documents table for storing user-provided content for embeddings
CREATE TABLE IF NOT EXISTS embedding_documents (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    type TEXT DEFAULT 'knowledge' CHECK (type IN ('knowledge', 'faq', 'policy', 'procedure', 'other')),
    source TEXT DEFAULT 'manual' CHECK (source IN ('manual', 'import', 'api')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_embedding_documents_user_id ON embedding_documents(user_id);
CREATE INDEX IF NOT EXISTS idx_embedding_documents_type ON embedding_documents(type);
CREATE INDEX IF NOT EXISTS idx_embedding_documents_created_at ON embedding_documents(created_at);

-- Enable Row Level Security (RLS)
ALTER TABLE embedding_documents ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can only access their own embedding documents" ON embedding_documents
    FOR ALL USING (auth.uid() = user_id);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_embedding_documents_updated_at
    BEFORE UPDATE ON embedding_documents
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column(); 