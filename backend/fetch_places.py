# fetch_places.py
# Uses OpenStreetMap Overpass API — 100% free, no API key needed
# Fetches 500+ real places for all 6 Tunisian cities
# Command: python fetch_places.py

import requests
import time
from database import places_collection

# ──────────────────────────────────────────────
# City coordinates + search radius
# ──────────────────────────────────────────────
VILLES = [
    {"name": "Tunis",    "lat": 36.8065, "lng": 10.1815, "radius": 15000},
    {"name": "Sousse",   "lat": 35.8256, "lng": 10.6369, "radius": 12000},
    {"name": "Sfax",     "lat": 34.7406, "lng": 10.7603, "radius": 12000},
    {"name": "Djerba",   "lat": 33.8076, "lng": 10.8451, "radius": 20000},
    {"name": "Kairouan", "lat": 35.6781, "lng": 10.0963, "radius": 10000},
    {"name": "El Jem",   "lat": 35.2963, "lng": 10.7072, "radius": 8000},
]

OSM_QUERIES = [
    {
        "type": "culture",
        "tags": [
            ("tourism", "museum"),
            ("tourism", "gallery"),
            ("historic", "ruins"),
            ("historic", "archaeological_site"),
            ("historic", "monument"),
            ("historic", "castle"),
            ("historic", "fort"),
            ("historic", "city_gate"),
            ("amenity", "place_of_worship"),
            ("building", "mosque"),
            ("tourism", "artwork"),
            ("tourism", "attraction"),
            ("historic", "memorial"),
            ("historic", "tomb"),
        ],
        "duration": 3,
        "weather": "all"
    },
    {
        "type": "beach",
        "tags": [
            ("natural", "beach"),
            ("leisure", "beach_resort"),
            ("sport", "scuba_diving"),
            ("sport", "surfing"),
            ("sport", "swimming"),
            ("leisure", "water_park"),
            ("sport", "kitesurfing"),
            ("amenity", "dive_centre"),
        ],
        "duration": 4,
        "weather": "sunny"
    },
    {
        "type": "adventure",
        "tags": [
            ("sport", "climbing"),
            ("sport", "hiking"),
            ("sport", "cycling"),
            ("leisure", "track"),
            ("sport", "karting"),
            ("tourism", "camp_site"),
            ("sport", "equestrian"),
            ("sport", "paragliding"),
            ("leisure", "sports_centre"),
        ],
        "duration": 4,
        "weather": "all"
    },
    {
        "type": "relax",
        "tags": [
            ("leisure", "garden"),
            ("leisure", "park"),
            ("leisure", "spa"),
            ("amenity", "spa"),
            ("shop", "massage"),
            ("amenity", "cafe"),
            ("tourism", "viewpoint"),
            ("leisure", "nature_reserve"),
            ("amenity", "hammam"),
        ],
        "duration": 2,
        "weather": "all"
    },
]

PRICE_MAP = {
    "museum": 10, "gallery": 8, "ruins": 5, "archaeological_site": 8,
    "monument": 0, "castle": 12, "fort": 10, "city_gate": 0,
    "place_of_worship": 0, "mosque": 0, "artwork": 0,
    "attraction": 5, "memorial": 0, "tomb": 5,
    "beach": 0, "beach_resort": 15, "scuba_diving": 80, "surfing": 60,
    "swimming": 10, "water_park": 45, "kitesurfing": 95, "dive_centre": 70,
    "climbing": 25, "hiking": 0, "cycling": 15, "track": 20,
    "karting": 35, "camp_site": 30, "equestrian": 50, "paragliding": 120,
    "sports_centre": 20,
    "garden": 0, "park": 0, "spa": 150, "massage": 60,
    "cafe": 15, "viewpoint": 0, "nature_reserve": 5, "hammam": 25,
}

DURATION_MAP = {
    "museum": 3, "gallery": 2, "ruins": 3, "archaeological_site": 3,
    "monument": 1, "castle": 3, "fort": 2, "city_gate": 1,
    "place_of_worship": 1, "mosque": 1, "artwork": 1, "attraction": 2,
    "beach": 4, "beach_resort": 5, "scuba_diving": 4, "water_park": 5,
    "surfing": 3, "kitesurfing": 4,
    "climbing": 5, "hiking": 5, "cycling": 4, "karting": 2,
    "paragliding": 2, "equestrian": 3,
    "garden": 2, "park": 2, "spa": 3, "hammam": 2,
    "cafe": 1, "viewpoint": 1,
}

def build_query(lat, lng, radius, key, value):
    return f"""
    [out:json][timeout:25];
    (
      node["{key}"="{value}"](around:{radius},{lat},{lng});
      way["{key}"="{value}"](around:{radius},{lat},{lng});
      relation["{key}"="{value}"](around:{radius},{lat},{lng});
    );
    out center tags;
    """

