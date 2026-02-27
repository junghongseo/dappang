import requests
import json

headers = {
    "content-type": "application/json",
    "x-rapidapi-key": "de87a79bbemshb8ffba0dad9da2bp19e547jsnbe303662fe11",
    "x-rapidapi-host": 'instagram-scraper-stable-api.p.rapidapi.com'
}

payload = {"username": "tartinebakery"}
response = requests.post("https://instagram-scraper-stable-api.p.rapidapi.com/get_ig_user_posts.php", json=payload, headers=headers)
print("status for json:", response.status_code)
print("text for json:", response.text)
