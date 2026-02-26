-- Create Enum for target_accounts status
CREATE TYPE target_status AS ENUM ('active', 'syncing', 'paused');

-- Create Enum for ai_summaries status
CREATE TYPE summary_status AS ENUM ('success', 'warning', 'error');

-- target_accounts table
CREATE TABLE public.target_accounts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    bakery_name TEXT NOT NULL,
    instagram_id TEXT NOT NULL UNIQUE,
    category TEXT,
    status target_status DEFAULT 'active',
    last_scraped_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- posts table
CREATE TABLE public.posts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    target_account_id UUID REFERENCES public.target_accounts(id) ON DELETE CASCADE NOT NULL,
    instagram_post_id TEXT UNIQUE,
    post_content TEXT,
    post_url TEXT,
    published_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- ai_summaries table
CREATE TABLE public.ai_summaries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    target_account_id UUID REFERENCES public.target_accounts(id) ON DELETE CASCADE NOT NULL,
    summary JSONB,
    status summary_status DEFAULT 'success',
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Add updated_at trigger for target_accounts
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_target_accounts_updated_at
    BEFORE UPDATE ON public.target_accounts
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Enable RLS
ALTER TABLE public.target_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_summaries ENABLE ROW LEVEL SECURITY;

-- Temporary public access policies (allows all operations for both anon and authenticated)
-- target_accounts
CREATE POLICY "Enable read access for all users - target_accounts" ON public.target_accounts FOR SELECT USING (true);
CREATE POLICY "Enable insert access for all users - target_accounts" ON public.target_accounts FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update access for all users - target_accounts" ON public.target_accounts FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "Enable delete access for all users - target_accounts" ON public.target_accounts FOR DELETE USING (true);

-- posts
CREATE POLICY "Enable read access for all users - posts" ON public.posts FOR SELECT USING (true);
CREATE POLICY "Enable insert access for all users - posts" ON public.posts FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update access for all users - posts" ON public.posts FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "Enable delete access for all users - posts" ON public.posts FOR DELETE USING (true);

-- ai_summaries
CREATE POLICY "Enable read access for all users - ai_summaries" ON public.ai_summaries FOR SELECT USING (true);
CREATE POLICY "Enable insert access for all users - ai_summaries" ON public.ai_summaries FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update access for all users - ai_summaries" ON public.ai_summaries FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "Enable delete access for all users - ai_summaries" ON public.ai_summaries FOR DELETE USING (true);
