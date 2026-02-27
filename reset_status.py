import os
from supabase import create_client, Client
from dotenv import load_dotenv

load_dotenv(override=True)
supabase_url = os.environ.get("NEXT_PUBLIC_SUPABASE_URL")
supabase_key = os.environ.get("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY")
supabase: Client = create_client(supabase_url, supabase_key)

try:
    supabase.table("target_accounts").update({"status": "active"}).eq("status", "syncing").execute()
    print("Reset status to active.")
except Exception as e:
    print(f"Error: {e}")
