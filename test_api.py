import os
import requests
from dotenv import load_dotenv

load_dotenv()
rapidapi_key = os.environ.get('RAPIDAPI_KEY')

# Let's see what happens with 'user_name' parameter
payload = {"user_name": "tartinebakery"}
headers = {
    "content-type": "application/x-www-form-urlencoded",
    "x-rapidapi-key": rapidapi_key,
    "x-rapidapi-host": 'instagram-scraper-stable-api.p.rapidapi.com'
}

response = requests.post("https://instagram-scraper-stable-api.p.rapidapi.com/get_ig_user_posts.php", data=payload, headers=headers)
print("status for user_name:", response.status_code)
print("text for user_name:", response.text)

# Let's see what happens with 'username' parameter
payload = {"username": "tartinebakery"}
response = requests.post("https://instagram-scraper-stable-api.p.rapidapi.com/get_ig_user_posts.php", data=payload, headers=headers)
print("status for username:", response.status_code)
print("text for username:", response.text)
