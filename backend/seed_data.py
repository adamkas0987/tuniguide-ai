# seed_data.py
from database import places_collection, restaurants_collection, hotels_collection

new_restaurants = [
  { "name": "Restaurant Dar El Jeld", "city": "Tunis", "cuisine": "Tunisienne gastronomique", "price_per_person": 65, "rating": 4.9, "lat": 36.7990, "lng": 10.1720 },
  { "name": "Le Cosmos Tunis", "city": "Tunis", "cuisine": "Mediterraneenne", "price_per_person": 45, "rating": 4.7, "lat": 36.8150, "lng": 10.1780 },
  { "name": "Cafe Carthage", "city": "Tunis", "cuisine": "Tunisienne traditionnelle", "price_per_person": 25, "rating": 4.5, "lat": 36.8000, "lng": 10.1800 },
  { "name": "Restaurant La Goulette", "city": "Tunis", "cuisine": "Fruits de mer", "price_per_person": 55, "rating": 4.8, "lat": 36.8180, "lng": 10.3050 },
  { "name": "Pizzeria Roma Tunis", "city": "Tunis", "cuisine": "Italienne", "price_per_person": 30, "rating": 4.4, "lat": 36.8120, "lng": 10.1750 },
  { "name": "Restaurant Le Lido", "city": "Sousse", "cuisine": "Fruits de mer", "price_per_person": 60, "rating": 4.8, "lat": 35.8300, "lng": 10.6350 },
  { "name": "Dar Hizem Sousse", "city": "Sousse", "cuisine": "Tunisienne traditionnelle", "price_per_person": 40, "rating": 4.7, "lat": 35.8260, "lng": 10.6370 },
  { "name": "Restaurant La Medina", "city": "Sousse", "cuisine": "Tunisienne", "price_per_person": 28, "rating": 4.5, "lat": 35.8270, "lng": 10.6390 },
  { "name": "Le Bonheur Sousse", "city": "Sousse", "cuisine": "Francaise", "price_per_person": 50, "rating": 4.6, "lat": 35.8320, "lng": 10.6330 },
  { "name": "Restaurant Haroun Djerba", "city": "Djerba", "cuisine": "Fruits de mer", "price_per_person": 55, "rating": 4.8, "lat": 33.8760, "lng": 10.8580 },
  { "name": "Dar Dhiafa Restaurant", "city": "Djerba", "cuisine": "Tunisienne gastronomique", "price_per_person": 70, "rating": 4.9, "lat": 33.8500, "lng": 10.8700 },
  { "name": "Restaurant La Seguia Djerba", "city": "Djerba", "cuisine": "Mediterraneenne", "price_per_person": 35, "rating": 4.5, "lat": 33.8600, "lng": 10.8900 },
  { "name": "Grill Beach Djerba", "city": "Djerba", "cuisine": "Grillades", "price_per_person": 45, "rating": 4.6, "lat": 33.8750, "lng": 10.9100 },
  { "name": "Restaurant Sabra Kairouan", "city": "Kairouan", "cuisine": "Tunisienne traditionnelle", "price_per_person": 22, "rating": 4.6, "lat": 35.6790, "lng": 10.0960 },
  { "name": "Dar Zarrouk Kairouan", "city": "Kairouan", "cuisine": "Tunisienne gastronomique", "price_per_person": 40, "rating": 4.8, "lat": 35.6810, "lng": 10.0980 },
  { "name": "Cafe Makroudh", "city": "Kairouan", "cuisine": "Patisseries", "price_per_person": 12, "rating": 4.7, "lat": 35.6800, "lng": 10.0970 },
  { "name": "Restaurant Le Printemps", "city": "Sfax", "cuisine": "Tunisienne", "price_per_person": 30, "rating": 4.5, "lat": 34.7400, "lng": 10.7600 },
  { "name": "Dar Jellouli Restaurant", "city": "Sfax", "cuisine": "Tunisienne gastronomique", "price_per_person": 50, "rating": 4.7, "lat": 34.7410, "lng": 10.7610 },
  { "name": "Fruits de Mer Sfax", "city": "Sfax", "cuisine": "Fruits de mer", "price_per_person": 55, "rating": 4.8, "lat": 34.7350, "lng": 10.7580 },
  { "name": "Restaurant Amphitheatre", "city": "El Jem", "cuisine": "Tunisienne", "price_per_person": 25, "rating": 4.6, "lat": 35.2960, "lng": 10.7080 },
  { "name": "Cafe Romain El Jem", "city": "El Jem", "cuisine": "Cafe Snacks", "price_per_person": 15, "rating": 4.5, "lat": 35.2950, "lng": 10.7060 },
]

