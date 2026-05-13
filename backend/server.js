const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const fs = require('fs');

dotenv.config();
const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../dist')));

// ═══════════════════════════════════════════════════════════════════
// LOAD PRODUCTS (from pre-extracted JSON - no Python needed)
// ═══════════════════════════════════════════════════════════════════
let PRODUCTS = [];
try {
  PRODUCTS = JSON.parse(fs.readFileSync(path.join(__dirname, 'data/products.json'), 'utf-8'));
  console.log(`✅ Loaded ${PRODUCTS.length} products from products.json`);
} catch (e) {
  console.warn('⚠️  products.json not found, using empty list');
}

// ═══════════════════════════════════════════════════════════════════
// LOAD ML RULES (from trained CSV - no Python process needed)
// Pure Node.js reads the CSV rules trained by train_on_massive.py
// ═══════════════════════════════════════════════════════════════════
let ML_RULES = [];
const RULES_PATH = path.join(__dirname, '../ml_models/massive_trained_rules.csv');

function loadMlRules() {
  try {
    const raw = fs.readFileSync(RULES_PATH, 'utf-8');
    const lines = raw.trim().split('\n').slice(1); // skip header row

    ML_RULES = lines.map(line => {
      // Handle quoted fields like "Garlic Bread, Wireless Mouse"
      const antRaw = line.match(/^"([^"]+)"|^([^,]+)/)?.[0] || '';
      const antecedents = antRaw.replace(/"/g, '').split(',').map(s => s.trim()).filter(Boolean);
      const rest = line.slice(antRaw.length + 1);
      const conRaw = rest.match(/^"([^"]+)"|^([^,]+)/)?.[0] || '';
      const consequents = conRaw.replace(/"/g, '').split(',').map(s => s.trim()).filter(Boolean);
      const numCols = rest.slice(conRaw.length + 1).split(',');

      return {
        antecedents,
        consequents,
        confidence: parseFloat(numCols[2]) || 0,
        lift: parseFloat(numCols[4]) || 0
      };
    }).filter(r => r.lift > 1 && r.antecedents.length > 0 && r.consequents.length > 0);

    console.log(`✅ Loaded ${ML_RULES.length} ML association rules (no Python needed)`);
  } catch (e) {
    console.warn('⚠️  ML Rules CSV not found. Run: python ml_models/train_on_massive.py');
    console.warn('    Error:', e.message);
  }
}
loadMlRules();

// ═══════════════════════════════════════════════════════════════════
// COUPON ENGINE - Pure JavaScript, no external process required
// Reads pre-trained association rules and finds best match for cart
// ═══════════════════════════════════════════════════════════════════
function findBestCoupon(cartItemNames) {
  if (!cartItemNames || cartItemNames.length === 0) return null;
  const cartSet = new Set(cartItemNames.map(s => s.trim()));

  // Sort all rules by lift (highest confidence associations first)
  const sorted = [...ML_RULES].sort((a, b) => b.lift - a.lift);

  for (const rule of sorted) {
    // Check if every antecedent item is in the cart
    const matches = rule.antecedents.every(a => cartSet.has(a));
    if (!matches) continue;

    // The recommended item
    const rec = rule.consequents[0];
    if (!rec || cartSet.has(rec)) continue; // already in cart

    // Find this product in our catalog
    const product = PRODUCTS.find(p => p.name.toLowerCase() === rec.toLowerCase());
    const originalPrice = product ? product.price : 49.99;

    // Discount scales with lift score (higher lift = bigger discount incentive)
    const discountPct = Math.min(50, Math.round(rule.lift * 8));
    const discountPrice = Math.round(originalPrice * (1 - discountPct / 100) * 100) / 100;

    return {
      recommendation: rec,
      triggerItems: rule.antecedents,
      discountText: `${discountPct}% OFF`,
      discountPrice,
      originalPrice,
      confidence: Math.round(rule.confidence * 100),
      lift: Math.round(rule.lift * 100) / 100,
      message: `🤖 AI says: ${Math.round(rule.confidence * 100)}% of shoppers who buy "${rule.antecedents.join('" + "')}" also buy "${rec}"!`
    };
  }
  return null;
}

// ═══════════════════════════════════════════════════════════════════
// API ROUTES
// ═══════════════════════════════════════════════════════════════════

// ── All products for the checkout page ────────────────────────────
app.get('/api/products', (req, res) => {
  res.json(PRODUCTS);
});

// ── ML Coupon endpoint (called after 2s inactivity in frontend) ──
// No Python, no Raspberry Pi - pure JS + CSV rules
app.post('/api/coupon', (req, res) => {
  const { cart } = req.body;
  if (!cart || cart.length === 0) return res.json({ coupon: null });
  const coupon = findBestCoupon(cart);
  if (coupon) {
    console.log(`[ML] Cart [${cart.join(', ')}] → Recommend: ${coupon.recommendation} (Lift: ${coupon.lift})`);
  }
  res.json({ coupon });
});

// ── Dashboard API Routes ────────────────────────────────────────
app.get('/api/kpi', (req, res) => res.json({
  liveRevenue: 15420, occupancyRate: 85, wasteRiskLevel: 'High'
}));

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

// ── Serve React frontend (catch-all) ───────────────────────────
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../dist/index.html'));
});

app.listen(PORT, () => {
  console.log(`\n🚀 Smart AI Manager running on port ${PORT}`);
  console.log(`   📦 Products: ${PRODUCTS.length}`);
  console.log(`   🤖 ML Rules: ${ML_RULES.length} (loaded from CSV, no Python needed)`);
  console.log(`   🌐 Open: http://localhost:${PORT}`);
});
