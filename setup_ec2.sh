#!/bin/bash
# ═══════════════════════════════════════════════════════════════════
#  Smart AI Manager - EC2 ONE-CLICK SETUP SCRIPT
#  Run this after SSH-ing into your EC2 Ubuntu instance.
#  Command: bash setup_ec2.sh
# ═══════════════════════════════════════════════════════════════════

set -e  # Exit if any command fails
echo "🚀 Starting Smart AI Manager EC2 Setup..."

# ── 1. Update system and install dependencies ──
echo "📦 Installing system dependencies..."
sudo apt update -y && sudo apt upgrade -y
sudo apt install -y nodejs npm python3-pip python3-venv git nginx

# ── 2. Install pm2 globally to keep apps alive ──
echo "⚙️  Installing PM2..."
sudo npm install -g pm2

# ── 3. Clone your GitHub repository ──
echo "📥 Cloning project from GitHub..."
cd /home/ubuntu
if [ -d "TCs-project" ]; then
  echo "Project already cloned. Pulling latest changes..."
  cd TCs-project && git pull
else
  git clone https://github.com/mysticaven/TCs-project.git
  cd TCs-project
fi

# ── 4. Install Node.js dependencies ──
echo "📦 Installing Node.js packages..."
npm install

# ── 5. Setup Python virtual environment and install ML deps ──
echo "🐍 Setting up Python ML environment..."
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt

# ── 6. Generate training data and train the ML model ──
echo "🤖 Generating data and training ML Model (this takes ~5 min)..."
python3 ml_models/generate_catalog.py
python3 ml_models/generate_massive_data.py
python3 ml_models/train_on_massive.py
deactivate

# ── 7. Build the React Frontend ──
echo "⚛️  Building React Frontend..."
npm run build

# ── 8. Start all services with PM2 ──
echo "🟢 Starting all services with PM2..."
# Stop old services if they exist
pm2 delete all 2>/dev/null || true

# Start Python ML API (port 8000)
pm2 start ".venv/bin/uvicorn ml_models.cloud_ml_api:app --host 0.0.0.0 --port 8000" --name ml-engine

# Wait for ML to start
sleep 3

# Start Node.js Backend (port 5000) - also serves the React Frontend
pm2 start backend/server.js --name node-backend

# Save PM2 configuration (survives reboots)
pm2 save
pm2 startup | tail -1 | sudo bash

echo ""
echo "═══════════════════════════════════════════════════════════════"
echo "✅ SETUP COMPLETE!"
echo ""
echo "  🌐 Your Dashboard:  http://$(curl -s http://169.254.169.254/latest/meta-data/public-ipv4):5000"
echo "  🤖 ML API Health:   http://$(curl -s http://169.254.169.254/latest/meta-data/public-ipv4):8000/docs"
echo "  📋 Backend Health:  http://$(curl -s http://169.254.169.254/latest/meta-data/public-ipv4):5000/api/kpi"
echo ""
echo "  PM2 Commands:"
echo "    pm2 status      → Check if services are running"
echo "    pm2 logs        → See live logs"
echo "    pm2 restart all → Restart after git pull"
echo "═══════════════════════════════════════════════════════════════"
