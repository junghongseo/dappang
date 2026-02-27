import os
from supabase import create_client
from dotenv import load_dotenv

load_dotenv()
supabase_url = os.environ.get("NEXT_PUBLIC_SUPABASE_URL")
supabase_key = os.environ.get("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY")
supabase = create_client(supabase_url, supabase_key)

targets = supabase.table("target_accounts").select("*").execute().data
for t in targets:
    print(f"Target: {t['instagram_id']}, Status: {t['status']}, Last Scraped: {t['last_scraped_at']}")

summaries = supabase.table("ai_summaries").select("*").execute().data
print(f"Summaries count: {len(summaries)}")
for s in summaries:
    print(f"Summary ID: {s['id']}, Target ID: {s['target_account_id']}, Status: {s['status']}, Created: {s['created_at']}")
