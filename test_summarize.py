import asyncio
import os
import sys
from dotenv import load_dotenv
from supabase import create_client, Client
from google import genai

# Load environment
load_dotenv(".env.local")
RAPIDAPI_KEY = os.environ.get("RAPIDAPI_KEY")
GEMINI_API_KEY = os.environ.get("GEMINI_API_KEY")
SUPABASE_URL = os.environ.get("NEXT_PUBLIC_SUPABASE_URL")
SUPABASE_KEY = os.environ.get("SUPABASE_SERVICE_ROLE_KEY", os.environ.get("NEXT_PUBLIC_SUPABASE_ANON_KEY", ""))

if not SUPABASE_KEY:
    SUPABASE_KEY = os.environ.get("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY", "")

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)
client = genai.Client(api_key=GEMINI_API_KEY)

# Use existing module
sys.path.append(os.path.join(os.path.dirname(__file__), 'execution'))
from summarize_posts import process_target

async def main():
    print("Fetching all active target accounts...")
    response = supabase.table("target_accounts") \
        .select("id, instagram_id, bakery_name") \
        .eq("status", "active") \
        .execute()
    
    targets = response.data
    print(f"Found {len(targets)} active accounts. Running AI summarization...")
    
    from datetime import datetime, timezone
    current_date_str = datetime.now(timezone.utc).strftime("%Y년 %m월 %d일")
    
    tasks = []
    for tgt in targets:
        tasks.append(process_target(tgt, client, current_date_str))
    
    await asyncio.gather(*tasks)
    print("Summary extraction completed successfully via process_target.")

if __name__ == '__main__':
    asyncio.run(main())
