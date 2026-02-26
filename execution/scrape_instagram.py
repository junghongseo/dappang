import os
import requests
from datetime import datetime, timezone
from supabase import create_client, Client
from dotenv import load_dotenv

load_dotenv()

# ==========================================
# CONSTANTS & CONFIG
# ==========================================
MAX_CALLS_PER_MONTH = 20
RAPIDAPI_HOST = 'instagram-scraper-stable-api.p.rapidapi.com'
RAPIDAPI_ENDPOINT = f'https://{RAPIDAPI_HOST}/get_ig_user_posts.php'

# ==========================================
# SUPABASE SETUP
# ==========================================
supabase_url = os.environ.get("NEXT_PUBLIC_SUPABASE_URL")
supabase_key = os.environ.get("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY")

if not supabase_url or not supabase_key:
    print("ERROR: NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY must be set.")
    exit(1)

supabase: Client = create_client(supabase_url, supabase_key)

def load_usage():
    # To keep budget check simple and avoid creating a whole table, 
    # we'll store usage in a simple single-row 'api_usage' table or use local file for now.
    # We will stick to local file just for budget tracking since it's an internal script measure.
    # To make it fully remote, let's just stick to the simplest `.tmp` for budget, 
    # OR we can ignore the budget here and let RapidAPI handle limits.
    # Let's keep the existing local budget check to prevent accidental rapidapi overages.
    
    BUDGET_FILE = '.tmp/api_usage.json'
    import json
    if not os.path.exists(BUDGET_FILE):
        os.makedirs(os.path.dirname(BUDGET_FILE), exist_ok=True)
        return BUDGET_FILE, {}
    try:
        with open(BUDGET_FILE, 'r') as f:
            return BUDGET_FILE, json.load(f)
    except json.JSONDecodeError:
        return BUDGET_FILE, {}

def check_and_increment_budget():
    budget_file, usage = load_usage()
    month_key = datetime.now().strftime('%Y-%m')
    
    current_calls = usage.get(month_key, 0)
    
    if current_calls >= MAX_CALLS_PER_MONTH:
        print(f"CRITICAL: Monthly API limit reached ({MAX_CALLS_PER_MONTH}/{MAX_CALLS_PER_MONTH}). Scraping aborted.")
        return False, current_calls
        
    usage[month_key] = current_calls + 1
    import json
    with open(budget_file, 'w') as f:
        json.dump(usage, f, indent=4)
        
    return True, usage[month_key]

def fetch_target_accounts():
    response = supabase.table("target_accounts").select("id, instagram_id").eq("status", "active").execute()
    return response.data

def scrape_instagram_all():
    rapidapi_key = os.environ.get('RAPIDAPI_KEY')
    if not rapidapi_key:
        print("ERROR: RAPIDAPI_KEY environment variable is not set.")
        return None

    target_accounts = fetch_target_accounts()
    if not target_accounts:
        print("INFO: No active target accounts found in the database.")
        return None

    for target in target_accounts:
        target_id = target['id']
        instagram_id = target['instagram_id']
        print(f"Processing account: {instagram_id} (ID: {target_id})")
        
        # 1. Update status to syncing
        supabase.table("target_accounts").update({"status": "syncing"}).eq("id", target_id).execute()

        # 2. Check budget
        can_proceed, current_call_count = check_and_increment_budget()
        if not can_proceed:
            print("Budget exhausted. Stopping further processing.")
            supabase.table("target_accounts").update({"status": "active"}).eq("id", target_id).execute()
            break
            
        calls_remaining = MAX_CALLS_PER_MONTH - current_call_count
        print(f"API Call authorized. Calls used: {current_call_count}/{MAX_CALLS_PER_MONTH}. Remaining: {calls_remaining}")

        # 3. Request API
        payload = {"user_name": instagram_id}
        headers = {
            "content-type": "application/x-www-form-urlencoded",
            "x-rapidapi-key": rapidapi_key,
            "x-rapidapi-host": RAPIDAPI_HOST
        }

        try:
            response = requests.post(RAPIDAPI_ENDPOINT, data=payload, headers=headers)
            response.raise_for_status()
            data = response.json()
            
            items = data.get('data', {}).get('items', [])
            if not items:
                items = data.get('items', [])
                
            top_3_posts = items[:3]
            processed_posts = []

            for post in top_3_posts:
                caption_node = post.get('caption', {})
                caption = caption_node.get('text', '') if caption_node else ''
                shortcode = post.get('code', '')
                post_url = f"https://www.instagram.com/p/{shortcode}/" if shortcode else ""
                
                # Timestamp is usually unix epoch
                timestamp_val = post.get('taken_at', 0)
                taken_at_iso = datetime.fromtimestamp(timestamp_val, tz=timezone.utc).isoformat() if timestamp_val else None

                # Upsert post into DB
                if post_url:
                    post_data = {
                        "target_account_id": target_id,
                        "post_url": post_url,
                        "post_content": caption,
                        "published_at": taken_at_iso
                    }
                    supabase.table("posts").upsert(post_data, on_conflict="post_url").execute()
                    processed_posts.append(post_url)
            
            print(f"Successfully scraped and stored {len(processed_posts)} posts for {instagram_id}.")
            
            # Since summarizer acts on full aggregated text, we leave it as 'active' and update timestamp in summarizer
            # We revert it back to active so summarizer knows it's ready.
            supabase.table("target_accounts").update({"status": "active"}).eq("id", target_id).execute()

        except requests.exceptions.RequestException as e:
            print(f"ERROR: API request failed for {instagram_id}. {e}")
            supabase.table("target_accounts").update({"status": "active"}).eq("id", target_id).execute()

    print("All scraping tasks completed.")

if __name__ == "__main__":
    scrape_instagram_all()
