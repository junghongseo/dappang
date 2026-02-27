-- Create system_status table
CREATE TABLE public.system_status (
    id TEXT PRIMARY KEY,
    is_crawling BOOLEAN DEFAULT false,
    updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Insert initial row
INSERT INTO public.system_status (id, is_crawling) VALUES ('global', false);

-- Add updated_at trigger
CREATE TRIGGER update_system_status_updated_at
    BEFORE UPDATE ON public.system_status
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Enable RLS
ALTER TABLE public.system_status ENABLE ROW LEVEL SECURITY;

-- Enable public access policies (allows all operations for both anon and authenticated)
CREATE POLICY "Enable read access for all users - system_status" ON public.system_status FOR SELECT USING (true);
CREATE POLICY "Enable update access for all users - system_status" ON public.system_status FOR UPDATE USING (true) WITH CHECK (true);

-- Enable Realtime for the table
ALTER PUBLICATION supabase_realtime ADD TABLE system_status;
