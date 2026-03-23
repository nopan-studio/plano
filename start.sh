#!/usr/bin/env bash
# ─── Plano start script ──────────────────────────────────────────────────────────────────
# Handles: venv activation, port conflicts, health check, background mode
#
# Usage:
#   ./start.sh              → start on port 5000 (foreground)
#   ./start.sh --port 5001  → use a different port
#   ./start.sh --bg         → run in background, write PID to .pid
#   ./start.sh --stop       → stop background process
# ──────────────────────────────────────────────────────────────────────────────

set -euo pipefail

PORT=5000
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

# ── Stop ───────────────────────────────────────────────────────────────────────
if $STOP; then
  if [[ -f "$PID_FILE" ]]; then
    PID=$(cat "$PID_FILE")
    if kill -0 "$PID" 2>/dev/null; then
      kill "$PID"
      echo "Stopped Plano (pid $PID)"
    else
      echo "Process $PID not running"
    fi
    rm -f "$PID_FILE"
  else
    echo "No .plano.pid found — trying fuser..."
    fuser -k "${PORT}/tcp" 2>/dev/null && echo "Killed process on port $PORT" || echo "Nothing on port $PORT"
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
python -c "import flask, flask_sqlalchemy, flask_cors" 2>/dev/null || {
  echo "Installing dependencies..."
  pip install -r backend/requirements.txt -q
}

# ── Clear port if occupied ─────────────────────────────────────────────────────
if command -v fuser &>/dev/null; then
  OCCUPANT=$(fuser "${PORT}/tcp" 2>/dev/null || true)
  if [[ -n "$OCCUPANT" ]]; then
    echo "⚠ Port $PORT in use by PID $OCCUPANT — killing..."
    fuser -k "${PORT}/tcp" 2>/dev/null || true
    sleep 1
    echo "✓ Port $PORT freed"
  fi
elif command -v lsof &>/dev/null; then
  OCCUPANT=$(lsof -ti tcp:$PORT 2>/dev/null || true)
  if [[ -n "$OCCUPANT" ]]; then
    echo "⚠ Port $PORT in use by PID $OCCUPANT — killing..."
    kill -9 $OCCUPANT 2>/dev/null || true
    sleep 1
    echo "✓ Port $PORT freed"
  fi
fi

# ── Start server ───────────────────────────────────────────────────────────────
echo ""
echo "  ┌─────────────────────────────────────────┐"
echo "  │  Plano      →  http://localhost:${PORT}     │"
echo "  │  Health     →  /health                  │"
echo "  │  API docs   →  /api                     │"
echo "  └─────────────────────────────────────────┘"
echo ""

cd backend

if $BG; then
  nohup python run.py --port "$PORT" > plano.log 2>&1 &
  echo $! > "$PID_FILE"
  BG_PID=$(cat "$PID_FILE")
  echo "Started in background (pid $BG_PID) — logs in backend/plano.log"
  echo "Stop with: ./start.sh --stop"

  # Wait for server to become healthy
  echo -n "Waiting for server"
  for i in $(seq 1 20); do
    sleep 0.5
    if curl -sf "http://localhost:${PORT}/health" >/dev/null 2>&1; then
      echo ""
      echo "✓ Server is healthy at http://localhost:${PORT}"
      break
    fi
    echo -n "."
    if [[ $i -eq 20 ]]; then
      echo ""
      echo "✗ Server didn't respond after 10s — check backend/plano.log"
      exit 1
    fi
  done
else
  exec python run.py --port "$PORT"
fi
