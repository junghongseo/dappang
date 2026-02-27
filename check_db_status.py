import os
from supabase import create_client
from dotenv import load_dotenv

load_dotenv()
supabase_url = os.environ.get("NEXT_PUBLIC_SUPABASE_URL")
supabase_key = os.environ.get("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY")
supabase = create_client(supabase_url, supabase_key)

targets = supabase.table("target_accounts").select("id, status").execute().data
total = len(targets)
syncing = len([t for t in targets if t['status'] == 'syncing'])
print(f"Total targets: {total}")
print(f"Syncing targets: {syncing}")

status = supabase.table("system_status").select("*").execute().data
print(f"System status: {status}")