new_hotels = [
  { "name": "Hotel Africa Tunis", "city": "Tunis", "stars": 5, "price_per_night": 180, "rating": 4.7, "lat": 36.8190, "lng": 10.1650 },
  { "name": "La Maison Blanche Tunis", "city": "Tunis", "stars": 4, "price_per_night": 120, "rating": 4.6, "lat": 36.8150, "lng": 10.1700 },
  { "name": "Hotel Medina Tunis", "city": "Tunis", "stars": 3, "price_per_night": 65, "rating": 4.3, "lat": 36.7990, "lng": 10.1720 },
  { "name": "Dar Ben Gacem Tunis", "city": "Tunis", "stars": 4, "price_per_night": 95, "rating": 4.8, "lat": 36.8000, "lng": 10.1730 },
  { "name": "Hotel Marhaba Palace", "city": "Sousse", "stars": 5, "price_per_night": 200, "rating": 4.8, "lat": 35.8700, "lng": 10.5900 },
  { "name": "Hotel Tej Marhaba", "city": "Sousse", "stars": 4, "price_per_night": 130, "rating": 4.6, "lat": 35.8600, "lng": 10.6000 },
  { "name": "Residence Cannes Sousse", "city": "Sousse", "stars": 3, "price_per_night": 70, "rating": 4.3, "lat": 35.8300, "lng": 10.6350 },
  { "name": "Hotel Sousse Palace", "city": "Sousse", "stars": 4, "price_per_night": 110, "rating": 4.5, "lat": 35.8280, "lng": 10.6370 },
  { "name": "Hasdrubal Thalassa Djerba", "city": "Djerba", "stars": 5, "price_per_night": 250, "rating": 4.9, "lat": 33.8500, "lng": 10.9000 },
  { "name": "Hotel Dar Dhiafa", "city": "Djerba", "stars": 5, "price_per_night": 220, "rating": 4.9, "lat": 33.8500, "lng": 10.8700 },
  { "name": "Hotel Djerba Plaza", "city": "Djerba", "stars": 4, "price_per_night": 140, "rating": 4.6, "lat": 33.8600, "lng": 10.8900 },
  { "name": "Hotel Ulysse Palace", "city": "Djerba", "stars": 4, "price_per_night": 120, "rating": 4.5, "lat": 33.8700, "lng": 10.9000 },
  { "name": "Hotel La Kasbah Kairouan", "city": "Kairouan", "stars": 4, "price_per_night": 90, "rating": 4.7, "lat": 35.6810, "lng": 10.0970 },
  { "name": "Hotel Continental Kairouan", "city": "Kairouan", "stars": 3, "price_per_night": 55, "rating": 4.3, "lat": 35.6790, "lng": 10.0960 },
  { "name": "Dar Ennour Kairouan", "city": "Kairouan", "stars": 3, "price_per_night": 45, "rating": 4.4, "lat": 35.6800, "lng": 10.0950 },
  { "name": "Hotel Novotel Sfax", "city": "Sfax", "stars": 4, "price_per_night": 100, "rating": 4.5, "lat": 34.7400, "lng": 10.7580 },
  { "name": "Hotel Thyna Sfax", "city": "Sfax", "stars": 3, "price_per_night": 60, "rating": 4.2, "lat": 34.7410, "lng": 10.7600 },
  { "name": "Dar Jellouli Maison Hotes", "city": "Sfax", "stars": 4, "price_per_night": 85, "rating": 4.7, "lat": 34.7420, "lng": 10.7610 },
  { "name": "Hotel Julius El Jem", "city": "El Jem", "stars": 3, "price_per_night": 50, "rating": 4.4, "lat": 35.2960, "lng": 10.7070 },
  { "name": "Dar El Jem Maison Hotes", "city": "El Jem", "stars": 3, "price_per_night": 40, "rating": 4.5, "lat": 35.2950, "lng": 10.7060 },
]

def seed():
    print("Starting seed...")

    existing_resto = [r['name'] for r in restaurants_collection.find({}, {'name': 1})]
    restos_to_insert = [r for r in new_restaurants if r['name'] not in existing_resto]
    if restos_to_insert:
        restaurants_collection.insert_many(restos_to_insert)
        print(f"Inserted {len(restos_to_insert)} new restaurants")
    else:
        print("Restaurants already exist")

    existing_hotels = [h['name'] for h in hotels_collection.find({}, {'name': 1})]
    hotels_to_insert = [h for h in new_hotels if h['name'] not in existing_hotels]
    if hotels_to_insert:
        hotels_collection.insert_many(hotels_to_insert)
        print(f"Inserted {len(hotels_to_insert)} new hotels")
    else:
        print("Hotels already exist")

    print("\nFinal counts:")
    for t in ['culture', 'relax', 'beach', 'adventure']:
        c = places_collection.count_documents({'type': t})
        print(f"  {t}: {c}")
    print(f"  Restaurants: {restaurants_collection.count_documents({})}")
    print(f"  Hotels: {hotels_collection.count_documents({})}")
    print("Seed complete!")

if __name__ == '__main__':
    seed()