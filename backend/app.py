# app.py
from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_jwt_extended import jwt_required
from recommendation import generate_trip, find_alternative
from database import places_collection, restaurants_collection, hotels_collection, db
from weather import get_weather, get_weather_advice
from agent import chat_with_agent
from auth import init_jwt, register_user, login_user, save_trip, get_user_trips, get_profile
from datetime import datetime
import base64
import uuid

app = Flask(__name__)
CORS(app)
jwt = init_jwt(app)

# ──────────────────────────────────────────────
# Vérification API
# ──────────────────────────────────────────────
@app.route('/health', methods=['GET'])
def health():
    return jsonify({
        "status": "ok",
        "message": "TuniGuide API opérationnelle"
    })

# ──────────────────────────────────────────────
# Générer un voyage
# ──────────────────────────────────────────────
@app.route('/generate-trip', methods=['POST'])
def trip():
    data = request.json
    if not data:
        return jsonify({"error": "Données manquantes"}), 400

    required = ['city', 'budget', 'days', 'type']
    for field in required:
        if field not in data:
            return jsonify({"error": f"Champ manquant : {field}"}), 400

    result = generate_trip(data)
    return jsonify(result)

# ──────────────────────────────────────────────
# Liste des villes disponibles
# ──────────────────────────────────────────────
@app.route('/cities', methods=['GET'])
def get_cities():
    cities = places_collection.distinct("city")
    return jsonify(sorted(cities))

# ──────────────────────────────────────────────
# Liste des lieux par ville
# ──────────────────────────────────────────────
@app.route('/places', methods=['GET'])
def get_places():
    city = request.args.get('city')
    query = {"city": city} if city else {}
    places = list(places_collection.find(query))
    for p in places:
        p['_id'] = str(p['_id'])
    return jsonify(places)

# ──────────────────────────────────────────────
# Liste des restaurants par ville
# ──────────────────────────────────────────────
@app.route('/restaurants', methods=['GET'])
def get_restaurants():
    city = request.args.get('city')
    query = {"city": city} if city else {}
    restaurants = list(restaurants_collection.find(query))
    for r in restaurants:
        r['_id'] = str(r['_id'])
    return jsonify(restaurants)

# ──────────────────────────────────────────────
# Liste des hôtels par ville
# ──────────────────────────────────────────────
@app.route('/hotels', methods=['GET'])
def get_hotels():
    city = request.args.get('city')
    query = {"city": city} if city else {}
    hotels = list(hotels_collection.find(query))
    for h in hotels:
        h['_id'] = str(h['_id'])
    return jsonify(hotels)

# ──────────────────────────────────────────────
# Alternative si lieu fermé ou trop loin
# ──────────────────────────────────────────────
@app.route('/alternative', methods=['POST'])
def alternative():
    data = request.json
    if not data:
        return jsonify({"error": "Données manquantes"}), 400

    city        = data.get('city')
    travel_type = data.get('type', 'culture')
    exclude     = data.get('exclude', [])
    lat         = data.get('lat')
    lng         = data.get('lng')

    result = find_alternative(city, travel_type, exclude, lat, lng)
    if result:
        return jsonify(result)
    else:
        return jsonify({"error": "Aucune alternative trouvée"}), 404

# ──────────────────────────────────────────────
# Météo d'une ville
# ──────────────────────────────────────────────
@app.route('/weather/<city>', methods=['GET'])
def weather(city):
    data = get_weather(city)
    if data:
        data['advice'] = get_weather_advice(data)
        return jsonify(data)
    else:
        return jsonify({"error": f"Météo non disponible pour '{city}'"}), 404

# ──────────────────────────────────────────────
# Chat avec l'agent IA
# ──────────────────────────────────────────────
@app.route('/chat', methods=['POST'])
def chat():
    data = request.json
    if not data:
        return jsonify({"error": "Données manquantes"}), 400

    message              = data.get('message', '')
    conversation_history = data.get('history', [])
    trip_context         = data.get('trip_context', None)

    if not message:
        return jsonify({"error": "Message manquant"}), 400

    result = chat_with_agent(message, conversation_history, trip_context)
    return jsonify(result)

# ──────────────────────────────────────────────
# Auth — Register
# ──────────────────────────────────────────────
@app.route('/register', methods=['POST'])
def register():
    return register_user()

# ──────────────────────────────────────────────
# Auth — Login
# ──────────────────────────────────────────────
@app.route('/login', methods=['POST'])
def login():
    return login_user()

# ──────────────────────────────────────────────
# Auth — Profil utilisateur
# ──────────────────────────────────────────────
@app.route('/profile', methods=['GET'])
@jwt_required()
def profile():
    return get_profile()

