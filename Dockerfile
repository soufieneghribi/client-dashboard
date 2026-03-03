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

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --silent

# Copy source code (excluding chatbot-backend)
COPY . .

# Build the application
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
# Setup Nginx (React frontend)
# ============================================
# Remove default nginx config
RUN rm -f /etc/nginx/sites-enabled/default /etc/nginx/conf.d/default.conf

# Copy custom nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy built React app
COPY --from=frontend-builder /app/dist /usr/share/nginx/html

# Copy public assets
COPY --from=frontend-builder /app/public/robots.txt /usr/share/nginx/html/robots.txt
COPY --from=frontend-builder /app/public/sitemap.xml /usr/share/nginx/html/sitemap.xml
COPY --from=frontend-builder /app/public/manifest.json /usr/share/nginx/html/manifest.json

# ============================================
# Setup Python (FastAPI chatbot backend)
# ============================================
WORKDIR /chatbot

# Copy requirements and install Python dependencies
COPY chatbot-backend/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy chatbot backend code
COPY chatbot-backend/app ./app
COPY chatbot-backend/run.py .

# Create data directory for ChromaDB
RUN mkdir -p /chatbot/data/chromadb

# ============================================
# Setup Supervisor (runs both Nginx + Uvicorn)
# ============================================
COPY supervisord.conf /etc/supervisor/conf.d/supervisord.conf

# ============================================
# Environment variables (overridable at runtime)
# ============================================
ENV OPENAI_API_KEY=""
ENV OPENAI_MODEL="gpt-4.1-mini"
ENV TEMPERATURE="0.3"
ENV TN360_API_URL="https://tn360-back-office-122923924979.europe-west1.run.app/api/v1"
ENV EMBEDDING_MODEL="sentence-transformers/all-MiniLM-L6-v2"
ENV CHROMA_PERSIST_DIR="/chatbot/data/chromadb"
ENV HOST="0.0.0.0"
ENV PORT="8000"
ENV CORS_ORIGINS='["http://localhost","http://localhost:80"]'

# Expose port 80 (Cloud Run expects one port)
EXPOSE 80

# Health check
HEALTHCHECK --interval=30s --timeout=5s --start-period=30s --retries=3 \
  CMD curl -f http://localhost/health && curl -f http://localhost:8000/api/health || exit 1

# Start supervisor (manages nginx + uvicorn)
CMD ["/usr/bin/supervisord", "-c", "/etc/supervisor/conf.d/supervisord.conf"]
