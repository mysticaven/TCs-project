const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config();
const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Serve React Frontend Static Files (from /dist)
app.use(express.static(path.join(__dirname, '../dist')));

// Global state to store the latest offer triggered by the Raspberry Pi Camera
let latestIoTOffer = null;

// Mock Data
const kpiData = {
  liveRevenue: 15420,
  occupancyRate: 85,
  wasteRiskLevel: 'High'
};

const aiRecommendations = [
  {
    id: 1,
    trigger: 'Mutton Curry sales are 40% below target',
    action: 'Create a 15% discount bundle with Cold Coffee',
    impact: '+₹1,200 revenue',
    status: 'pending'
  },
  {
    id: 2,
    trigger: 'Tomatoes expiring in <12 hours',
    action: 'Recommend Tomato Soup as "Chef\'s Special" today',
    impact: 'Save ₹400 in waste',
    status: 'pending'
  }
];

const inventory = [
  { id: 1, name: 'Tomatoes', category: 'Groceries', status: 'Red', expiry: '< 12 hours', stock: '10 kg' },
  { id: 2, name: 'Milk', category: 'Beverages', status: 'Orange', expiry: '1 Day', stock: '20 Liters' },
  { id: 3, name: 'Chicken', category: 'Main Course', status: 'Green', expiry: '3 Days', stock: '50 kg' },
  { id: 4, name: 'Cold Coffee Beans', category: 'Beverages', status: 'Green', expiry: '1 Month', stock: '5 kg' },
  { id: 5, name: 'Mutton', category: 'Main Course', status: 'Orange', expiry: '2 Days', stock: '15 kg' },
];

const salesPrediction = [
  { time: '10:00', actual: 2000, predicted: 2200 },
  { time: '11:00', actual: 3500, predicted: 3000 },
  { time: '12:00', actual: 4000, predicted: 4500 },
  { time: '13:00', actual: 6000, predicted: 6500 }, // Peak
  { time: '14:00', actual: 5500, predicted: 5000 },
  { time: '15:00', actual: 3000, predicted: 3500 },
];

// API Routes
app.get('/api/kpi', (req, res) => res.json(kpiData));
app.get('/api/recommendations', (req, res) => res.json(aiRecommendations));
app.get('/api/inventory', (req, res) => res.json(inventory));
app.get('/api/sales', (req, res) => res.json(salesPrediction));

app.post('/api/recommendations/:id/approve', (req, res) => {
  const { id } = req.params;
  const index = aiRecommendations.findIndex(r => r.id === parseInt(id));
  if (index !== -1) {
    aiRecommendations[index].status = 'approved';
    res.json({ message: 'Recommendation approved successfully' });
  } else {
    res.status(404).json({ error: 'Recommendation not found' });
  }
});

app.post('/api/recommendations/:id/dismiss', (req, res) => {
  const { id } = req.params;
  const index = aiRecommendations.findIndex(r => r.id === parseInt(id));
  if (index !== -1) {
    aiRecommendations[index].status = 'dismissed';
    res.json({ message: 'Recommendation dismissed successfully' });
  } else {
    res.status(404).json({ error: 'Recommendation not found' });
  }
});

// IoT Endpoint: Receive camera data from Raspberry Pi
app.post('/api/cart/sync', async (req, res) => {
  const { device_id, cart } = req.body;
  console.log(`\n[IoT CLOUD] Received camera data from ${device_id}:`, cart);

  try {
    // 1. Send the Raspberry Pi camera data to the Python ML Engine running on AWS
    // For local testing, it defaults to port 8000 if the Env Var is missing.
    const pythonApiUrl = process.env.PYTHON_API_URL || 'http://127.0.0.1:8000';
    const mlResponse = await fetch(`${pythonApiUrl}/predict_bundle`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ items: cart })
    });

    if (!mlResponse.ok) throw new Error("ML Service unreachable");
    
    const mlData = await mlResponse.json();

    // 2. If the ML Engine found a bundle, save it globally so the Frontend can display it
    if (mlData.recommendation) {
      console.log(`[IoT CLOUD] ML Engine generated offer: ${mlData.discountText}`);
      latestIoTOffer = {
        triggerItem: cart.join(", "),
        offerItem: { name: mlData.recommendation }, // Mocked structure for frontend
        discountText: mlData.discountText,
        message: mlData.message,
        aiType: `Cloud Market Basket Analysis (Lift: ${mlData.lift})`
      };
    } else {
      console.log(`[IoT CLOUD] No bundle generated for this cart.`);
      latestIoTOffer = null;
    }

    res.json({ success: true, ai_response: mlData });

  } catch (error) {
    console.error(`[IoT CLOUD ERROR] Failed to contact Python ML Engine: ${error.message}`);
    console.log("Ensure you run: python ml_models/cloud_ml_api.py");
    res.status(500).json({ error: 'ML Engine Offline' });
  }
});

// Frontend Polling Endpoint: React will constantly check this to see if the camera triggered an offer
app.get('/api/iot/latest_offer', (req, res) => {
  if (latestIoTOffer) {
    // Send the offer and then clear it so it doesn't pop up infinitely
    const offerToSend = latestIoTOffer;
    latestIoTOffer = null;
    res.json({ new_offer: true, offer: offerToSend });
  } else {
    res.json({ new_offer: false });
  }
});

// Catch-all route to serve the React index.html for any unknown routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../dist/index.html'));
});

app.listen(PORT, () => {
  console.log(`Smart AI Manager Backend running on port ${PORT}`);
});
