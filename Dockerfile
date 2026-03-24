# Stage 1: Build the SvelteKit frontend
FROM node:20-slim AS frontend-builder
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm install
COPY frontend/ ./
RUN npm run build

# Stage 2: Setup the Flask backend
FROM python:3.11-slim
WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    git \
    && rm -rf /var/lib/apt/lists/*

# Copy backend requirements and install
COPY backend/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy backend code
COPY backend/ ./

# Copy built frontend from Stage 1 into Flask static folder
COPY --from=frontend-builder /app/frontend/build ./static

# Expose ports (Flask / SocketIO)
EXPOSE 5000

# Default command: run the production server
# Note: In true production, you might use gunicorn:
# CMD ["gunicorn", "--worker-class", "gevent", "-w", "1", "run:application", "-b", "0.0.0.0:5000"]
CMD ["python", "run.py", "--host", "0.0.0.0", "--port", "5000"]
