import os
import requests
from dotenv import load_dotenv

load_dotenv()
rapidapi_key = os.environ.get('RAPIDAPI_KEY')
print(f"Key loaded: {rapidapi_key}")

payload = {"username_or_url": "tartinebakery"}
headers = {
    "content-type": "application/x-www-form-urlencoded",
    "x-rapidapi-key": rapidapi_key,
    "x-rapidapi-host": "instagram-scraper-stable-api.p.rapidapi.com"
}
res = requests.post("https://instagram-scraper-stable-api.p.rapidapi.com/get_ig_user_posts.php", data=payload, headers=headers)
print(f"Status: {res.status_code}")
print(f"Body: {res.text[:200]}")
