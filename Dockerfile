# ─── Phase 1: Build React Frontend ─────────────────────────────────────────
FROM node:18-alpine AS build-stage
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# ─── Phase 2: Python FastAPI Backend ────────────────────────────────────────
FROM python:3.11-slim
WORKDIR /app

# System dependencies (libpq for PostgreSQL/RDS, gcc for some pip packages)
RUN apt-get update && apt-get install -y --no-install-recommends \
    gcc python3-dev libpq-dev curl \
    && rm -rf /var/lib/apt/lists/*

# Install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy all application code
COPY . .

# Copy built React frontend from build stage
COPY --from=build-stage /app/dist ./dist

# ─── Environment defaults (override these in ECS Task Definition) ────────────
# DATABASE_URL: set to PostgreSQL RDS URL in ECS env vars
#   e.g. postgresql://user:pass@your-rds-endpoint:5432/smartai
# PORT: ECS sets this automatically, default 8000
ENV DATABASE_URL="sqlite:///./smartai.db"
ENV PORT=8000

# Expose port
EXPOSE 8000

# ─── Production startup: uvicorn directly (not python main.py) ───────────────
# Uses PORT env var — ECS can override this dynamically
CMD ["sh", "-c", "uvicorn main:app --host 0.0.0.0 --port ${PORT} --workers 1"]
