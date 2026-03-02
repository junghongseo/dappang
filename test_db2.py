import json
import os
from supabase import create_client

def main():
    try:
        from dotenv import load_dotenv
        load_dotenv('.env.local')
    except:
        pass

    url = os.environ.get("NEXT_PUBLIC_SUPABASE_URL")
    key = os.environ.get("SUPABASE_SERVICE_ROLE_KEY", os.environ.get("NEXT_PUBLIC_SUPABASE_ANON_KEY", ""))
    if not key:
        key = os.environ.get("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY", "")

    supabase = create_client(url, key)

    res = supabase.table("target_accounts").select("id, instagram_id").eq("instagram_id", "bbang_.608").execute()
    if res.data:
        target_id = res.data[0]['id']
        print(f"Executing summarize_posts for {target_id}...")
        os.system("python execution/summarize_posts.py")
if __name__ == '__main__':
    main()
