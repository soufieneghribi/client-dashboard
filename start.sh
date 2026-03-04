#!/bin/sh
# Cloud Run Startup Script
# Injects PORT into nginx config, then starts supervisor

NGINX_PORT="${PORT:-8080}"

echo "[START] Configuring nginx on port $NGINX_PORT"

sed "s/\${NGINX_PORT}/$NGINX_PORT/g" /etc/nginx/conf.d/default.conf.template > /etc/nginx/conf.d/default.conf

echo "[OK] Nginx configured on port $NGINX_PORT"

exec /usr/bin/supervisord -c /etc/supervisor/conf.d/supervisord.conf
