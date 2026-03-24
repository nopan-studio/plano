#!/usr/bin/env bash
# ─── Plano start script ──────────────────────────────────────────────────────────────────
# Handles: venv activation, port conflicts, health check, background mode for BOTH
# backend and frontend.
#
# Usage:
#   ./start.sh              → start both services (frontend in foreground)
#   ./start.sh --port 5000  → use a different backend port
#   ./start.sh --bg         → run both in background
#   ./start.sh --stop       → stop both processes
# ──────────────────────────────────────────────────────────────────────────────

set -euo pipefail

PORT=5000
FRONTEND_PORT=5173
BG=false
STOP=false
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# ── Parse args ─────────────────────────────────────────────────────────────────
while [[ $# -gt 0 ]]; do
  case "$1" in
    --port)   PORT="$2"; shift 2 ;;
    --bg)     BG=true; shift ;;
    --stop)   STOP=true; shift ;;
    *)        echo "Unknown arg: $1"; exit 1 ;;
  esac
done

PID_FILE="$SCRIPT_DIR/.plano.pid"
FRONTEND_PID_FILE="$SCRIPT_DIR/.frontend.pid"

# ── Stop ───────────────────────────────────────────────────────────────────────
if $STOP; then
  echo "🛑 Stopping Plano ecosystem..."
  
  # Backend
  if [[ -f "$PID_FILE" ]]; then
    PID=$(cat "$PID_FILE")
    if kill -0 "$PID" 2>/dev/null; then
      kill "$PID"
      echo "✓ Stopped Backend (pid $PID)"
    fi
    rm -f "$PID_FILE"
  fi
  
  # Frontend
  if [[ -f "$FRONTEND_PID_FILE" ]]; then
    PID=$(cat "$FRONTEND_PID_FILE")
    if kill -0 "$PID" 2>/dev/null; then
      kill "$PID"
      echo "✓ Stopped Frontend (pid $PID)"
    fi
    rm -f "$FRONTEND_PID_FILE"
  fi
  
  # Port cleaning fallback
  if command -v fuser &>/dev/null; then
    fuser -k "${PORT}/tcp" 2>/dev/null && echo "✓ Cleaned backend port $PORT" || true
    fuser -k "${FRONTEND_PORT}/tcp" 2>/dev/null && echo "✓ Cleaned frontend port $FRONTEND_PORT" || true
  fi
  
  exit 0
fi

cd "$SCRIPT_DIR"

# ── Activate venv ──────────────────────────────────────────────────────────────
if [[ -d "venv" ]]; then
  source venv/bin/activate
  echo "✓ venv activated"
elif [[ -d ".venv" ]]; then
  source .venv/bin/activate
  echo "✓ .venv activated"
else
  echo "✗ No venv found. Run:"
  echo "    python3 -m venv .venv && source .venv/bin/activate && pip install -r requirements.txt"
  exit 1
fi

# ── Check dependencies ─────────────────────────────────────────────────────────
python -c "import flask, flask_sqlalchemy, flask_cors, socketio, gevent" 2>/dev/null || {
  echo "Installing backend dependencies..."
  if [[ -f "backend/requirements.txt" ]]; then
    pip install -r backend/requirements.txt -q
  else
    pip install flask flask-sqlalchemy flask-cors flask-socketio gevent gevent-websocket -q
  fi
}

if [[ ! -d "frontend/node_modules" ]]; then
  echo "Installing frontend dependencies..."
  cd frontend && npm install --silent && cd ..
fi

# ── Clear ports if occupied ───────────────────────────────────────────────────
for p in "$PORT" "$FRONTEND_PORT"; do
  if command -v fuser &>/dev/null; then
    fuser -k "${p}/tcp" 2>/dev/null && echo "⚠ Freed port $p" || true
  elif command -v lsof &>/dev/null; then
    OCCUPANT=$(lsof -ti tcp:$p 2>/dev/null || true)
    if [[ -n "$OCCUPANT" ]]; then
      kill -9 $OCCUPANT 2>/dev/null || true
      echo "⚠ Freed port $p"
    fi
  fi
done

# ── Start ecosystem ───────────────────────────────────────────────────────────
echo ""
echo "  ┌───────────────────────────────────────────────────┐"
echo "  │  Plano Ecosystem Protocol Initializing            │"
echo "  │                                                   │"
echo "  │  Backend  →  http://localhost:${PORT}/api             │"
echo "  │  Frontend →  http://localhost:${FRONTEND_PORT}            │"
echo "  └───────────────────────────────────────────────────┘"
echo ""

# 1. Start Backend
# We always start backend in background initially so we can wait for health
cd backend
python run.py --port "$PORT" > plano.log 2>&1 &
BACKEND_PID=$!
echo "$BACKEND_PID" > "$PID_FILE"

# Wait for backend health
echo -n "Waiting for backend"
for i in $(seq 1 20); do
  sleep 0.5
  if curl -sf "http://localhost:${PORT}/health" >/dev/null 2>&1; then
    echo " ✓ (READY)"
    break
  fi
  echo -n "."
  if [[ $i -eq 20 ]]; then
    echo ""
    echo "✗ Backend didn't respond after 10s — check backend/plano.log"
    kill "$BACKEND_PID" 2>/dev/null || true
    rm -f "$PID_FILE"
    exit 1
  fi
done

# 2. Start Frontend
cd ../frontend
if $BG; then
  nohup npm run dev -- --port "$FRONTEND_PORT" > ../frontend.log 2>&1 &
  echo $! > "$FRONTEND_PID_FILE"
  echo "✓ Frontend started in background (pid $!)"
  echo "Stopping with: ./start.sh --stop"
else
  echo "✓ Starting Frontend (foreground)..."
  # Trap to kill backend on exit since we're in foreground
  trap "kill $BACKEND_PID 2>/dev/null || true; rm -f $PID_FILE $FRONTEND_PID_FILE; echo 'Stopping Plano...'; exit" SIGINT SIGTERM
  
  # Run frontend in foreground
  npm run dev -- --port "$FRONTEND_PORT"
fi
