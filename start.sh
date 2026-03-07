#!/bin/bash
set -e

echo "[START] Starting TN360 chatbot backend on port 8001..."
echo "[ENV DEBUG] OPENAI_API_KEY present: $([ -n \"$OPENAI_API_KEY\" ] && echo 'YES (${OPENAI_API_KEY:0:12}...)' || echo 'EMPTY!')"
echo "[ENV DEBUG] OPENAI_MODEL=$OPENAI_MODEL"

# Start chatbot in background
cd /chatbot
python -m uvicorn app.main:app \
  --host 0.0.0.0 \
  --port 8001 \
  --log-level info \
  --timeout-keep-alive 300 &

CHATBOT_PID=$!

# Wait for chatbot to be fully ready (max 120 seconds)
echo "[WAIT] Waiting for chatbot backend to be ready..."
MAX_ATTEMPTS=60
for i in $(seq 1 $MAX_ATTEMPTS); do
  if curl -sf http://127.0.0.1:8001/api/health > /dev/null 2>&1; then
    echo "[OK] Chatbot backend is ready after ~$((i*2)) seconds!"
    break
  fi
  if ! kill -0 $CHATBOT_PID 2>/dev/null; then
    echo "[ERROR] Chatbot process died!"
    exit 1
  fi
  if [ "$i" -eq "$MAX_ATTEMPTS" ]; then
    echo "[ERROR] Chatbot did not start within $((MAX_ATTEMPTS*2)) seconds"
    exit 1
  fi
  sleep 2
done

# NOW start nginx in foreground (Cloud Run TCP probe will pass only now)
echo "[START] Starting nginx on port 8080..."
cd /
exec nginx -g "daemon off;"
