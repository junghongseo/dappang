import os
from supabase import create_client
from dotenv import load_dotenv

load_dotenv()
supabase = create_client(os.environ['NEXT_PUBLIC_SUPABASE_URL'], os.environ['NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY'])

response = supabase.table('target_accounts').select('id, bakery_name, instagram_id, status, last_scraped_at').execute()
print(f"Anon key fetch count: {len(response.data)}")
