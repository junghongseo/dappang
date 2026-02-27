import requests

headers = {
    "content-type": "application/x-www-form-urlencoded",
    "x-rapidapi-key": "de87a79bbemshb8ffba0dad9da2bp19e547jsnbe303662fe11",
    "x-rapidapi-host": 'instagram-scraper-stable-api.p.rapidapi.com'
}

payload = {"user_name": "tartinebakery"}
response = requests.post("https://instagram-scraper-stable-api.p.rapidapi.com/get_ig_user_posts.php", data=payload, headers=headers)
print("status for user_name:", response.status_code)
print("text for user_name:", response.text)
