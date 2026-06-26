
CREATE TABLE IF NOT EXISTS public.inquiries (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT,
  service TEXT,
  budget TEXT,
  deadline DATE,
  notes TEXT,
  status TEXT DEFAULT 'new' CHECK (status IN ('new','contacted','in-progress','completed')),
  source TEXT DEFAULT 'website' CHECK (source IN ('website','walk-in','phone','referral')),
  assigned_to TEXT,
  payment_status TEXT DEFAULT 'not paid' CHECK (payment_status IN ('not paid','partially paid','fully paid')),
  amount_received NUMERIC(10,2) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.inquiries TO authenticated;
GRANT INSERT ON public.inquiries TO anon;
GRANT ALL ON public.inquiries TO service_role;
ALTER TABLE public.inquiries ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can submit inquiries" ON public.inquiries FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "Authenticated view inquiries" ON public.inquiries FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated insert inquiries" ON public.inquiries FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated update inquiries" ON public.inquiries FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Authenticated delete inquiries" ON public.inquiries FOR DELETE TO authenticated USING (true);

CREATE OR REPLACE FUNCTION public.update_inquiries_updated_at()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$ LANGUAGE plpgsql SET search_path = public;
CREATE TRIGGER inquiries_updated_at BEFORE UPDATE ON public.inquiries
  FOR EACH ROW EXECUTE FUNCTION public.update_inquiries_updated_at();

CREATE TABLE IF NOT EXISTS public.broadcasts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  subject TEXT NOT NULL,
  body TEXT NOT NULL,
  type TEXT DEFAULT 'email' CHECK (type IN ('email','whatsapp','both')),
  sent_by UUID REFERENCES auth.users(id),
  sent_at TIMESTAMPTZ DEFAULT now(),
  recipient_count INT DEFAULT 0
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.broadcasts TO authenticated;
GRANT ALL ON public.broadcasts TO service_role;
ALTER TABLE public.broadcasts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated manage broadcasts" ON public.broadcasts FOR ALL TO authenticated USING (true) WITH CHECK (true);
