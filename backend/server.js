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
// ─── Load ML Rules from trained CSV (at startup) ───────────────────────────
let mlRules = [];
const RULES_PATH = path.join(__dirname, '../ml_models/massive_trained_rules.csv');

function loadMlRules() {
  try {
    const raw = fs.readFileSync(RULES_PATH, 'utf-8');
    const lines = raw.trim().split('\n').slice(1); // skip header
    mlRules = lines.map(line => {
      // CSV columns: antecedents,consequents,antecedent support,consequent support,support,confidence,lift,...
      const cols = line.split(',');
      // Antecedent may be quoted e.g. "Garlic Bread, Wireless Mouse"
      const antRaw = line.match(/^"([^"]+)"|^([^,]+)/)?.[0] || '';
      const antecedents = antRaw.replace(/"/g, '').split(',').map(s => s.trim());
      // The consequents start after the first field
      const rest = line.slice(antRaw.length + 1); // skip antecedent + comma
      const conRaw = rest.match(/^"([^"]+)"|^([^,]+)/)?.[0] || '';
      const consequents = conRaw.replace(/"/g, '').split(',').map(s => s.trim());
      const numCols = rest.slice(conRaw.length + 1).split(',');
      return {
        antecedents,
        consequents,
        confidence: parseFloat(numCols[2]) || 0,
        lift: parseFloat(numCols[4]) || 0
      };
    }).filter(r => r.lift > 0);
    console.log(`✅ Loaded ${mlRules.length} ML rules from trained CSV`);
  } catch (e) {
    console.warn('⚠️  ML Rules CSV not found. Run train_on_massive.py first. Error:', e.message);
  }
}
loadMlRules();

// ─── Load Products from massive_sales_data.csv ─────────────────────────────
let PRODUCTS = [];
const SALES_CSV = path.join(__dirname, '../ml_models/massive_sales_data.csv');

function loadProducts() {
  try {
    const raw = fs.readFileSync(SALES_CSV, 'utf-8');
    const lines = raw.trim().split('\n').slice(1, 100000); // read up to 100k rows
    const seen = new Map();
    let id = 1;
    for (const line of lines) {
      // CSV: Transaction_ID,Date,Time,Product_Name,Category,Price,Quantity,Total_Sales,Is_Bundle_Triggered
      const cols = line.split(',');
      if (cols.length < 6) continue;
      const name = cols[3]?.trim();
      const category = cols[4]?.trim();
      const price = parseFloat(cols[5]) || 9.99;
      if (name && !seen.has(name)) {
        seen.set(name, true);
        PRODUCTS.push({ id: id++, name, category, price: Math.round(price * 100) / 100 });
      }
    }
    console.log(`✅ Loaded ${PRODUCTS.length} unique products from massive_sales_data.csv`);
  } catch (e) {
    console.warn('⚠️  Sales CSV not found. Using fallback product list. Error:', e.message);
    // Fallback products if CSV isn't available
    PRODUCTS = [
      { id: 1, name: 'Laptop', category: 'Electronics', price: 45000 },
      { id: 2, name: 'Wireless Mouse', category: 'Electronics', price: 1200 },
      { id: 3, name: 'DSLR Camera', category: 'Electronics', price: 55000 },
      { id: 4, name: 'SD Card', category: 'Accessories', price: 800 },
      { id: 5, name: 'Pasta', category: 'Groceries', price: 250 },
      { id: 6, name: 'Garlic Bread', category: 'Groceries', price: 100 },
      { id: 7, name: 'Diapers', category: 'Baby', price: 600 },
      { id: 8, name: 'Wet Wipes', category: 'Baby', price: 150 },
    ];
  }
}
loadProducts();

// ─── ML Coupon Engine (reads from pre-trained rules) ───────────────────────
function findBestCoupon(cartItems) {
  if (!cartItems || cartItems.length === 0) return null;
  const cartSet = new Set(cartItems.map(s => s.trim()));

  // Sort by highest lift (best association)
  const sorted = [...mlRules].sort((a, b) => b.lift - a.lift);

  for (const rule of sorted) {
    const antMatch = rule.antecedents.every(a => cartSet.has(a));
    if (!antMatch) continue;
    const rec = rule.consequents[0];
    if (!rec || cartSet.has(rec)) continue;

    // Find this product in our catalog
    const productInCatalog = PRODUCTS.find(p => p.name.toLowerCase() === rec.toLowerCase());
    const price = productInCatalog ? productInCatalog.price : 99;

    const discountPct = Math.min(50, Math.round(rule.lift * 8));
    const discountPrice = Math.round(price * (1 - discountPct / 100));
    return {
      recommendation: rec,
      triggerItems: rule.antecedents,
      discountText: `${discountPct}% OFF`,
      discountPrice,
      originalPrice: price,
      confidence: Math.round(rule.confidence * 100),
      lift: Math.round(rule.lift * 100) / 100,
      message: `🤖 AI Insight: ${Math.round(rule.confidence * 100)}% of customers who buy ${rule.antecedents.join(' + ')} also buy ${rec}!`
    };
  }
  return null;
}

