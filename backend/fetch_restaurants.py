# fetch_restaurants.py
import requests
import os
import time
from dotenv import load_dotenv
from database import restaurants_collection, hotels_collection

load_dotenv()

API_KEY = os.getenv("OPENTRIPMAP_API_KEY")

VILLES = [
    {"name": "Tunis",    "lat": 36.8065, "lng": 10.1815},
    {"name": "Sousse",   "lat": 35.8256, "lng": 10.6369},
    {"name": "Sfax",     "lat": 34.7406, "lng": 10.7603},
    {"name": "Djerba",   "lat": 33.8076, "lng": 10.8451},
    {"name": "Kairouan", "lat": 35.6781, "lng": 10.0963},
]

def get_by_kind(lat, lng, kind):
    url = "https://api.opentripmap.com/0.1/en/places/radius"
    params = {
        "radius": 5000,
        "lon": lng,
        "lat": lat,
        "kinds": kind,
        "limit": 10,
        "apikey": API_KEY,
        "format": "json"
    }
    try:
        r = requests.get(url, params=params, timeout=10)
        r.raise_for_status()
        return r.json()
    except:
        return []

def get_details(xid):
    url = f"https://api.opentripmap.com/0.1/en/places/xid/{xid}"
    try:
        r = requests.get(url, params={"apikey": API_KEY}, timeout=10)
        return r.json()
    except:
        return None

def fetch_restaurants():
    print("Récupération des restaurants...")
    restaurants_collection.delete_many({})
    total = 0

    for ville in VILLES:
        places = get_by_kind(ville["lat"], ville["lng"], "foods")
        docs = []

        for place in places:
            time.sleep(0.2)
            details = get_details(place.get("xid", ""))
            if not details:
                continue
            name = details.get("name", "")
            if not name:
                continue

            docs.append({
                "name": name,
                "city": ville["name"],
                "cuisine": "tunisienne",
                "price_per_person": 30,
                "lat": place.get("point", {}).get("lat", ville["lat"]),
                "lng": place.get("point", {}).get("lon", ville["lng"]),
                "description": name,
                "rating": round(min(place.get("rate", 3) + 2, 5), 1)
            })

        if docs:
            restaurants_collection.insert_many(docs)
            total += len(docs)
            print(f"  {ville['name']} : {len(docs)} restaurants")
        
        time.sleep(1)

    print(f"Total restaurants : {total}\n")

def fetch_hotels():
    print("Récupération des hôtels...")
    hotels_collection.delete_many({})
    total = 0

    for ville in VILLES:
        places = get_by_kind(ville["lat"], ville["lng"], "accomodations")
        docs = []

        for place in places:
            time.sleep(0.2)
            details = get_details(place.get("xid", ""))
            if not details:
                continue
            name = details.get("name", "")
            if not name:
                continue

            docs.append({
                "name": name,
                "city": ville["name"],
                "stars": 3,
                "price_per_night": 120,
                "lat": place.get("point", {}).get("lat", ville["lat"]),
                "lng": place.get("point", {}).get("lon", ville["lng"]),
                "description": name,
                "rating": round(min(place.get("rate", 3) + 2, 5), 1)
            })

        if docs:
            hotels_collection.insert_many(docs)
            total += len(docs)
            print(f"  {ville['name']} : {len(docs)} hôtels")
        
        time.sleep(1)

    print(f"Total hôtels : {total}\n")

if __name__ == "__main__":
    fetch_restaurants()
    fetch_hotels()
    print("Terminé !")