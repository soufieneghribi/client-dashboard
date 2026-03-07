# ============================================
# MULTI-STAGE DOCKERFILE
# React (Nginx) + FastAPI Chatbot Backend
# Optimized for Cloud Run deployment
# ============================================

# ============================================
# Stage 1: Build the React application
# ============================================
FROM node:18-alpine AS frontend-builder

WORKDIR /app

COPY package*.json ./
RUN npm ci --silent

COPY src ./src
COPY public ./public
COPY index.html ./
COPY vite.config.js ./
COPY tailwind.config.js ./
COPY postcss.config.js ./
COPY eslint.config.js ./

# Force empty URL for production build (uses relative paths)
ENV VITE_CHATBOT_URL=""
RUN npm run build

# ============================================
# Stage 2: Production image (Nginx + Python)
# ============================================
FROM python:3.11-slim

# Install Nginx, supervisor, curl
RUN apt-get update && apt-get install -y --no-install-recommends \
    nginx \
    curl \
    && rm -rf /var/lib/apt/lists/*

# ============================================
# Setup Python (FastAPI chatbot backend)
# ============================================
WORKDIR /chatbot

COPY chatbot-backend/requirements.txt .

# ⚠️ CRITIQUE: Installer PyTorch CPU-only EN PREMIER
# Sans ça, sentence-transformers tire PyTorch+CUDA (~5-8GB) → timeout Cloud Run
# CPU-only = ~400MB seulement
RUN pip install --no-cache-dir \
    torch==2.2.2 \
    --index-url https://download.pytorch.org/whl/cpu

# Installer le reste (sentence-transformers utilisera le torch CPU déjà installé)
RUN pip install --no-cache-dir -r requirements.txt

COPY chatbot-backend/app ./app

RUN mkdir -p /chatbot/data/chromadb

# Pré-télécharger le modèle sentence-transformers pendant le BUILD
# (évite le téléchargement au démarrage du conteneur = évite le timeout)
RUN python -c "\
from sentence_transformers import SentenceTransformer; \
model = SentenceTransformer('sentence-transformers/all-MiniLM-L6-v2'); \
print('[OK] Model pre-downloaded successfully')"

# ============================================
# Setup Nginx
# ============================================
RUN rm -f /etc/nginx/sites-enabled/default /etc/nginx/conf.d/default.conf

COPY nginx.conf /etc/nginx/conf.d/default.conf

COPY --from=frontend-builder /app/dist /usr/share/nginx/html
RUN chmod -R 755 /usr/share/nginx/html

# ============================================
# Setup startup script (replaces supervisor)
# nginx starts ONLY after chatbot is ready
# ============================================
COPY start.sh /start.sh
RUN sed -i 's/\r$//' /start.sh && chmod +x /start.sh

# ============================================
# Environment variables
# ============================================
ENV OPENAI_API_KEY=""
ENV OPENAI_MODEL="gpt-4.1-mini"
ENV TEMPERATURE="0.3"
ENV TN360_API_URL="https://tn360-back-office-122923924979.europe-west1.run.app/api/v1"
ENV EMBEDDING_MODEL="sentence-transformers/all-MiniLM-L6-v2"
ENV CHROMA_PERSIST_DIR="/chatbot/data/chromadb"
ENV HOST="0.0.0.0"
# CHATBOT_PORT = port interne FastAPI (8001)
# PORT = 8080 injecté par Cloud Run → utilisé par Nginx
ENV CHATBOT_PORT="8001"
ENV PORT="8080"
ENV PYTHONUNBUFFERED="1"

WORKDIR /

# Cloud Run route le trafic vers PORT=8080 — Nginx écoute sur 8080
EXPOSE 8080

# Start: chatbot first, then nginx (no more 502 on cold start)
CMD ["/start.sh"]
