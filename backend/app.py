# app.py
from flask import Flask, request, jsonify
from flask_cors import CORS
from recommendation import generate_trip, find_alternative
from database import places_collection, restaurants_collection, hotels_collection

app = Flask(__name__)
CORS(app)

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

if __name__ == '__main__':
    app.run(debug=True, port=5000)