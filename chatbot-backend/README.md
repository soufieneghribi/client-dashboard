# TN360 RAG Chatbot Backend

Backend AI pour le chatbot TN360 avec architecture RAG complète.

## 🏗️ Architecture

```
FastAPI (Port 8001)
    ↓
LangChain + ChromaDB (287 produits indexés)
    ↓
HuggingFace Embeddings (all-MiniLM-L6-v2)
    ↓
Ollama LLM (Local, Gratuit)
```

## 📋 Prérequis

- Python 3.12+
- Ollama installé (https://ollama.ai)

## 🚀 Installation

```bash
# 1. Installer les dépendances
pip install -r requirements.txt

# 2. Télécharger le modèle Ollama (une seule fois)
ollama pull llama3.2

# 3. Configurer les variables d'environnement
# Le fichier .env existe déjà avec la configuration
```

## ▶️ Démarrage

### Option 1: Windows (Recommandé)
```bash
start.bat
```

### Option 2: Ligne de commande
```bash
python -m uvicorn app.main:app --host 0.0.0.0 --port 8001
```

Le backend sera accessible sur: http://localhost:8001

## 📊 Endpoints API

- `GET /` - Informations sur l'API
- `GET /api/health` - Santé du serveur + stats ChromaDB
- `GET /api/stats` - Statistiques du vector store
- `POST /api/chat` - Chat avec streaming SSE
- `POST /api/search` - Recherche sémantique de produits
- `POST /api/sync` - Synchroniser les produits depuis TN360 API

## 🧪 Tests

```bash
# Test de santé
curl http://localhost:8001/api/health

# Test de recherche sémantique
curl -X POST http://localhost:8001/api/search \
  -H "Content-Type: application/json" \
  -d '{"query": "produits pas cher", "n_results": 5}'

# Test du chatbot
curl -X POST http://localhost:8001/api/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "Bonjour!", "stream": false}'
```

## 🔧 Configuration

### Fichier `.env`
```env
# LLM Configuration (Ollama Local)
OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_MODEL=llama3.2
TEMPERATURE=0.1

# Vector Store
EMBEDDING_MODEL=sentence-transformers/all-MiniLM-L6-v2
CHROMA_PERSIST_DIR=./data/chromadb
CHROMA_COLLECTION=tn360_products

# TN360 API
TN360_API_URL=https://tn360-back-office-122923924979.europe-west1.run.app/api/v1

# Server
HOST=0.0.0.0
PORT=8001
CORS_ORIGINS=["http://localhost:5173","http://localhost:5174","http://localhost:5175"]
```

## 📁 Structure

```
chatbot-backend/
├── app/
│   ├── main.py              # FastAPI application
│   ├── config.py            # Configuration
│   └── services/
│       ├── vector_store.py  # ChromaDB + LangChain
│       ├── rag_engine.py    # RAG + Ollama LLM
│       └── tn360_api.py     # Client API TN360
├── data/
│   └── chromadb/            # Base vectorielle persistante
├── requirements.txt         # Dépendances Python
├── start.bat               # Script de démarrage Windows
└── .env                    # Variables d'environnement
```

## 💡 Fonctionnalités

### 1. **RAG (Retrieval-Augmented Generation)**
- Indexation automatique de 287 produits au démarrage
- Recherche sémantique avec HuggingFace embeddings
- Contexte enrichi pour des réponses précises

### 2. **Détection d'intention**
- Budget ("J'ai 1500 TND")
- Recommandations
- Promotions
- Navigation
- Support client

### 3. **Streaming**
- Réponses en temps réel via Server-Sent Events (SSE)
- Compatible avec tous les frameworks frontend

## 🔄 Synchronisation

Les produits sont automatiquement synchronisés depuis l'API TN360 au démarrage.

Pour forcer une resynchronisation:
```bash
curl -X POST http://localhost:8001/api/sync
```

## 🐛 Dépannage

**Problème: Port 8001 déjà utilisé**
```bash
# Trouver le processus
netstat -ano | findstr :8001

# Tuer le processus (remplacer PID)
taskkill /PID <PID> /F
```

**Problème: ChromaDB vide**
```bash
# Resynchroniser
curl -X POST http://localhost:8001/api/sync
```

**Problème: Ollama non disponible**
```bash
# Vérifier qu'Ollama est lancé
ollama list

# Démarrer le service Ollama
# (Il démarre automatiquement après installation)
```

## 📝 Notes

- **Temperature**: 0.1 pour des réponses factuelles et cohérentes
- **Embeddings**: Modèle local, pas besoin d'API externe
- **Ollama**: LLM local, gratuit, sans limite
- **ChromaDB**: Persistance locale des embeddings

## 🚀 Utilisation avec Frontend React

Le frontend React sur port 5175 se connecte automatiquement.

Variables d'environnement frontend (.env):
```env
VITE_CHATBOT_API_URL=http://localhost:8001
```
