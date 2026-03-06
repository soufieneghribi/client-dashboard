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

RUN npm run build

# ============================================
# Stage 2: Production image (Nginx + Python)
# ============================================
FROM python:3.12-slim

# Install Nginx, supervisor, curl
RUN apt-get update && apt-get install -y --no-install-recommends \
    nginx \
    supervisor \
    curl \
    && rm -rf /var/lib/apt/lists/*

# ============================================
# Setup Python (FastAPI chatbot backend)
# ============================================
WORKDIR /chatbot

COPY chatbot-backend/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt && \
    pip install --no-cache-dir gunicorn

COPY chatbot-backend/app ./app

RUN mkdir -p /chatbot/data/chromadb

# Pre-download sentence-transformers model during build
RUN python -c "from sentence_transformers import SentenceTransformer; SentenceTransformer('sentence-transformers/all-MiniLM-L6-v2')"

# ============================================
# Setup Nginx
# ============================================
RUN rm -f /etc/nginx/sites-enabled/default /etc/nginx/conf.d/default.conf

COPY nginx.conf /etc/nginx/conf.d/default.conf

COPY --from=frontend-builder /app/dist /usr/share/nginx/html
RUN chmod -R 755 /usr/share/nginx/html

# ============================================
# Setup Supervisor
# ============================================
COPY supervisord.conf /etc/supervisor/conf.d/supervisord.conf
RUN sed -i 's/\r$//' /etc/supervisor/conf.d/supervisord.conf
RUN mkdir -p /var/log/supervisor

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
# CHATBOT_PORT = port interne de FastAPI (8001, PAS 8080)
# PORT = 8080 est injecté par Cloud Run et utilisé par Nginx
ENV CHATBOT_PORT="8001"
ENV PORT="8080"
ENV PYTHONUNBUFFERED="1"

WORKDIR /

# Cloud Run route le trafic vers PORT=8080 — c'est Nginx qui l'expose
EXPOSE 8080

# Start supervisor directly (no startup script needed)
CMD ["supervisord", "-n", "-c", "/etc/supervisor/conf.d/supervisord.conf"]
