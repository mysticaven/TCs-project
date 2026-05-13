# --- Phase 1: Build React Frontend ---
FROM node:18-alpine AS build-stage
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# --- Phase 2: Setup Python Backend ---
FROM python:3.11-slim
WORKDIR /app

# Install system dependencies (including psycopg2 for PostgreSQL)
RUN apt-get update && apt-get install -y --no-install-recommends \
    gcc \
    python3-dev \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements and install
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy backend code and the built frontend
COPY . .
COPY --from=build-stage /app/dist ./dist

# Expose port 8000
EXPOSE 8000

# Run the application
CMD ["python", "main.py"]
