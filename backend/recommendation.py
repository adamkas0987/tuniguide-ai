# recommendation.py
import math
from database import places_collection, restaurants_collection, hotels_collection
from weather import get_weather

# ──────────────────────────────────────────────
# Calcul de distance entre deux points GPS (km)
# ──────────────────────────────────────────────
def haversine(lat1, lng1, lat2, lng2):
    R = 6371
    d_lat = math.radians(lat2 - lat1)
    d_lng = math.radians(lng2 - lng1)
    a = math.sin(d_lat/2)**2 + math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) * math.sin(d_lng/2)**2
    return R * 2 * math.asin(math.sqrt(a))

# ──────────────────────────────────────────────
# Score de pertinence d'un lieu
# ──────────────────────────────────────────────
def calculate_score(place, travel_type, budget_per_day):
    score = 0
    if place.get('type') == travel_type:
        score += 10
    if place.get('price', 0) <= budget_per_day * 0.4:
        score += 3
    elif place.get('price', 0) <= budget_per_day * 0.7:
        score += 1
    rating = place.get('rating', 0)
    if rating >= 4.7:
        score += 3
    elif rating >= 4.4:
        score += 2
    elif rating >= 4.0:
        score += 1
    return score

# ──────────────────────────────────────────────
# Trouver une alternative si lieu fermé ou loin
# ──────────────────────────────────────────────
def find_alternative(city, travel_type, exclude_names, lat=None, lng=None):
    query = {"city": city}
    all_places = list(places_collection.find(query))
    alternatives = []
    for place in all_places:
        place['_id'] = str(place['_id'])
        if place['name'] in exclude_names:
            continue
        if lat and lng and place.get('lat') and place.get('lng'):
            dist = haversine(lat, lng, place['lat'], place['lng'])
            place['distance_km'] = round(dist, 2)
        else:
            place['distance_km'] = 0
        alternatives.append(place)
    alternatives.sort(key=lambda x: (x.get('type') == travel_type, x.get('rating', 0)), reverse=True)
    return alternatives[0] if alternatives else None

# ──────────────────────────────────────────────
# Génération de l'itinéraire complet
# ──────────────────────────────────────────────
def generate_trip(data):
    city        = data.get('city', '')
    budget      = float(data.get('budget', 500))
    days        = int(data.get('days', 3))
    travel_type = data.get('type', 'culture')
    budget_per_day = budget / days

    # Météo
    current_weather = get_weather(city)
    is_sunny = current_weather.get('is_sunny', True) if current_weather else True
    weather_info = current_weather

    # ── Lieux ──────────────────────────────────
    raw_places = list(places_collection.find({"city": city}))
    if not raw_places:
        return {"error": f"Aucun lieu trouvé pour la ville '{city}'"}
    for p in raw_places:
        p['_id'] = str(p['_id'])

    affordable = [
        p for p in raw_places
        if p.get('price', 0) <= budget_per_day
        and (p.get('weather') == 'all' or (p.get('weather') == 'sunny' and is_sunny))
    ]
    affordable.sort(key=lambda x: calculate_score(x, travel_type, budget_per_day), reverse=True)
    preferred  = [p for p in affordable if p.get('type') == travel_type]
    others     = [p for p in affordable if p.get('type') != travel_type]
    place_pool = preferred + others

    # ── Meilleur restaurant (sans filtre budget) ─
    restaurants = list(restaurants_collection.find({"city": city}))
    restaurant = None
    if restaurants:
        for r in restaurants:
            r['_id'] = str(r['_id'])
        restaurants.sort(key=lambda x: x.get('rating', 0), reverse=True)
        restaurant = restaurants[0]

    # ── Meilleur hôtel (sans filtre budget) ──────
    hotels = list(hotels_collection.find({"city": city}))
    hotel = None
    if hotels:
        for h in hotels:
            h['_id'] = str(h['_id'])
        hotels.sort(key=lambda x: x.get('rating', 0), reverse=True)
        hotel = hotels[0]

    # ── Itinéraire jour par jour ─────────────────
    itinerary        = []
    total_cost       = 0
    used_names       = []
    used_restaurants = []

    for day in range(1, days + 1):
        day_place = None
        for place in place_pool:
            if place['name'] not in used_names:
                day_place = place
                used_names.append(place['name'])
                break
        if not day_place:
            used_names = []
            for place in place_pool:
                day_place = place
                used_names.append(place['name'])
                break

        day_restaurant = None
        for r in restaurants:
            if r['name'] not in used_restaurants:
                day_restaurant = r
                used_restaurants.append(r['name'])
                break
        if not day_restaurant and restaurants:
            used_restaurants = []
            day_restaurant = restaurants[0]
            used_restaurants.append(day_restaurant['name'])

        if day_place:
            itinerary.append({
                "day":            day,
                "activity":       day_place['name'],
                "description":    day_place.get('description', ''),
                "type":           day_place.get('type', ''),
                "duration_hours": day_place.get('duration', 2),
                "cost":           day_place.get('price', 0),
                "lat":            day_place.get('lat'),
                "lng":            day_place.get('lng'),
                "rating":         day_place.get('rating', 0),
                "restaurant": {
                    "_id":              str(day_restaurant['_id']) if day_restaurant else None,
                    "name":             day_restaurant.get('name', '') if day_restaurant else '',
                    "cuisine":          day_restaurant.get('cuisine', '') if day_restaurant else '',
                    "price_per_person": day_restaurant.get('price_per_person', 0) if day_restaurant else 0,
                    "rating":           day_restaurant.get('rating', 0) if day_restaurant else 0,
                } if day_restaurant else None
            })
            total_cost += day_place.get('price', 0)

    # ── Calcul final + flag budget_exceeded ──────
    hotel_cost      = hotel.get('price_per_night', 0) * days if hotel else 0
    restaurant_cost = restaurant.get('price_per_person', 0) * days if restaurant else 0
    total           = round(total_cost + hotel_cost + restaurant_cost, 2)
    remaining       = round(budget - total, 2)
    budget_exceeded = total > budget

    return {
        "city":                   city,
        "days":                   days,
        "travel_type":            travel_type,
        "budget":                 budget,
        "weather":                weather_info,
        "itinerary":              itinerary,
        "recommended_restaurant": restaurant,
        "recommended_hotel":      hotel,
        "budget_exceeded":        budget_exceeded,
        "cost_summary": {
            "activities":       total_cost,
            "hotel":            hotel_cost,
            "restaurant":       restaurant_cost,
            "total":            total,
            "remaining_budget": remaining
        }
    }