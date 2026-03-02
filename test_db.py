import os
import json
from supabase import create_client, Client
from dotenv import load_dotenv

load_dotenv(".env.local")
url = os.environ.get("NEXT_PUBLIC_SUPABASE_URL")
key = os.environ.get("NEXT_PUBLIC_SUPABASE_ANON_KEY", os.environ.get("SUPABASE_SERVICE_ROLE_KEY", ""))
if not key:
    key = os.environ.get("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY", "")
supabase: Client = create_client(url, key)

response = supabase.table("ai_summaries").select("last_scraped_at").order("last_scraped_at", desc=True).limit(1).execute()
print(response.data)
