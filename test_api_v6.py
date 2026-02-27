import requests
import urllib.parse
# Test exact format used by Python's requests library for data payload vs params
headers = {
    "x-rapidapi-key": "de87a79bbemshb8ffba0dad9da2bp19e547jsnbe303662fe11",
    "x-rapidapi-host": 'instagram-scraper-stable-api.p.rapidapi.com'
}

params_to_test = ["username", "user", "user_name", "ig_user", "target"]
for p in params_to_test:
    res1 = requests.post("https://instagram-scraper-stable-api.p.rapidapi.com/get_ig_user_posts.php", data={p: "tartinebakery"}, headers=headers)
    res2 = requests.post(f"https://instagram-scraper-stable-api.p.rapidapi.com/get_ig_user_posts.php?{p}=tartinebakery", headers=headers)
    
    print(f"data={p}: {res1.text}")
    print(f"query={p}: {res2.text}")
