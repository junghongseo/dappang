-- Drop the category column from target_accounts
ALTER TABLE public.target_accounts DROP COLUMN IF EXISTS category;
