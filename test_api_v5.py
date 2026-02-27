import requests

headers = {
    "content-type": "application/x-www-form-urlencoded",
    "x-rapidapi-key": "de87a79bbemshb8ffba0dad9da2bp19e547jsnbe303662fe11",
    "x-rapidapi-host": 'instagram-scraper-stable-api.p.rapidapi.com'
}

params_to_test = [
    "username", "user", "user_name", "ig_username", "ig_user", "target", "account",
    "url", "username_or_url", "name", "id", "user_id", "Username", "USERNAME", "USER"
]

for p in params_to_test:
    payload = {p: "tartinebakery"}
    response = requests.post("https://instagram-scraper-stable-api.p.rapidapi.com/get_ig_user_posts.php", data=payload, headers=headers)
    if not "Username is required" in response.text:
        print(f"SUCCESS with {p} -> {response.status_code} : {response.text}")
        break
