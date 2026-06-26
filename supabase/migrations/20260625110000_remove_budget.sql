-- Drop the budget column from the inquiries table
ALTER TABLE public.inquiries DROP COLUMN IF EXISTS budget;
