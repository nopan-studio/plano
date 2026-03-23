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

# Copy requirements and install
COPY backend/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy backend code
COPY backend/ ./
# static is now in backend/static, so it's copied by the line above

# Copy built frontend from Stage 1
# This assumes the build output is in frontend/build or similar
# For adapter-static, you'd copy to a folder Flask serves
# COPY --from=frontend-builder /app/frontend/build ./static/dist

# Expose ports for both Flask and potentially MCP
EXPOSE 5000

# Default command
CMD ["python", "run.py", "--host", "0.0.0.0"]