def query_overpass(query):
    import urllib.parse
    url = "https://overpass-api.de/api/interpreter"
    try:
        encoded = urllib.parse.urlencode({"data": query})
        full_url = f"{url}?{encoded}"
        headers = {
            "User-Agent": "TuniGuide/1.0 (tuniguide-ai@gmail.com)",
            "Accept": "application/json"
        }
        response = requests.get(full_url, headers=headers, timeout=30)
        response.raise_for_status()
        return response.json().get("elements", [])
    except Exception as e:
        print(f"    ⚠️  Overpass error: {e}")
        return []

def get_coords(element, default_lat, default_lng):
    if element.get("type") == "node":
        return element.get("lat", default_lat), element.get("lon", default_lng)
    elif "center" in element:
        return element["center"].get("lat", default_lat), element["center"].get("lon", default_lng)
    return default_lat, default_lng

def build_description(tags, name, city, travel_type):
    if tags.get("description"):
        return tags["description"][:300]
    defaults = {
        "culture": f"{name} est un site culturel incontournable de {city}. Découvrez l'histoire et le patrimoine de cette destination.",
        "beach": f"{name} offre une expérience balnéaire inoubliable à {city}. Eaux cristallines et sable fin vous attendent.",
        "adventure": f"{name} propose des activités sportives et d'aventure à {city}. Sensations fortes garanties.",
        "relax": f"{name} est l'endroit idéal pour se détendre et se ressourcer à {city}. Ambiance calme et sereine.",
    }
    return defaults.get(travel_type, f"Lieu à visiter à {city}.")

def generate_rating(tags):
    rating = 3.5
    if tags.get("wikipedia") or tags.get("wikidata"):
        rating += 0.5
    if tags.get("website"):
        rating += 0.2
    if tags.get("opening_hours"):
        rating += 0.1
    if tags.get("tourism") in ["museum", "attraction"]:
        rating += 0.3
    if tags.get("historic") in ["ruins", "archaeological_site", "castle"]:
        rating += 0.4
    return round(min(rating, 5.0), 1)

def fetch_and_save_all():
    print("🚀 Starting OpenStreetMap data fetch...")
    print("=" * 50)

    existing_count = places_collection.count_documents({})
    print(f"📊 Current places in DB: {existing_count}")
    places_collection.delete_many({})
    print("🗑️  Cleared existing places\n")

    total_inserted = 0

    for ville in VILLES:
        city_name = ville["name"]
        city_count = 0
        city_types = {"culture": 0, "beach": 0, "adventure": 0, "relax": 0}
        print(f"🏙️  Fetching places for {city_name}...")

        city_places = []
        seen_names = set()

        for query_config in OSM_QUERIES:
            travel_type = query_config["type"]
            duration = query_config["duration"]
            weather = query_config["weather"]

            for key, value in query_config["tags"]:
                query = build_query(ville["lat"], ville["lng"], ville["radius"], key, value)
                elements = query_overpass(query)
                time.sleep(1)

                for el in elements:
                    tags = el.get("tags", {})
                    name = (
                        tags.get("name:fr") or
                        tags.get("name") or
                        tags.get("name:ar") or
                        tags.get("name:en") or ""
                    ).strip()

                    if not name or name in seen_names or len(name) < 3:
                        continue

                    seen_names.add(name)
                    lat, lng = get_coords(el, ville["lat"], ville["lng"])
                    price = PRICE_MAP.get(value, 0)
                    dur = DURATION_MAP.get(value, duration)
                    rating = generate_rating(tags)
                    description = build_description(tags, name, city_name, travel_type)

                    doc = {
                        "name": name,
                        "city": city_name,
                        "type": travel_type,
                        "price": price,
                        "duration": dur,
                        "weather": weather,
                        "lat": lat,
                        "lng": lng,
                        "description": description,
                        "rating": rating,
                        "osm_id": str(el.get("id", "")),
                    }
                    city_places.append(doc)
                    city_types[travel_type] += 1
                    city_count += 1

        if city_places:
            places_collection.insert_many(city_places)
            total_inserted += len(city_places)
            print(f"  ✅ {city_count} places inserted")
            print(f"     culture:{city_types['culture']} | beach:{city_types['beach']} | adventure:{city_types['adventure']} | relax:{city_types['relax']}")
        else:
            print(f"  ⚠️  No places found for {city_name}")

        print()
        time.sleep(2)

    print("=" * 50)
    print(f"🎉 DONE! Total places inserted: {total_inserted}")
    print("\n📊 Final breakdown by type:")
    for t in ["culture", "beach", "adventure", "relax"]:
        count = places_collection.count_documents({"type": t})
        print(f"   {t}: {count}")
    print("\n📊 Final breakdown by city:")
    for ville in VILLES:
        count = places_collection.count_documents({"city": ville["name"]})
        print(f"   {ville['name']}: {count}")

if __name__ == "__main__":
    fetch_and_save_all()