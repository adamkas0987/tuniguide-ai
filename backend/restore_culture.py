import requests
import time
import os
from dotenv import load_dotenv
from database import places_collection

load_dotenv()
API_KEY = os.getenv('OPENTRIPMAP_API_KEY')

VILLES = [
    {'name':'Tunis','lat':36.8065,'lng':10.1815},
    {'name':'Sousse','lat':35.8256,'lng':10.6369},
    {'name':'Sfax','lat':34.7406,'lng':10.7603},
    {'name':'Djerba','lat':33.8076,'lng':10.8451},
    {'name':'Kairouan','lat':35.6781,'lng':10.0963},
    {'name':'El Jem','lat':35.2963,'lng':10.7072},
]

total = 0
for ville in VILLES:
    print(f"Fetching {ville['name']}...")
    url = 'https://api.opentripmap.com/0.1/en/places/radius'
    params = {
        'radius': 10000,
        'lon': ville['lng'],
        'lat': ville['lat'],
        'kinds': 'interesting_places',
        'limit': 20,
        'apikey': API_KEY,
        'format': 'json',
        'rate': 2
    }
    try:
        r = requests.get(url, params=params, timeout=10)
        places = r.json()
        for place in places:
            time.sleep(0.2)
            xid = place.get('xid', '')
            detail_url = f'https://api.opentripmap.com/0.1/en/places/xid/{xid}'
            d = requests.get(detail_url, params={'apikey': API_KEY}, timeout=10).json()
            name = d.get('name', '')
            if not name:
                continue
            kinds = d.get('kinds', '').lower()
            if 'beach' in kinds or 'water' in kinds:
                t = 'beach'
            elif 'natural' in kinds or 'park' in kinds:
                t = 'relax'
            elif 'sport' in kinds or 'leisure' in kinds:
                t = 'adventure'
            else:
                t = 'culture'
            existing = places_collection.find_one({'name': name, 'city': ville['name']})
            if not existing:
                desc = ''
                if d.get('wikipedia_extracts'):
                    desc = d['wikipedia_extracts'].get('text', name)[:200]
                else:
                    desc = name
                places_collection.insert_one({
                    'name': name,
                    'city': ville['name'],
                    'type': t,
                    'price': 0,
                    'duration': 2,
                    'weather': 'all',
                    'lat': place.get('point', {}).get('lat', ville['lat']),
                    'lng': place.get('point', {}).get('lon', ville['lng']),
                    'description': desc,
                    'rating': round(min(place.get('rate', 3) + 2, 5), 1),
                    'xid': xid,
                    'kinds': d.get('kinds', '')
                })
                total += 1
        print(f"  {ville['name']}: done")
        time.sleep(1)
    except Exception as e:
        print(f"  Error {ville['name']}: {e}")

print(f"\nInserted {total} places")
print("\nFinal counts:")
for t in ['culture', 'relax', 'beach', 'adventure']:
    c = places_collection.count_documents({'type': t})
    print(f"  {t}: {c}")
print(f"  Total: {places_collection.count_documents({})}")