print("Test des imports...")

try:
    import flask
    print(f"  OK Flask {flask.__version__}")
except ImportError:
    print("  ERREUR Flask manquant")

try:
    import pymongo
    print(f"  OK PyMongo {pymongo.__version__}")
except ImportError:
    print("  ERREUR PyMongo manquant")

try:
    import pandas
    print(f"  OK Pandas {pandas.__version__}")
except ImportError:
    print("  ERREUR Pandas manquant")

try:
    import sklearn
    print(f"  OK Scikit-learn {sklearn.__version__}")
except ImportError:
    print("  ERREUR Scikit-learn manquant")

try:
    import dotenv
    print(f"  OK Python-dotenv installe")
except ImportError:
    print("  ERREUR python-dotenv manquant")

print()
print("Test connexion MongoDB...")

try:
    from pymongo import MongoClient
    client = MongoClient("mongodb://localhost:27017/", serverSelectionTimeoutMS=3000)
    client.server_info()
    print("  OK MongoDB connecte")
    client.close()
except Exception as e:
    print(f"  ERREUR MongoDB non connecte")
    print(f"  Detail : {e}")

print()
print("Tous les tests termines.")