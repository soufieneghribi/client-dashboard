#!/bin/bash
# ============================================
# Cloud Run Startup Script
# Injects PORT into nginx config, then starts supervisor
# ============================================

# Cloud Run sets PORT (default 8080)
export NGINX_PORT="${PORT:-8080}"

echo "[START] Using port: $NGINX_PORT"

# Substitute NGINX_PORT into nginx config template
envsubst '${NGINX_PORT}' < /etc/nginx/conf.d/default.conf.template > /etc/nginx/conf.d/default.conf

echo "[OK] Nginx configured on port $NGINX_PORT"

# Start supervisor (manages nginx + uvicorn)
exec /usr/bin/supervisord -c /etc/supervisor/conf.d/supervisord.conf
