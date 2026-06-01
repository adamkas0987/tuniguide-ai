# fetch_places.py
import requests
import os
import time
from dotenv import load_dotenv
from database import places_collection

load_dotenv()

API_KEY = os.getenv("OPENTRIPMAP_API_KEY")

VILLES = [
    {"name": "Tunis",    "lat": 36.8065, "lng": 10.1815},
    {"name": "Sousse",   "lat": 35.8256, "lng": 10.6369},
    {"name": "Sfax",     "lat": 34.7406, "lng": 10.7603},
    {"name": "Djerba",   "lat": 33.8076, "lng": 10.8451},
    {"name": "Kairouan", "lat": 35.6781, "lng": 10.0963},
    {"name": "El Jem",   "lat": 35.2963, "lng": 10.7072},
]

def get_places_for_city(city_name, lat, lng):
    """Récupère les lieux d'une ville depuis OpenTripMap."""
    url = "https://api.opentripmap.com/0.1/en/places/radius"
    
    params = {
        "radius": 10000,
        "lon": lng,
        "lat": lat,
        "kinds": "interesting_places",
        "limit": 20,
        "apikey": API_KEY,
        "format": "json",
        "rate": 2
    }
    
    try:
        response = requests.get(url, params=params, timeout=10)
        print(f"  Status code : {response.status_code}")
        response.raise_for_status()
        data = response.json()
        print(f"  {city_name} : {len(data)} lieux trouvés")
        return data
    except Exception as e:
        print(f"  ERREUR {city_name} : {e}")
        return []

def get_place_details(xid):
    """Récupère les détails d'un lieu par son ID."""
    url = f"https://api.opentripmap.com/0.1/en/places/xid/{xid}"
    params = {"apikey": API_KEY}
    
    try:
        response = requests.get(url, params=params, timeout=10)
        return response.json()
    except:
        return None

def detect_type(kinds):
    """Détecte le type de voyage selon les kinds OpenTripMap."""
    kinds = kinds.lower()
    if "beach" in kinds:
        return "beach"
    elif "cultural" in kinds or "historic" in kinds or "museum" in kinds:
        return "culture"
    elif "natural" in kinds or "park" in kinds:
        return "relax"
    elif "religion" in kinds or "mosque" in kinds:
        return "culture"
    else:
        return "culture"

def fetch_and_save_all():
    """Récupère tous les lieux et les sauvegarde dans MongoDB."""
    print("Début de la récupération des données...\n")
    
    places_collection.delete_many({})
    total = 0
    
    for ville in VILLES:
        print(f"Ville : {ville['name']}")
        places = get_places_for_city(ville["name"], ville["lat"], ville["lng"])
        
        documents = []
        for place in places:
            time.sleep(0.2)
            details = get_place_details(place.get("xid", ""))
            
            if not details:
                continue
            
            name = details.get("name", "")
            if not name or name == "":
                continue

            doc = {
                "name":        name,
                "city":        ville["name"],
                "type":        detect_type(details.get("kinds", "")),
                "price":       0,
                "duration":    2,
                "weather":     "all",
                "lat":         place.get("point", {}).get("lat", ville["lat"]),
                "lng":         place.get("point", {}).get("lon", ville["lng"]),
                "description": details.get("wikipedia_extracts", {}).get("text", name)[:200] if details.get("wikipedia_extracts") else name,
                "rating":      round(min(place.get("rate", 3) + 2, 5), 1),
                "xid":         place.get("xid", ""),
                "kinds":       details.get("kinds", "")
            }
            documents.append(doc)
        
        if documents:
            places_collection.insert_many(documents)
            total += len(documents)
            print(f"  {len(documents)} lieux sauvegardés\n")
        else:
            print(f"  Aucun lieu sauvegardé\n")
        
        time.sleep(1)
    
    print(f"Terminé ! {total} lieux au total dans MongoDB.")

if __name__ == "__main__":
    fetch_and_save_all()