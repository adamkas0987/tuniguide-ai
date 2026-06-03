# auth.py
import os
import bcrypt
from flask import request, jsonify
from flask_jwt_extended import JWTManager, create_access_token, jwt_required, get_jwt_identity
from database import db
from datetime import timedelta

users_collection = db["users"]
trips_collection = db["trips"]

def init_jwt(app):
    """Initialise JWT avec l'app Flask."""
    app.config["JWT_SECRET_KEY"] = os.getenv("JWT_SECRET", "tuniguide-secret-key-2024")
    app.config["JWT_ACCESS_TOKEN_EXPIRES"] = timedelta(days=7)
    jwt = JWTManager(app)
    return jwt

def register_user():
    """Créer un nouveau compte."""
    data = request.json
    if not data:
        return jsonify({"error": "Données manquantes"}), 400

    name     = data.get('name', '')
    email    = data.get('email', '')
    password = data.get('password', '')

    if not name or not email or not password:
        return jsonify({"error": "Nom, email et mot de passe requis"}), 400

    # Vérifier si l'email existe déjà
    existing = users_collection.find_one({"email": email})
    if existing:
        return jsonify({"error": "Cet email est déjà utilisé"}), 409

    # Hasher le mot de passe
    hashed = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt())

    # Sauvegarder l'utilisateur
    user = {
        "name":     name,
        "email":    email,
        "password": hashed,
    }
    result = users_collection.insert_one(user)
    user_id = str(result.inserted_id)

    # Créer le token JWT
    token = create_access_token(identity=user_id)

    return jsonify({
        "message": "Compte créé avec succès",
        "token":   token,
        "user": {
            "id":    user_id,
            "name":  name,
            "email": email
        }
    }), 201

def login_user():
    """Connexion utilisateur."""
    data = request.json
    if not data:
        return jsonify({"error": "Données manquantes"}), 400

    email    = data.get('email', '')
    password = data.get('password', '')

    if not email or not password:
        return jsonify({"error": "Email et mot de passe requis"}), 400

    # Chercher l'utilisateur
    user = users_collection.find_one({"email": email})
    if not user:
        return jsonify({"error": "Email ou mot de passe incorrect"}), 401

    # Vérifier le mot de passe
    if not bcrypt.checkpw(password.encode('utf-8'), user['password']):
        return jsonify({"error": "Email ou mot de passe incorrect"}), 401

    user_id = str(user['_id'])
    token   = create_access_token(identity=user_id)

    return jsonify({
        "message": "Connexion réussie",
        "token":   token,
        "user": {
            "id":    user_id,
            "name":  user['name'],
            "email": user['email']
        }
    })

def save_trip():
    """Sauvegarder un voyage pour l'utilisateur connecté."""
    user_id  = get_jwt_identity()
    data     = request.json

    if not data:
        return jsonify({"error": "Données manquantes"}), 400

    trip = {
        "user_id":  user_id,
        "city":     data.get('city'),
        "days":     data.get('days'),
        "budget":   data.get('budget'),
        "type":     data.get('travel_type'),
        "itinerary": data.get('itinerary', []),
        "cost_summary": data.get('cost_summary', {}),
    }

    result = trips_collection.insert_one(trip)
    return jsonify({
        "message": "Voyage sauvegardé",
        "trip_id": str(result.inserted_id)
    }), 201

def get_user_trips():
    """Récupérer l'historique des voyages de l'utilisateur."""
    user_id = get_jwt_identity()
    trips   = list(trips_collection.find({"user_id": user_id}))

    for trip in trips:
        trip['_id'] = str(trip['_id'])

    return jsonify(trips)

def get_profile():
    """Récupérer le profil de l'utilisateur connecté."""
    user_id = get_jwt_identity()
    user    = users_collection.find_one({"_id": __import__('bson').ObjectId(user_id)})

    if not user:
        return jsonify({"error": "Utilisateur non trouvé"}), 404

    return jsonify({
        "id":    str(user['_id']),
        "name":  user['name'],
        "email": user['email'],
    })