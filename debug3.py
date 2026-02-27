import requests
import json

rapidapi_key = "de87a79bbemshb8ffba0dad9da2bp19e547jsnbe303662fe11"
payload = {"username_or_url": "tartinebakery"}
headers = {
    "content-type": "application/x-www-form-urlencoded",
    "x-rapidapi-key": rapidapi_key,
    "x-rapidapi-host": "instagram-scraper-stable-api.p.rapidapi.com"
}

res = requests.post("https://instagram-scraper-stable-api.p.rapidapi.com/get_ig_user_posts.php", data=payload, headers=headers)
data = res.json()
print("Keys:", data.keys())
if 'posts' in data:
    for i, p in enumerate(data['posts'][:1]):
        print(f"Post {i}: {json.dumps(p, indent=2)[:500]}")
