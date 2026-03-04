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
# Pre-download the sentence-transformers model during build
# This avoids download timeout at runtime on Cloud Run
# ============================================
RUN python -c "from sentence_transformers import SentenceTransformer; SentenceTransformer('sentence-transformers/all-MiniLM-L6-v2')"

# ============================================
# Setup Nginx (React frontend)
# ============================================
# Remove default nginx configs
RUN rm -f /etc/nginx/sites-enabled/default /etc/nginx/conf.d/default.conf

# Copy nginx config as TEMPLATE (port will be injected at runtime)
COPY nginx.conf /etc/nginx/conf.d/default.conf.template

# Copy built React app from stage 1
COPY --from=frontend-builder /app/dist /usr/share/nginx/html

# Ensure nginx html directory has proper permissions
RUN chmod -R 755 /usr/share/nginx/html

# ============================================
# Setup Supervisor (runs both Nginx + Uvicorn)
# ============================================
COPY supervisord.conf /etc/supervisor/conf.d/supervisord.conf
RUN sed -i 's/\r$//' /etc/supervisor/conf.d/supervisord.conf

# Create supervisor log directory
RUN mkdir -p /var/log/supervisor

# ============================================
# Startup script (injects PORT into nginx config)
# Fix Windows CRLF line endings → Unix LF
# ============================================
COPY start.sh /start.sh
RUN sed -i 's/\r$//' /start.sh && chmod +x /start.sh

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
# NOTE: Do NOT set PORT here - Cloud Run sets PORT automatically
# The chatbot backend port (8001) is hardcoded in supervisord.conf
# Nginx listens on PORT (set by Cloud Run, default 8080)
ENV CHATBOT_PORT="8001"
ENV PYTHONUNBUFFERED="1"

# Set working directory back to root for supervisor
WORKDIR /

# Expose port 8080 (Cloud Run default)
EXPOSE 8080

# Health check (Cloud Run uses its own, this is for local Docker)
HEALTHCHECK --interval=30s --timeout=10s --start-period=120s --retries=5 \
  CMD curl -f http://localhost:${PORT:-8080}/ || exit 1

# Start via script (injects PORT into nginx, then runs supervisor)
CMD ["/start.sh"]
