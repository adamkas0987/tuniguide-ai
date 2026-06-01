# weather.py
import requests
import os
from dotenv import load_dotenv

load_dotenv()

API_KEY = os.getenv("OPENWEATHER_API_KEY")

VILLES_COORDS = {
    "Tunis":    {"lat": 36.8065, "lng": 10.1815},
    "Sousse":   {"lat": 35.8256, "lng": 10.6369},
    "Sfax":     {"lat": 34.7406, "lng": 10.7603},
    "Djerba":   {"lat": 33.8076, "lng": 10.8451},
    "Kairouan": {"lat": 35.6781, "lng": 10.0963},
    "El Jem":   {"lat": 35.2963, "lng": 10.7072},
}

def get_weather(city):
    """Récupère la météo actuelle d'une ville tunisienne."""
    coords = VILLES_COORDS.get(city)
    if not coords:
        return None

    url = "https://api.openweathermap.org/data/2.5/weather"
    params = {
        "lat":   coords["lat"],
        "lon":   coords["lng"],
        "appid": API_KEY,
        "units": "metric",
        "lang":  "fr"
    }

    try:
        response = requests.get(url, params=params, timeout=10)
        response.raise_for_status()
        data = response.json()

        return {
            "city":        city,
            "temperature": round(data["main"]["temp"]),
            "feels_like":  round(data["main"]["feels_like"]),
            "humidity":    data["main"]["humidity"],
            "description": data["weather"][0]["description"],
            "icon":        data["weather"][0]["icon"],
            "is_sunny":    is_sunny(data["weather"][0]["main"]),
            "wind_speed":  data["wind"]["speed"]
        }
    except Exception as e:
        print(f"Erreur météo {city} : {e}")
        return None

def is_sunny(weather_main):
    """Vérifie si le temps est ensoleillé."""
    sunny_conditions = ["Clear", "Clouds"]
    return weather_main in sunny_conditions

def get_weather_advice(weather):
    """Donne un conseil selon la météo."""
    if not weather:
        return "Météo non disponible"

    temp = weather["temperature"]
    sunny = weather["is_sunny"]

    if temp > 35:
        return "Très chaud — privilégiez les activités en intérieur (musées, cafés)"
    elif temp > 25 and sunny:
        return "Temps idéal — parfait pour la plage et les visites en plein air"
    elif temp > 15:
        return "Temps agréable — idéal pour explorer la médina et les sites historiques"
    else:
        return "Temps frais — recommandé pour les musées et restaurants"

if __name__ == "__main__":
    print("Test météo...")
    for city in ["Tunis", "Sousse", "Djerba"]:
        weather = get_weather(city)
        if weather:
            print(f"\n{city}:")
            print(f"  Température : {weather['temperature']}°C")
            print(f"  Description : {weather['description']}")
            print(f"  Ensoleillé  : {weather['is_sunny']}")
            print(f"  Conseil     : {get_weather_advice(weather)}")
        else:
            print(f"\n{city}: données non disponibles")