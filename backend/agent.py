# agent.py
import os
from groq import Groq
from dotenv import load_dotenv
from database import places_collection, restaurants_collection, hotels_collection
from weather import get_weather, get_weather_advice

load_dotenv()

client = Groq(api_key=os.getenv("GROQ_API_KEY"))

SYSTEM_PROMPT = """
Tu es TuniGuide, un assistant touristique intelligent spécialisé en Tunisie.
Tu aides les touristes à planifier et gérer leur voyage en temps réel.

TU PEUX RÉPONDRE À TOUTES CES QUESTIONS :

1. PROBLÈMES EN TEMPS RÉEL :
   - "Le musée est fermé" → propose 2-3 alternatives dans la même ville
   - "Ce lieu est trop loin" → suggère des lieux plus proches
   - "Il pleut" → recommande des activités en intérieur
   - "Mon budget est dépassé" → propose des alternatives gratuites
   - "Je suis perdu" → donne des directions claires

2. QUESTIONS SUR LES LIEUX :
   - Horaires d'ouverture des sites touristiques
   - Prix d'entrée des musées et sites
   - Comment se rendre d'un endroit à un autre
   - Les meilleurs moments pour visiter

3. QUESTIONS SUR LA NOURRITURE :
   - Recommandations de restaurants selon le budget
   - Spécialités tunisiennes à goûter
   - Prix moyens des repas

4. QUESTIONS SUR L'HÉBERGEMENT :
   - Recommandations d'hôtels selon le budget
   - Quartiers où loger
   - Prix des hôtels

5. QUESTIONS PRATIQUES :
   - Transport (taxi, louage, bus)
   - Sécurité et conseils
   - Monnaie et paiement
   - Météo et tenue vestimentaire
   - Urgences et numéros utiles

6. QUESTIONS CULTURELLES :
   - Histoire des sites
   - Traditions et coutumes
   - Phrases utiles en arabe tunisien
   - Événements et festivals

RÈGLES :
- Réponds en français par défaut
- Si l'utilisateur écrit en arabe → réponds en arabe
- Si l'utilisateur écrit en anglais → réponds en anglais
- Sois toujours positif et propose des solutions concrètes
- Mentionne toujours les prix en Dinars Tunisiens (DT)
- Sois concis mais complet
"""

def get_full_context(city):
    """Récupère tout le contexte disponible pour une ville."""
    context = ""

    places = list(places_collection.find({"city": city}))
    if places:
        context += f"\nLIEUX DISPONIBLES À {city.upper()} :\n"
        for p in places:
            context += f"- {p['name']} | type: {p.get('type','')} | prix: {p.get('price',0)} DT | note: {p.get('rating',0)}/5\n"
            if p.get('description'):
                context += f"  {p['description'][:100]}\n"

    restaurants = list(restaurants_collection.find({"city": city}))
    if restaurants:
        context += f"\nRESTAURANTS À {city.upper()} :\n"
        for r in restaurants:
            context += f"- {r['name']} | {r.get('cuisine','')} | {r.get('price_per_person',0)} DT/personne\n"

    hotels = list(hotels_collection.find({"city": city}))
    if hotels:
        context += f"\nHÔTELS À {city.upper()} :\n"
        for h in hotels:
            context += f"- {h['name']} | {h.get('stars',0)} étoiles | {h.get('price_per_night',0)} DT/nuit\n"

    weather = get_weather(city)
    if weather:
        context += f"\nMÉTÉO ACTUELLE :\n"
        context += f"- {weather['temperature']}°C, {weather['description']}\n"
        context += f"- Conseil: {get_weather_advice(weather)}\n"

    return context

def chat_with_agent(message, conversation_history, trip_context=None):
    """
    Envoie un message à l'agent et retourne la réponse.
    
    Args:
        message: Message de l'utilisateur
        conversation_history: Historique [{role, content}]
        trip_context: Contexte du voyage {city, days, budget, travel_type, itinerary}
    """

    # Construire le contexte complet
    context = ""
    if trip_context:
        city = trip_context.get('city', '')
        context += f"\n=== VOYAGE EN COURS ===\n"
        context += f"Ville  : {city}\n"
        context += f"Durée  : {trip_context.get('days', '')} jours\n"
        context += f"Budget : {trip_context.get('budget', '')} DT\n"
        context += f"Type   : {trip_context.get('travel_type', '')}\n"

        itinerary = trip_context.get('itinerary', [])
        if itinerary:
            context += "\nITINÉRAIRE :\n"
            for item in itinerary:
                context += f"  Jour {item['day']} : {item['activity']}\n"

        context += get_full_context(city)

    # Construire les messages pour Groq
    messages = [
        {
            "role": "system",
            "content": SYSTEM_PROMPT + context
        }
    ]

    # Ajouter l'historique des 10 derniers messages
    for msg in conversation_history[-10:]:
        messages.append({
            "role": msg['role'] if msg['role'] != 'assistant' else 'assistant',
            "content": msg['content']
        })

    # Ajouter le message actuel
    messages.append({
        "role": "user",
        "content": message
    })

    try:
        response = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=messages,
            max_tokens=1000,
            temperature=0.7
        )

        return {
            "response": response.choices[0].message.content,
            "status": "ok"
        }

    except Exception as e:
        print(f"ERREUR EXACTE : {e}")
        return {
            "response": "Désolé, je rencontre un problème technique. Veuillez réessayer.",
            "status": "error",
            "error": str(e)
        }

if __name__ == "__main__":
    print("=== Test TuniGuide Agent ===\n")

    trip = {
        "city": "Sousse",
        "days": 3,
        "budget": 400,
        "travel_type": "culture",
        "itinerary": [
            {"day": 1, "activity": "Medina de Sousse"},
            {"day": 2, "activity": "Ribat de Sousse"},
            {"day": 3, "activity": "Port El Kantaoui"}
        ]
    }

    history = []
    questions = [
        "Bonjour ! Le musée est fermé aujourd'hui, que faire ?",
        "Quel restaurant pas cher tu me conseilles ?",
        "Il fait très chaud, quelles activités en intérieur ?",
        "Mon budget est presque épuisé, que faire gratuitement ?"
    ]

    for question in questions:
        print(f"Utilisateur : {question}")
        result = chat_with_agent(question, history, trip)
        print(f"Agent : {result['response']}")
        print("-" * 60)
        history.append({"role": "user", "content": question})
        history.append({"role": "assistant", "content": result['response']})