# database.py
import os
from pymongo import MongoClient
from dotenv import load_dotenv

load_dotenv()

client = MongoClient(os.getenv("MONGO_URI", "mongodb://localhost:27017/"))
db = client[os.getenv("DB_NAME", "tuniguide")]

places_collection      = db["places"]
restaurants_collection = db["restaurants"]
hotels_collection      = db["hotels"]
trips_collection       = db["trips"]

print("Connexion MongoDB OK")