# ──────────────────────────────────────────────
# Auth — Sauvegarder un voyage
# ──────────────────────────────────────────────
@app.route('/trips/save', methods=['POST'])
@jwt_required()
def save_trip_route():
    return save_trip()

# ──────────────────────────────────────────────
# Auth — Historique des voyages
# ──────────────────────────────────────────────
@app.route('/trips/history', methods=['GET'])
@jwt_required()
def trips_history():
    return get_user_trips()

# ──────────────────────────────────────────────
# Avis — Récupérer les avis par ville
# ──────────────────────────────────────────────
@app.route('/reviews', methods=['GET'])
def get_reviews():
    city = request.args.get('city')
    query = {"city": city} if city else {}
    reviews = list(db["reviews"].find(query).sort("created_at", -1).limit(20))
    for r in reviews:
        r['_id'] = str(r['_id'])
    return jsonify(reviews)

# ──────────────────────────────────────────────
# Avis — Poster un avis
# ──────────────────────────────────────────────
@app.route('/reviews', methods=['POST'])
def post_review():
    data = request.json
    if not data:
        return jsonify({"error": "Données manquantes"}), 400

    review = {
        "user_name":  data.get('user_name', 'Anonyme'),
        "place":      data.get('place', ''),
        "city":       data.get('city', ''),
        "rating":     int(data.get('rating', 5)),
        "comment":    data.get('comment', ''),
        "photo_url":  data.get('photo_url', ''),
        "created_at": datetime.now().isoformat()
    }

    result = db["reviews"].insert_one(review)
    review['_id'] = str(result.inserted_id)
    return jsonify({"message": "Avis publié", "review": review}), 201

# ──────────────────────────────────────────────
# Récompenses — Récupérer les points
# ──────────────────────────────────────────────
@app.route('/rewards/points', methods=['GET'])
@jwt_required()
def get_points():
    from flask_jwt_extended import get_jwt_identity
    import bson
    user_id = get_jwt_identity()
    
    # Compter les voyages
    trips_count = db["trips"].count_documents({"user_id": user_id})
    # Compter les avis
    reviews_count = db["reviews"].count_documents({"user_id": user_id})
    
    # Calcul des points
    points = (trips_count * 100) + (reviews_count * 50)
    
    # Niveau
    if points >= 1000:
        level = "Or"
        level_en = "Gold"
        next_level = None
        next_points = None
    elif points >= 500:
        level = "Argent"
        level_en = "Silver"
        next_level = "Or"
        next_points = 1000 - points
    elif points >= 200:
        level = "Bronze"
        level_en = "Bronze"
        next_level = "Argent"
        next_points = 500 - points
    else:
        level = "Débutant"
        level_en = "Starter"
        next_level = "Bronze"
        next_points = 200 - points
    
    return jsonify({
        "points": points,
        "level": level,
        "level_en": level_en,
        "trips_count": trips_count,
        "reviews_count": reviews_count,
        "next_level": next_level,
        "next_points": next_points
    })

# ──────────────────────────────────────────────
# Destination — Infos complètes d'une ville
# ──────────────────────────────────────────────
@app.route('/destination/<city>', methods=['GET'])
def get_destination(city):
    places = list(places_collection.find({"city": city}).limit(6))
    restaurants = list(restaurants_collection.find({"city": city}).limit(4))
    hotels = list(hotels_collection.find({"city": city}).limit(4))
    weather = get_weather(city)
    
    for p in places:
        p['_id'] = str(p['_id'])
    for r in restaurants:
        r['_id'] = str(r['_id'])
    for h in hotels:
        h['_id'] = str(h['_id'])
    
    return jsonify({
        "city": city,
        "places": places,
        "restaurants": restaurants,
        "hotels": hotels,
        "weather": weather
    })

# ──────────────────────────────────────────────
# Réservation — Sauvegarder une réservation
# ──────────────────────────────────────────────
@app.route('/bookings', methods=['POST'])
def create_booking():
    data = request.json
    if not data:
        return jsonify({"error": "Données manquantes"}), 400
    
    booking = {
        "type":       data.get('type'),
        "name":       data.get('name'),
        "city":       data.get('city'),
        "user_name":  data.get('user_name', 'Anonyme'),
        "user_email": data.get('user_email', ''),
        "check_in":   data.get('check_in', ''),
        "check_out":  data.get('check_out', ''),
        "guests":     data.get('guests', 1),
        "date":       data.get('date', ''),
        "price":      data.get('price', 0),
        "created_at": datetime.now().isoformat(),
        "status":     "confirmed"
    }
    
    result = db["bookings"].insert_one(booking)
    booking['_id'] = str(result.inserted_id)
    return jsonify({"message": "Réservation confirmée !", "booking": booking}), 201

