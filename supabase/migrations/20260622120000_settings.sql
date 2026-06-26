-- Create settings table
CREATE TABLE IF NOT EXISTS public.settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL
);

-- Enable RLS and set policies
ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read settings" ON public.settings 
  FOR SELECT TO anon USING (true);

CREATE POLICY "Authenticated manage settings" ON public.settings 
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Insert default contact details
INSERT INTO public.settings (key, value) VALUES
  ('phone', '+91 98765 43210'),
  ('address', '3rd Floor, Jubilee Hills, Hyderabad — 500033'),
  ('email', 'contact@rajukoyyala-ca.in')
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value;

-- Grant permissions
GRANT SELECT ON public.settings TO anon;
GRANT ALL ON public.settings TO authenticated;
GRANT ALL ON public.settings TO service_role;
