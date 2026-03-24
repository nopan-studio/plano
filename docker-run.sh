#!/usr/bin/env bash
# ─── Plano Docker Management Script ──────────────────────────────────────────
# Handles: building, running, stopping, and logs for the Docker container.
# NOTE: This script is for SQLite-only quick starts. Use 'docker-compose' 
# if you need PostgreSQL support.
#
# Usage:
#   ./docker-run.sh build   → Build the docker image
#   ./docker-run.sh run     → Run the container (detached)
#   ./docker-run.sh start   → Build AND run
#   ./docker-run.sh stop    → Stop and remove the container
#   ./docker-run.sh logs    → Show container logs
#   ./docker-run.sh shell   → Open a shell inside the container
# ──────────────────────────────────────────────────────────────────────────────

IMAGE_NAME="plano-app"
CONTAINER_NAME="plano-container"
DB_PATH="$(pwd)/backend/plano.db"
LOG_PATH="$(pwd)/backend/plano.log"

case "$1" in
  build)
    echo "🏗️  Building Plano Docker image..."
    docker build -t $IMAGE_NAME .
    ;;
  run)
    echo "🚀 Running Plano container..."
    # Ensure database exists so it doesn't get created as a dir by docker
    touch "$DB_PATH"
    docker run -d \
      --name $CONTAINER_NAME \
      -p 5000:5000 \
      -v "$LOG_PATH:/app/plano.log" \
      --restart unless-stopped \
      $IMAGE_NAME
    echo "✓ Plano is running at http://localhost:5000"
    ;;
  start)
    $0 build
    $0 stop
    $0 run
    ;;
  stop)
    echo "🛑 Stopping Plano container..."
    docker stop $CONTAINER_NAME 2>/dev/null || true
    docker rm $CONTAINER_NAME 2>/dev/null || true
    echo "✓ Stopped."
    ;;
  logs)
    docker logs -f $CONTAINER_NAME
    ;;
  shell)
    docker exec -it $CONTAINER_NAME /bin/bash
    ;;
  *)
    echo "Usage: $0 {build|run|start|stop|logs|shell}"
    exit 1
    ;;
esac