// ═══════════════════════════════════════════════════════════════════
// API ROUTES
// ═══════════════════════════════════════════════════════════════════

// ── Products from real CSV data ────────────────────────────────────
app.get('/api/products', (req, res) => {
  res.json(PRODUCTS);
});

// ── Real ML coupon generator (triggered by inactivity on frontend) ─
app.post('/api/coupon', (req, res) => {
  const { cart } = req.body;
  if (!cart || cart.length === 0) return res.json({ coupon: null });
  const coupon = findBestCoupon(cart);
  console.log(`[ML COUPON] Cart: [${cart.join(', ')}] → Rec: ${coupon?.recommendation || 'None'}`);
  res.json({ coupon });
});

// ── IoT: Receive camera data from Raspberry Pi ─────────────────────
app.post('/api/cart/sync', async (req, res) => {
  const { device_id, cart } = req.body;
  console.log(`\n[IoT CLOUD] Received camera data from ${device_id}:`, cart);
  try {
    const pythonApiUrl = process.env.PYTHON_API_URL || 'http://127.0.0.1:8000';
    const mlResponse = await fetch(`${pythonApiUrl}/predict_bundle`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ items: cart })
    });
    if (!mlResponse.ok) throw new Error('ML Service unreachable');
    const mlData = await mlResponse.json();
    if (mlData.recommendation) {
      latestIoTOffer = {
        triggerItem: cart.join(', '),
        offerItem: PRODUCTS.find(p => p.name === mlData.recommendation) || { name: mlData.recommendation },
        discountText: mlData.discountText,
        discountPrice: mlData.discountPrice,
        message: mlData.message,
        aiType: `Cloud MBA (Lift: ${mlData.lift})`
      };
    } else { latestIoTOffer = null; }
    res.json({ success: true, ai_response: mlData });
  } catch (error) {
    // Fallback to local rules if Python ML is offline
    const coupon = findBestCoupon(cart);
    if (coupon) {
      latestIoTOffer = {
        triggerItem: cart.join(', '),
        offerItem: PRODUCTS.find(p => p.name === coupon.recommendation) || { name: coupon.recommendation },
        discountText: coupon.discountText,
        discountPrice: coupon.discountPrice,
        message: coupon.message,
        aiType: `Local MBA (Lift: ${coupon.lift})`
      };
    }
    res.json({ success: true, ai_response: coupon || { recommendation: null } });
  }
});

// ── Frontend polling: latest IoT offer ────────────────────────────
app.get('/api/iot/latest_offer', (req, res) => {
  if (latestIoTOffer) {
    const offer = latestIoTOffer;
    latestIoTOffer = null;
    res.json({ new_offer: true, offer });
  } else {
    res.json({ new_offer: false });
  }
});

// ── Dashboard KPI routes ───────────────────────────────────────────
app.get('/api/kpi', (req, res) => res.json({ liveRevenue: 15420, occupancyRate: 85, wasteRiskLevel: 'High' }));
app.get('/api/recommendations', (req, res) => res.json([
  { id: 1, trigger: 'Mutton Curry 40% below target', action: '15% discount bundle with Cold Coffee', impact: '+₹1,200', status: 'pending' },
  { id: 2, trigger: 'Tomatoes expiring <12h', action: 'Recommend Tomato Soup as Chef Special', impact: 'Save ₹400', status: 'pending' }
]));
app.get('/api/inventory', (req, res) => res.json([
  { id: 1, name: 'Tomatoes', category: 'Groceries', status: 'Red', expiry: '< 12 hours', stock: '10 kg' },
  { id: 2, name: 'Milk', category: 'Beverages', status: 'Orange', expiry: '1 Day', stock: '20 Liters' },
  { id: 3, name: 'Chicken', category: 'Main Course', status: 'Green', expiry: '3 Days', stock: '50 kg' },
]));
app.get('/api/sales', (req, res) => res.json([
  { time: '10:00', actual: 2000, predicted: 2200 },
  { time: '11:00', actual: 3500, predicted: 3000 },
  { time: '12:00', actual: 4000, predicted: 4500 },
  { time: '13:00', actual: 6000, predicted: 6500 },
  { time: '14:00', actual: 5500, predicted: 5000 },
  { time: '15:00', actual: 3000, predicted: 3500 },
]));

app.post('/api/recommendations/:id/approve', (req, res) => res.json({ message: 'Approved' }));
app.post('/api/recommendations/:id/dismiss', (req, res) => res.json({ message: 'Dismissed' }));

// ── Catch-all: serve React app ─────────────────────────────────────
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../dist/index.html'));
});

app.listen(PORT, () => {
  console.log(`\n🚀 Smart AI Manager Backend running on port ${PORT}`);
  console.log(`   Products loaded: ${PRODUCTS.length}`);
  console.log(`   ML Rules loaded: ${mlRules.length}`);
});
