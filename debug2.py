import requests

rapidapi_key = "de87a79bbemshb8ffba0dad9da2bp19e547jsnbe303662fe11"
payload = {"username_or_url": "tartinebakery"}

headers1 = {
    "content-type": "application/x-www-form-urlencoded",
    "x-rapidapi-key": rapidapi_key,
    "x-rapidapi-host": "instagram-scraper-stable-api.p.rapidapi.com"
}

headers2 = {
    "Content-Type": "application/x-www-form-urlencoded",
    "X-RapidAPI-Key": rapidapi_key,
    "X-RapidAPI-Host": "instagram-scraper-stable-api.p.rapidapi.com"
}

headers3 = {
    "X-RapidAPI-Key": rapidapi_key,
    "X-RapidAPI-Host": "instagram-scraper-stable-api.p.rapidapi.com"
}

for idx, h in enumerate([headers1, headers2, headers3]):
    res = requests.post("https://instagram-scraper-stable-api.p.rapidapi.com/get_ig_user_posts.php", data=payload, headers=h)
    print(f"Test {idx+1}: {res.status_code} - {res.text[:50]}")