@app.route('/bookings', methods=['GET'])
def get_bookings():
    bookings = list(db["bookings"].find().sort("created_at", -1).limit(10))
    for b in bookings:
        b['_id'] = str(b['_id'])
    return jsonify(bookings)

# ──────────────────────────────────────────────
# Images Wikipedia pour un lieu
# ──────────────────────────────────────────────
@app.route('/image/<path:place_name>', methods=['GET'])
def get_place_image(place_name):
    # Liste de recherches à essayer
    search_terms = [
        place_name,
        place_name + " Tunisia",
        place_name + " Tunisie",
    ]
    
    for term in search_terms:
        try:
            url = "https://en.wikipedia.org/api/rest_v1/page/summary/" + term.replace(' ', '_')
            response = requests.get(url, timeout=5)
            if response.status_code == 200:
                data = response.json()
                image = data.get('thumbnail', {}).get('source', None)
                if image:
                    return jsonify({"image": image, "source": "wikipedia"})
        except:
            pass
    
    # Images de fallback par ville depuis Wikimedia
    fallbacks = {
        "Tunis":    "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5a/Tunis_Medina.jpg/400px-Tunis_Medina.jpg",
        "Sousse":   "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c1/2009-06-15_Sousse_Medina.jpg/400px-2009-06-15_Sousse_Medina.jpg",
        "Djerba":   "https://upload.wikimedia.org/wikipedia/commons/thumb/e/ef/Djerba_island.jpg/400px-Djerba_island.jpg",
        "Kairouan": "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d4/Great_Mosque_of_Kairouan.jpg/400px-Great_Mosque_of_Kairouan.jpg",
        "Sfax":     "https://upload.wikimedia.org/wikipedia/commons/thumb/3/35/Sfax_medina.jpg/400px-Sfax_medina.jpg",
        "El Jem":   "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e6/El_Jem_amphitheatre.jpg/400px-El_Jem_amphitheatre.jpg",
    }
    
    # Chercher si le nom contient une ville connue
    for city, img in fallbacks.items():
        if city.lower() in place_name.lower():
            return jsonify({"image": img})
    
    return jsonify({"image": None})

# ──────────────────────────────────────────────
# Notation — Noter un lieu
# ──────────────────────────────────────────────
@app.route('/ratings', methods=['POST'])
def add_rating():
    data = request.json
    if not data:
        return jsonify({"error": "Données manquantes"}), 400

    place_name = data.get('place_name')
    city       = data.get('city')
    rating     = int(data.get('rating', 5))
    user_name  = data.get('user_name', 'Anonyme')

    if not place_name or not city:
        return jsonify({"error": "place_name et city requis"}), 400

    # Sauvegarder la note
    db["ratings"].insert_one({
        "place_name": place_name,
        "city":       city,
        "rating":     rating,
        "user_name":  user_name,
        "created_at": datetime.now().isoformat()
    })

    # Calculer la nouvelle moyenne
    all_ratings = list(db["ratings"].find({"place_name": place_name}))
    avg = round(sum(r['rating'] for r in all_ratings) / len(all_ratings), 1)
    count = len(all_ratings)

    # Mettre à jour dans places_collection
    places_collection.update_one(
        {"name": place_name},
        {"$set": {"rating": avg, "ratings_count": count}}
    )

    return jsonify({
        "message": "Note ajoutée",
        "average": avg,
        "count": count
    })

# ──────────────────────────────────────────────
# Notation — Récupérer les notes d'un lieu
# ──────────────────────────────────────────────
@app.route('/ratings/<path:place_name>', methods=['GET'])
def get_ratings(place_name):
    ratings = list(db["ratings"].find({"place_name": place_name}))
    if not ratings:
        return jsonify({"average": 0, "count": 0, "ratings": []})

    avg = round(sum(r['rating'] for r in ratings) / len(ratings), 1)
    for r in ratings:
        r['_id'] = str(r['_id'])

    return jsonify({
        "average": avg,
        "count":   len(ratings),
        "ratings": ratings
    })

# Add this route to app.py
@app.route('/trips/share', methods=['POST'])
def share_trip():
    data = request.json
    trip_id = str(uuid.uuid4())[:8]  # short ID like "a3f9b2c1"
    db.shared_trips.insert_one({
        '_id': trip_id,
        'trip': data,
        'created_at': datetime.utcnow()
    })
    return jsonify({'share_id': trip_id})

@app.route('/trips/shared/<share_id>', methods=['GET'])
def get_shared_trip(share_id):
    doc = db.shared_trips.find_one({'_id': share_id})
    if not doc:
        return jsonify({'error': 'Not found'}), 404
    doc['trip']['_id'] = str(doc['_id'])
    return jsonify(doc['trip'])

if __name__ == '__main__':
    app.run(debug=True, port=5000)