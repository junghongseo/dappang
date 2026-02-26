# Instagram Scraper & Summarizer Directive

## Goal
Fetch the top 3 latest Instagram posts for a given bakery account, extract important sales/event information, and track API usage to stay under the free tier budget.

## Budget Constraints (CRITICAL)
- We use the RapidAPI Instagram Scraper Stable API.
- The free tier strictly allows **20 calls per month**.
- Usage is tracked in `.tmp/api_usage.json`. DO NOT override this file manually.
- If the limit is reached, the execution scripts will automatically abort. Do not attempt to force bypass it.

## Required Environment Variables
Ensure these are set in the `.env` file before running tools:
- `RAPIDAPI_KEY`
- `GEMINI_API_KEY`

## Execution Flow
When asked to scrape a bakery's Instagram:

1. **Run Scraper Tool**:
   Execute `python execution/scrape_instagram.py <instagram_username>`
   - This script checks the budget. If under 20 calls, it makes the API request to RapidAPI.
   - It saves the top 3 posts to `.tmp/scraped_data.json`.
   - Watch the console output for "Remaining: X" to know how many calls are left.

2. **Run Summarizer Tool**:
   Execute `python execution/summarize_posts.py`
   - This script reads `.tmp/scraped_data.json`.
   - It calls Gemini API to extract: [판매 공지, 신메뉴 출시, 임시 휴무, 행사 정보].
   - If the API limit was reached in Step 1, this script will output a warning instead of a summary.
   - The final result is saved to `.tmp/summary.json`.

3. **Output to User**:
   - Read `.tmp/summary.json`.
   - Present the `summary_text` cleanly to the user.
   - ALWAYS state the `calls_remaining` clearly at the end of your response to the user.

## Error Handling
- **API Timeout/Error**: The RapidAPI service may occasionally timeout. If so, do not immediately retry as it may burn another API call fruitlessly. Notify the user of the failure and let them trigger it manually again if they wish.
- **Missing API Keys**: If the scripts complain about missing API keys, instruct the user to add them to their `.env` file.
