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

# Copy source code (only what's needed for React build)
COPY src ./src
COPY public ./public
COPY index.html ./
COPY vite.config.js ./
COPY tailwind.config.js ./
COPY postcss.config.js ./
COPY eslint.config.js ./

# Build the application
RUN npm run build

# ============================================
# Stage 2: Production image (Nginx + Python)
# ============================================
FROM python:3.12-slim

# Install Nginx, supervisor, curl, and other essentials
RUN apt-get update && apt-get install -y --no-install-recommends \
    nginx \
    supervisor \
    curl \
    && rm -rf /var/lib/apt/lists/*

# ============================================
# Setup Python (FastAPI chatbot backend) FIRST
# ============================================
WORKDIR /chatbot

# Copy requirements and install Python dependencies
COPY chatbot-backend/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt && \
    pip install --no-cache-dir gunicorn

# Copy chatbot backend code (entire directory)
COPY chatbot-backend/app ./app

# Create data directory for ChromaDB (persistent volume in Cloud Run)
RUN mkdir -p /chatbot/data/chromadb

# ============================================
# Setup Nginx (React frontend)
# ============================================
# Remove default nginx configs
RUN rm -f /etc/nginx/sites-enabled/default /etc/nginx/conf.d/default.conf

# Copy custom nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy built React app from stage 1
COPY --from=frontend-builder /app/dist /usr/share/nginx/html

# Ensure nginx html directory has proper permissions
RUN chmod -R 755 /usr/share/nginx/html

# ============================================
# Setup Supervisor (runs both Nginx + Uvicorn)
# ============================================
COPY supervisord.conf /etc/supervisor/conf.d/supervisord.conf

# Create supervisor log directory
RUN mkdir -p /var/log/supervisor

# ============================================
# Environment variables (overridable at runtime via Cloud Run)
# ============================================
ENV OPENAI_API_KEY=""
ENV OPENAI_MODEL="gpt-4.1-mini"
ENV TEMPERATURE="0.3"
ENV TN360_API_URL="https://tn360-back-office-122923924979.europe-west1.run.app/api/v1"
ENV EMBEDDING_MODEL="sentence-transformers/all-MiniLM-L6-v2"
ENV CHROMA_PERSIST_DIR="/chatbot/data/chromadb"
ENV HOST="0.0.0.0"
ENV PORT="8001"
ENV PYTHONUNBUFFERED="1"

# Set working directory back to root for supervisor
WORKDIR /

# Expose port 80 (Cloud Run default)
EXPOSE 80

# Health check - very lenient for slow embedding models
# Wait 120s for backend to load embeddings + models + ChromaDB
HEALTHCHECK --interval=30s --timeout=10s --start-period=120s --retries=5 \
  CMD curl -f http://localhost/ || exit 1

# Start supervisor (manages nginx + uvicorn)
CMD ["/usr/bin/supervisord", "-c", "/etc/supervisor/conf.d/supervisord.conf"]
