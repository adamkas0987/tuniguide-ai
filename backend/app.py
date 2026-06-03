# app.py
from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_jwt_extended import jwt_required
from recommendation import generate_trip, find_alternative
from database import places_collection, restaurants_collection, hotels_collection
from weather import get_weather, get_weather_advice
from agent import chat_with_agent
from auth import init_jwt, register_user, login_user, save_trip, get_user_trips, get_profile

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

if __name__ == '__main__':
    app.run(debug=True, port=5000)