"""
Wrapper script that manages the global crawling state.
Sets is_crawling = True at start, runs scraping + summarization,
then sets is_crawling = False at the end (even on error).
"""
import os
import sys
import traceback
from supabase import create_client
from dotenv import load_dotenv

load_dotenv(override=True)

supabase_url = os.environ.get("NEXT_PUBLIC_SUPABASE_URL")
supabase_key = os.environ.get("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY")

if not supabase_url or not supabase_key:
    print("ERROR: Supabase credentials not found.")
    sys.exit(1)

supabase = create_client(supabase_url, supabase_key)

def set_crawling(status: bool):
    """Update the global crawling status in the database."""
    try:
        supabase.table("system_status").update({"is_crawling": status}).eq("id", "global").execute()
        print(f"[run_crawl] is_crawling set to {status}")
    except Exception as e:
        print(f"[run_crawl] WARNING: Failed to set is_crawling to {status}: {e}")

def main():
    set_crawling(True)
    try:
        # Add project root to path for imports
        project_root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
        sys.path.insert(0, project_root)

        # 1. Scrape Instagram
        print("[run_crawl] Starting scrape_instagram...")
        from execution.scrape_instagram import scrape_instagram_all
        scrape_instagram_all()

        # 2. Summarize Posts
        print("[run_crawl] Starting summarize_posts...")
        from execution.summarize_posts import summarize_posts
        summarize_posts()

        print("[run_crawl] All tasks completed successfully.")
    except Exception as e:
        print(f"[run_crawl] ERROR during crawl pipeline: {e}")
        traceback.print_exc()
    finally:
        # Always reset the crawling flag
        set_crawling(False)

if __name__ == "__main__":
    main()
