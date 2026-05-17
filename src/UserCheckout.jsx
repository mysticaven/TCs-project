import React, { useState, useEffect, useMemo } from 'react';

// ─── Curated High-Fidelity Product Images Map (Item 1: Product Authenticity) ──
const CATEGORY_IMAGES = {
  'Fruits': 'https://images.unsplash.com/photo-1619546813926-a78fa6372cd2?auto=format&fit=crop&q=80&w=400',
  'Vegetables': 'https://images.unsplash.com/photo-1597362925123-77861d3fbac7?auto=format&fit=crop&q=80&w=400',
  'Dairy': 'https://images.unsplash.com/photo-1550583724-b2692b85b150?auto=format&fit=crop&q=80&w=400',
  'Meat': 'https://images.unsplash.com/photo-1607623814075-e51df1bdc82f?auto=format&fit=crop&q=80&w=400',
  'Frozen Food': 'https://images.unsplash.com/photo-1563245372-f21724e3856d?auto=format&fit=crop&q=80&w=400',
  'Drinks': 'https://images.unsplash.com/photo-1527960656366-ee2a999e32e6?auto=format&fit=crop&q=80&w=400',
  'Groceries': 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=400',
  'Snacks & Beverages': 'https://images.unsplash.com/photo-1534073828943-f801091bb18c?auto=format&fit=crop&q=80&w=400',
  'Home & Kitchen': 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&q=80&w=400',
  'Personal Care': 'https://images.unsplash.com/photo-1526947425960-945c6e72858f?auto=format&fit=crop&q=80&w=400',
  'Clothing & Accessories': 'https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?auto=format&fit=crop&q=80&w=400',
  'Office Supplies': 'https://images.unsplash.com/photo-1586075010633-2470394e2344?auto=format&fit=crop&q=80&w=400',
  'Tools & Hardware': 'https://images.unsplash.com/photo-1581147036324-c17ac41dfa6c?auto=format&fit=crop&q=80&w=400',
  'Toys & Games': 'https://images.unsplash.com/photo-1531525645387-7f14be1bdbbd?auto=format&fit=crop&q=80&w=400',
  'Pets': 'https://images.unsplash.com/photo-1516734212186-a967f81ad0d7?auto=format&fit=crop&q=80&w=400',
};

const SPECIFIC_IMAGES = [
  { keywords: ['apple', 'apples'], url: 'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?auto=format&fit=crop&q=80&w=400' },
  { keywords: ['banana', 'bananas'], url: 'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?auto=format&fit=crop&q=80&w=400' },
  { keywords: ['orange', 'oranges'], url: 'https://images.unsplash.com/photo-1547514701-42782101795e?auto=format&fit=crop&q=80&w=400' },
  { keywords: ['strawberry', 'strawberries'], url: 'https://images.unsplash.com/photo-1464965911861-746a04b4bca6?auto=format&fit=crop&q=80&w=400' },
  { keywords: ['milk', 'dairy'], url: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?auto=format&fit=crop&q=80&w=400' },
  { keywords: ['egg', 'eggs'], url: 'https://images.unsplash.com/photo-1506976785307-8732e854ad03?auto=format&fit=crop&q=80&w=400' },
  { keywords: ['bread', 'bakery'], url: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&q=80&w=400' },
  { keywords: ['cheese', 'cheddar'], url: 'https://images.unsplash.com/photo-1486299267070-83823f5448dd?auto=format&fit=crop&q=80&w=400' },
  { keywords: ['beef', 'meat', 'steak'], url: 'https://images.unsplash.com/photo-1603048588665-791ca8aea617?auto=format&fit=crop&q=80&w=400' },
  { keywords: ['chicken', 'breast', 'poultry'], url: 'https://images.unsplash.com/photo-1604503468506-a8da13d82791?auto=format&fit=crop&q=80&w=400' },
  { keywords: ['salmon', 'fish'], url: 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?auto=format&fit=crop&q=80&w=400' },
  { keywords: ['pizza'], url: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&q=80&w=400' },
  { keywords: ['ice cream', 'dessert'], url: 'https://images.unsplash.com/photo-1497034825429-c343d7c6a68f?auto=format&fit=crop&q=80&w=400' },
  { keywords: ['cola', 'soda', 'coke'], url: 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?auto=format&fit=crop&q=80&w=400' },
  { keywords: ['coffee'], url: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&q=80&w=400' },
  { keywords: ['tomato', 'tomatoes'], url: 'https://images.unsplash.com/photo-1595855759920-86582396756a?auto=format&fit=crop&q=80&w=400' },
  { keywords: ['potato', 'potatoes'], url: 'https://images.unsplash.com/photo-1518977676601-b53f82aba655?auto=format&fit=crop&q=80&w=400' },
  { keywords: ['onion', 'onions'], url: 'https://images.unsplash.com/photo-1580191947416-62d35a55e71d?auto=format&fit=crop&q=80&w=400' },
  { keywords: ['pen', 'pens', 'pencil'], url: 'https://images.unsplash.com/photo-1583485088034-697b5bc54ccd?auto=format&fit=crop&q=80&w=400' },
];

const GET_IMAGE = (name = '', category = 'Groceries') => {
  const lowercaseName = name.toLowerCase();
  for (const item of SPECIFIC_IMAGES) {
    if (item.keywords.some(k => lowercaseName.includes(k))) {
      return item.url;
    }
  }
  return CATEGORY_IMAGES[category] || 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=400';
};

// ─── Color Palette Configuration (Item 16) ───────────────────────────────────
const COLORS = {
  primary: '#6C4CF1',     // Sleek Purple
  accent: '#FF9F1C',      // Amber Gold
  success: '#2ECF73',     // Emerald Green
  danger: '#FF4D4F',      // Crimson Red
  background: '#F5F7FA',  // Premium grey-white background
  darkNavy: '#1E1E2E'
};

// ─── AI Deal Modal (Triggered on Checkout) ───────────────────────────────────
function AiDealModal({ coupon, products, onAccept, onDecline }) {
  const [secs, setSecs] = useState(15);
  useEffect(() => {
    const t = setInterval(() => setSecs(s => {
      if (s <= 1) { clearInterval(t); onDecline(); return 0; }
      return s - 1;
    }), 1000);
    return () => clearInterval(t);
  }, []);

  const prod = products.find(p => p.name === coupon.recommendation);

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      background: 'rgba(15,23,42,0.85)', backdropFilter: 'blur(12px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10000,
      animation: 'fadeIn 0.3s ease-out'
    }}>
      <div className="pop-modal" style={{
        width: 440, background: '#fff', borderRadius: 24, overflow: 'hidden',
        boxShadow: '0 25px 60px rgba(0,0,0,0.3)', animation: 'popIn 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
      }}>
        {/* Header */}
        <div style={{ 
          background: `linear-gradient(135deg, ${COLORS.primary}, #4A2BC2)`, 
          padding: '28px 24px', textAlign: 'center', color: '#fff' 
        }}>
          <div style={{ 
            display: 'inline-block', background: 'rgba(255,255,255,0.15)', 
            padding: '4px 14px', borderRadius: 100, color: COLORS.accent, 
            fontSize: 11, fontWeight: 900, marginBottom: 10, letterSpacing: '1px'
          }}>
            ⚡ AI REAL-TIME REWARD
          </div>
          <h2 style={{ margin: 0, fontSize: 25, fontWeight: 900, letterSpacing: '-0.5px' }}>Algorithmic Deal Found!</h2>
          <p style={{ margin: '6px 0 0', opacity: 0.85, fontSize: 13 }}>Optimized instantly based on shelf waste-risk.</p>
        </div>

        <div style={{ padding: 28 }}>
          {prod && (
            <div style={{ 
              background: '#f8fafc', borderRadius: 16, padding: 16, 
              border: '1px solid #e2e8f0', marginBottom: 20, display: 'flex', gap: 16, alignItems: 'center'
            }}>
              <div style={{ 
                width: 80, height: 80, background: '#fff', borderRadius: 12, 
                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 38,
                boxShadow: '0 6px 15px rgba(0,0,0,0.04)', border: '1px solid #e2e8f0'
              }}>
                {prod.image_emoji || '📦'}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 10, color: '#64748b', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 3 }}>{prod.category}</div>
                <div style={{ fontSize: 16, fontWeight: 900, color: '#0f172a', margin: '0 0 6px', lineHeight: 1.2 }}>{prod.name}</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ textDecoration: 'line-through', color: '#94a3b8', fontSize: 13 }}>₹{prod.price}</span>
                  <span style={{ color: COLORS.danger, fontWeight: 900, fontSize: 22 }}>₹{coupon.discount_price}</span>
                </div>
              </div>
            </div>
          )}

          <div style={{ background: '#f0fdf4', color: '#166534', padding: '16px', borderRadius: 16, fontSize: 13, fontWeight: 600, lineHeight: 1.4, marginBottom: 24, border: '1px solid #dcfce7' }}>
            💡 "{coupon.message}"
          </div>

          <div style={{ display: 'flex', gap: 14 }}>
            <button onClick={onDecline} style={{ flex: 1, padding: '15px 0', background: '#f1f5f9', border: 'none', borderRadius: 100, cursor: 'pointer', fontWeight: 800, color: '#475569', fontSize: 14 }}>
              Decline Offer
            </button>
            <button onClick={() => onAccept(prod, coupon.discount_price)} style={{ flex: 1.6, padding: '15px 0', background: COLORS.accent, border: 'none', borderRadius: 100, cursor: 'pointer', fontWeight: 900, fontSize: 15, color: '#111', boxShadow: '0 8px 20px rgba(255,159,28,0.3)', transition: 'transform 0.2s' }}>
              Add & Buy Now
            </button>
          </div>

          <div style={{ textAlign: 'center', marginTop: 20, fontSize: 12, color: '#94a3b8', fontWeight: 600 }}>
            Offer self-destructs in <span style={{ color: COLORS.danger, fontWeight: 800 }}>{secs} seconds</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Product Card Component (Ultra-Clean & Streamlined) ─────────────────
function ProductCard({ item, onAdd, inCart }) {
  const [adding, setAdding] = useState(false);
  
  const handleAdd = (e) => {
    e.stopPropagation();
    setAdding(true);
    onAdd(item);
    setTimeout(() => setAdding(false), 800);
  };

  const imgUrl = item.image_url || GET_IMAGE(item.name, item.category);

  return (
    <div
      className="card-lift"
      style={{
        background: '#fff', borderRadius: 20, border: '1px solid #eaeaea',
        overflow: 'hidden', display: 'flex', flexDirection: 'column',
        boxShadow: '0 4px 12px rgba(0,0,0,0.03)', transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        position: 'relative'
      }}
    >
      {/* Discount Badge */}
      {item.discount > 0 && (
        <div style={{ position: 'absolute', top: 12, left: 12, zIndex: 10 }}>
          <div style={{ background: COLORS.danger, color: '#fff', fontSize: 10, fontWeight: 900, padding: '4px 10px', borderRadius: 100, boxShadow: '0 4px 10px rgba(255,77,79,0.3)' }}>
            {Math.round(item.discount)}% OFF
          </div>
        </div>
      )}

      {/* Image Container */}
      <div style={{ height: 170, position: 'relative', overflow: 'hidden', background: '#f1f5f9' }}>
        <img src={imgUrl} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover', transform: 'scale(1.02)' }} />
        <div style={{ 
          position: 'absolute', inset: 0, 
          background: 'linear-gradient(to bottom, rgba(255,255,255,0.05), rgba(255,255,255,0.85))',
          backdropFilter: 'blur(1px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 58
        }}>
          {item.image_emoji || '📦'}
        </div>
      </div>

      {/* Card Content */}
      <div style={{ padding: '16px 18px', flex: 1, display: 'flex', flexDirection: 'column' }}>
        <div style={{ fontSize: 10, color: '#94a3b8', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: 4 }}>{item.category}</div>
        <h3 style={{ fontSize: 16, fontWeight: 900, color: '#1e293b', margin: '0 0 12px', lineHeight: 1.3, minHeight: 40 }}>
          {item.name}
        </h3>

        {/* Bottom Section */}
        <div style={{ marginTop: 'auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'baseline' }}>
              <span style={{ fontSize: 14, fontWeight: 800, color: '#0f172a' }}>₹</span>
              <span style={{ fontSize: 26, fontWeight: 900, color: '#0f172a', letterSpacing: '-0.5px' }}>{Math.floor(item.price)}</span>
              <span style={{ fontSize: 14, fontWeight: 800, color: '#0f172a' }}>.{(item.price % 1).toFixed(2).substring(2)}</span>
            </div>
            {item.discount > 0 && (
              <div style={{ fontSize: 11, color: '#94a3b8', textDecoration: 'line-through', marginTop: -2 }}>
                ₹{(item.price * (1 + item.discount/100)).toFixed(0)}
              </div>
            )}
          </div>

          <button 
            onClick={handleAdd} 
            disabled={adding}
            style={{
              padding: '12px 20px', borderRadius: 100, border: 'none', cursor: 'pointer',
              background: adding ? COLORS.success : inCart ? COLORS.accent : COLORS.primary,
              color: '#fff', fontWeight: 900, fontSize: 13, 
              boxShadow: '0 8px 16px rgba(108,76,241,0.15)',
              transition: 'all 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
              display: 'flex', alignItems: 'center', gap: 6
            }}
          >
            {adding ? '✓ Added' : inCart ? 'Add More' : 'Add to Cart'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── AI Insight Drawer Overlay (Removed / Disabled) ───────────────────────────
function AiInsightDrawer() {
  return null;
}

// Divider Helper
const Divider = () => <div style={{ height: '1px', background: '#eaeaea', margin: '4px 0' }} />;

// ─── Main Checkout Kiosk Component (Fully Overhauled) ───────────────────────
export default function UserCheckout() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cart, setCart] = useState([]);
  const [coupon, setCoupon] = useState(null);
  
  // Search & Filter state variables (Item 8 & 9)
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [priceRange, setPriceRange] = useState(40.0);
  const [minHealth, setMinHealth] = useState(30.0);
  const [filterOrganic, setFilterOrganic] = useState(false);
  const [filterDiscountOnly, setFilterDiscountOnly] = useState(false);
  const [filterRecommended, setFilterRecommended] = useState(false);

  // Drawer Insight item
  const [insightItem, setInsightItem] = useState(null);
  const [orderDone, setOrderDone] = useState(false);
  const [checkingDeals, setCheckingDeals] = useState(false);

  // Simulated IoT live state
  const [sensorData, setSensorData] = useState({ temperature: 8.4, humidity: 74.0, gas_ppm: 510.0, ph: 5.1 });

  // ── Fetch products & live telemetry ────────────────────────────
  useEffect(() => {
    fetch('http://localhost:8000/api/products?limit=120')
      .then(r => r.json())
      .then(data => {
        const valid = (Array.isArray(data.products) ? data.products : []).filter(p => p.name && isNaN(p.name));
        setProducts(valid);
        setLoading(false);
      })
      .catch(() => setLoading(false));

    fetch('http://localhost:8000/api/sensor-data')
      .then(r => r.json())
      .then(d => setSensorData(d))
      .catch(() => {});
  }, []);

  const handleAdd = (item) => {
    setCart(prev => {
      const exists = prev.find(i => i.id === item.id);
      if (exists) return prev.map(i => i.id === item.id ? { ...i, qty: i.qty + 1 } : i);
      return [...prev, { ...item, qty: 1 }];
    });
  };

  const [purchaseSuggestion, setPurchaseSuggestion] = useState(null);

  const startCheckout = async () => {
    if (cart.length === 0) return;
    setCheckingDeals(true);
    
    let fetchedSuggestion = null;
    try {
      const res = await fetch('http://localhost:8000/api/coupon', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cart: cart.map(i => i.name) })
      });
      const data = await res.json();
      if (data.coupon) {
        fetchedSuggestion = data.coupon;
      }
    } catch (e) {}

    await fetch('http://localhost:8000/api/checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        cart: cart,
        coupon_shown: fetchedSuggestion?.recommendation || null,
        coupon_accepted: false
      })
    }).catch(() => {});

    setPurchaseSuggestion(fetchedSuggestion);
    setCheckingDeals(false);
    setOrderDone(true);
  };

  const updateQty = (id, d) => setCart(prev =>
    prev.map(i => i.id === id ? { ...i, qty: Math.max(1, i.qty + d) } : i)
  );
  
  const removeItem = (id) => setCart(prev => prev.filter(i => i.id !== id));

  const subtotal = cart.reduce((s, i) => s + i.price * i.qty, 0);
  const itemCount = cart.reduce((s, i) => s + i.qty, 0);
  const totalMRP = cart.reduce((s, i) => s + (i.price * (1 + (i.discount || 0)/100)) * i.qty, 0);
  const aiSavings = totalMRP - subtotal;

  // Mined Search Semantic typo helper (Item 8)
  const isSemanticMatch = (p, term) => {
    const name = p.name.toLowerCase();
    const query = term.toLowerCase();
    if (name.includes(query)) return true;
    
    // Typo alignment
    if (query === 'healthy snacks' && ['almond', 'yogurt', 'apple', 'berries'].some(k => name.includes(k))) return true;
    if (query === 'diet' && ['lite', 'sugar-free', 'fresh', 'water'].some(k => name.includes(k))) return true;
    if (query === 'protein' && ['steak', 'beef', 'chicken', 'salmon', 'milk'].some(k => name.includes(k))) return true;
    
    return false;
  };

  // Filter Pipeline (Item 9)
  const filtered = useMemo(() => {
    return products.filter(p => {
      // Category filter
      if (selectedCategory !== 'All' && p.category !== selectedCategory) return false;
      // Semantic Search filter
      if (search && !isSemanticMatch(p, search)) return false;
      // Price slider
      if (p.price > priceRange) return false;
      // Health slider
      if (p.health_score < minHealth) return false;
      // Boolean toggles
      if (filterOrganic && !p.name.toLowerCase().includes('organic')) return false;
      if (filterDiscountOnly && p.discount === 0) return false;
      if (filterRecommended && p.health_score >= 75) return false;
      
      return true;
    });
  }, [products, search, selectedCategory, priceRange, minHealth, filterOrganic, filterDiscountOnly, filterRecommended]);



  // Horizontal Recommended Shelf (Item 11)
  const recommendedForYou = useMemo(() => {
    return products.filter(p => p.health_score > 85 && !cart.some(c => c.id === p.id)).slice(0, 4);
  }, [products, cart]);

  const categories = ['All', ...new Set(products.map(p => p.category))];

  if (orderDone) return (
    <div style={{ minHeight: '100vh', background: COLORS.background, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20, fontFamily: "'Outfit', 'Inter', sans-serif" }}>
      <div style={{ background: '#fff', borderRadius: 32, padding: 48, textAlign: 'center', maxWidth: 500, boxShadow: '0 30px 60px rgba(0,0,0,0.06)', border: '1px solid #eaeaea' }}>
        <div style={{ fontSize: 72, marginBottom: 16 }}>🎉</div>
        <h1 style={{ color: '#0f172a', margin: '0 0 8px', fontSize: 30, fontWeight: 900, letterSpacing: '-0.5px' }}>Payment Transacted!</h1>
        <p style={{ color: '#64748b', fontSize: 15 }}>Your catalog inventory quantities have been updated in real-time.</p>
        
        <div style={{ background: '#f8fafc', borderRadius: 20, padding: 24, margin: '24px 0', border: '1px dashed #cbd5e1' }}>
          <div style={{ color: '#64748b', fontSize: 13, fontWeight: 700, textTransform: 'uppercase', marginBottom: 4 }}>Amount Paid</div>
          <div style={{ fontWeight: 900, fontSize: 38, color: '#0f172a' }}>₹{subtotal.toFixed(2)}</div>
        </div>

        {/* Suggestion AFTER buying */}
        {purchaseSuggestion && (
          <div style={{ background: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)', borderRadius: 20, padding: 24, border: '1px solid #bbf7d0', marginBottom: 28, textAlign: 'left' }}>
            <div style={{ color: '#16a34a', fontSize: 12, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
              ✨ Recommended For Next Visit
            </div>
            <div style={{ fontWeight: 900, fontSize: 16, color: '#166534', marginBottom: 6 }}>
              {purchaseSuggestion.recommendation}
            </div>
            <div style={{ fontSize: 13, color: '#14532d', opacity: 0.85 }}>
              Our dynamic association algorithms suggest this item next time based on the products in your current basket!
            </div>
          </div>
        )}

        <button onClick={() => { setOrderDone(false); setCart([]); setPurchaseSuggestion(null); }} style={{ width: '100%', background: COLORS.primary, color: '#fff', border: 'none', borderRadius: 100, padding: '16px', fontWeight: 800, fontSize: 16, cursor: 'pointer', transition: 'all 0.2s', boxShadow: '0 8px 24px rgba(108,76,241,0.25)' }}>
          Launch Next Basket Session
        </button>
      </div>
    </div>
  );

  return (
    <div style={{ minHeight: '100vh', background: COLORS.background, fontFamily: "'Outfit', 'Inter', sans-serif", padding: '0px 0 60px' }}>
      
      {/* ── Dynamic Kiosk Header Styles ── */}
      <style>{`
        .card-lift:hover {
          transform: translateY(-6px) !important;
          box-shadow: 0 15px 30px rgba(108,76,241,0.12) !important;
          border-color: ${COLORS.primary} !important;
        }
        .pop-modal { animation: popIn 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.1) }
        @keyframes popIn { from { transform: scale(0.95); opacity: 0; } to { transform: scale(1); opacity: 1; } }
        @keyframes fadeIn { from { opacity: 0 } to { opacity: 1 } }
      `}</style>

      {/* ── Typo search and suggestion panel ── */}
      <div style={{ background: '#fff', borderBottom: '1px solid #e2e8f0', position: 'sticky', top: 0, zIndex: 99, padding: '12px 24px' }}>
        <div style={{ display: 'flex', gap: 16, maxWidth: 1400, margin: '0 auto', alignItems: 'center' }}>
          
          <div style={{ flex: 1, display: 'flex', background: '#f1f5f9', borderRadius: 100, overflow: 'hidden', border: '1px solid #e2e8f0', padding: '2px 8px' }}>
            <select value={selectedCategory} onChange={e => setSelectedCategory(e.target.value)}
              style={{ padding: '0 16px', background: 'none', border: 'none', borderRight: '1px solid #cbd5e1', fontSize: 13, fontWeight: 700, cursor: 'pointer', outline: 'none', color: '#475569' }}>
              {categories.map(c => <option key={c}>{c}</option>)}
            </select>
            <input 
              value={search} 
              onChange={e => setSearch(e.target.value)}
              placeholder="Search or ask AI (e.g. 'protein', 'healthy snacks', 'diet')..."
              style={{ flex: 1, padding: '12px 16px', border: 'none', background: 'none', fontSize: 14, outline: 'none', color: '#1e293b', fontWeight: 600 }} 
            />
            {search && <button onClick={() => setSearch('')} style={{ background: 'none', border: 'none', color: '#64748b', fontSize: 16, cursor: 'pointer', paddingRight: 10 }}>×</button>}
          </div>

          {/* Quick recommendations suggestion links */}
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <span style={{ fontSize: 12, color: '#64748b', alignSelf: 'center', fontWeight: 800 }}>Try:</span>
            {['healthy snacks', 'diet', 'protein'].map(term => (
              <ChipButton key={term} active={search === term} onClick={() => setSearch(term)} label={term} />
            ))}
          </div>
        </div>
      </div>

      {/* ── Main Layout Body ── */}
      <div style={{ display: 'flex', gap: 24, maxWidth: 1400, margin: '24px auto', padding: '0 24px', alignItems: 'flex-start' }}>
        
        {/* Left Filter Sidebar (Item 9) */}
        <div style={{ width: 260, background: '#fff', borderRadius: 24, padding: 24, border: '1px solid #eaeaea', flexShrink: 0, position: 'sticky', top: 90 }}>
          <h4 style={{ margin: '0 0 16px', fontSize: 16, fontWeight: 900, color: '#1e293b', display: 'flex', justifyItems: 'center', gap: 8 }}>
            🔍 Dynamic Filters
          </h4>
          
          <Divider />

          {/* Price Range Slider */}
          <div style={{ margin: '16px 0' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, fontWeight: 800, color: '#475569', marginBottom: 6 }}>
              <span>Max Price:</span>
              <span style={{ color: COLORS.primary }}>₹{priceRange}</span>
            </div>
            <input 
              type="range" 
              min={1.0} 
              max={50.0} 
              step={0.5} 
              value={priceRange} 
              onChange={e => setPriceRange(parseFloat(e.target.value))} 
              style={{ width: '100%', accentColor: COLORS.primary }}
            />
          </div>

          {/* Health Score Slider */}
          <div style={{ margin: '16px 0' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, fontWeight: 800, color: '#475569', marginBottom: 6 }}>
              <span>Min Health:</span>
              <span style={{ color: COLORS.success }}>{minHealth}/100</span>
            </div>
            <input 
              type="range" 
              min={10} 
              max={95} 
              value={minHealth} 
              onChange={e => setMinHealth(parseInt(e.target.value))} 
              style={{ width: '100%', accentColor: COLORS.success }}
            />
          </div>

          <Divider />

          {/* Checkboxes/Toggles */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, margin: '16px 0' }}>
            <ToggleOption active={filterRecommended} onClick={() => setFilterRecommended(!filterRecommended)} label="AI Recommended Only" />
            <ToggleOption active={filterDiscountOnly} onClick={() => setFilterDiscountOnly(!filterDiscountOnly)} label="Active Discount Shelf" />
            <ToggleOption active={filterOrganic} onClick={() => setFilterOrganic(!filterOrganic)} label="Organic Catalog only" />
          </div>

          <button 
            onClick={() => {
              setPriceRange(40.0);
              setMinHealth(30.0);
              setFilterOrganic(false);
              setFilterDiscountOnly(false);
              setFilterRecommended(false);
              setSearch('');
            }}
            style={{ width: '100%', padding: '12px 0', background: '#f1f5f9', border: 'none', borderRadius: 12, color: '#64748b', fontWeight: 800, fontSize: 12, cursor: 'pointer', marginTop: 10 }}
          >
            Clear Filters
          </button>
        </div>

        {/* Center Grid */}
        <div style={{ flex: 1 }}>
          
          {/* Horizontal Recommended Shelf (Item 11) */}
          {recommendedForYou.length > 0 && (
            <div style={{ marginBottom: 32 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
                <span style={{ fontSize: 22 }}>🔥</span>
                <h3 style={{ margin: 0, fontSize: 20, fontWeight: 900, color: '#1e293b' }}>Recommended For You</h3>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(230px, 1fr))', gap: 16 }}>
                {recommendedForYou.map(item => (
                  <ProductCard key={`rec-${item.id}`} item={item} onAdd={handleAdd} inCart={cart.some(c => c.id === item.id)} onViewInsight={setInsightItem} />
                ))}
              </div>
            </div>
          )}

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <h3 style={{ margin: 0, fontSize: 20, fontWeight: 900, color: '#1e293b' }}>
              {selectedCategory === 'All' ? 'Catalog Inventory Collection' : selectedCategory}
            </h3>
            <div style={{ fontSize: 13, color: '#64748b', fontWeight: 700 }}>{filtered.length} products found</div>
          </div>

          {loading ? (
            <div style={{ textAlign: 'center', padding: '100px 0' }}>
              <div className="spinner" style={{ margin: '0 auto', width: 30, height: 30 }}></div>
              <p style={{ color: '#64748b', marginTop: 12, fontWeight: 600 }}>Syncing product items...</p>
            </div>
          ) : filtered.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '80px 20px', background: '#fff', borderRadius: 24, border: '1px solid #eaeaea' }}>
              <div style={{ fontSize: 48, marginBottom: 12 }}>🔍</div>
              <h4 style={{ margin: 0, fontSize: 16, fontWeight: 900, color: '#1e293b' }}>No matching products</h4>
              <p style={{ color: '#64748b', fontSize: 13, marginTop: 6 }}>Try clearing your filters or widening search parameters.</p>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 20 }}>
              {filtered.map(item => (
                <ProductCard key={item.id} item={item} onAdd={handleAdd} inCart={cart.some(c => c.id === item.id)} onViewInsight={setInsightItem} />
              ))}
            </div>
          )}
        </div>

        {/* Right Smart Cart Sidebar (Item 4) */}
        <div style={{ width: 350, flexShrink: 0, position: 'sticky', top: 90 }}>
          <div style={{ background: '#fff', borderRadius: 24, border: '1px solid #eaeaea', boxShadow: '0 4px 20px rgba(0,0,0,0.03)', overflow: 'hidden' }}>
            
            {/* Header */}
            <div style={{ background: COLORS.primary, padding: '18px 24px', color: '#fff', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontWeight: 900, fontSize: 16 }}>Shopping Cart</span>
              <span style={{ background: 'rgba(255,255,255,0.2)', padding: '3px 10px', borderRadius: 100, fontSize: 11, fontWeight: 800 }}>{itemCount} units</span>
            </div>

            {cart.length === 0 ? (
              <div style={{ padding: 48, textAlign: 'center', color: '#bbb' }}>
                <div style={{ fontSize: 56, marginBottom: 16, opacity: 0.35 }}>🛒</div>
                <div style={{ fontWeight: 800, fontSize: 16, color: '#64748b' }}>Basket Empty</div>
                <p style={{ fontSize: 12, marginTop: 6, color: '#94a3b8' }}>Products you add will trigger real-time AI clearance deals.</p>
              </div>
            ) : (
              <div style={{ padding: 20 }}>
                
                {/* Cart list scroll */}
                <div style={{ maxHeight: 280, overflowY: 'auto', marginBottom: 16, paddingRight: 4 }}>
                  {cart.map(item => (
                    <div key={item.id} style={{ display: 'flex', gap: 12, marginBottom: 14, paddingBottom: 14, borderBottom: '1px solid #f1f5f9' }}>
                      <div style={{ width: 44, height: 44, background: '#f8fafc', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, border: '1px solid #e2e8f0', flexShrink: 0 }}>
                        {item.image_emoji || '📦'}
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 13, fontWeight: 800, color: '#1e293b', lineHeight: 1.2, marginBottom: 2 }}>{item.name}</div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                          <span style={{ fontSize: 15, fontWeight: 900, color: '#0f172a' }}>₹{item.price}</span>
                          <span style={{ fontSize: 11, color: '#64748b' }}>({item.qty} items)</span>
                        </div>
                        
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <div style={{ display: 'flex', alignItems: 'center', background: '#F1F5F9', borderRadius: 8, padding: 2 }}>
                            <button onClick={() => updateQty(item.id, -1)} style={{ width: 24, height: 24, border: 'none', background: 'none', cursor: 'pointer', fontSize: 16, color: '#475569', fontWeight: 'bold' }}>−</button>
                            <span style={{ width: 24, textAlign: 'center', fontSize: 12, fontWeight: 800, color: '#1e293b' }}>{item.qty}</span>
                            <button onClick={() => updateQty(item.id, 1)} style={{ width: 24, height: 24, border: 'none', background: 'none', cursor: 'pointer', fontSize: 16, color: '#475569', fontWeight: 'bold' }}>+</button>
                          </div>
                          <button onClick={() => removeItem(item.id)} style={{ background: 'none', border: 'none', color: COLORS.danger, fontSize: 11, cursor: 'pointer', fontWeight: 800 }}>Delete</button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Financial balances */}
                <div style={{ borderTop: '2px solid #f1f5f9', paddingTop: 16 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, fontSize: 13, color: '#64748b', fontWeight: 700 }}>
                    <span>Estimated total:</span>
                    <span>₹{totalMRP.toFixed(0)}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, fontSize: 13, color: COLORS.danger, fontWeight: 700 }}>
                    <span>AI Discounts:</span>
                    <span>-₹{aiSavings.toFixed(0)}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20 }}>
                    <span style={{ color: '#0f172a', fontWeight: 900, fontSize: 16 }}>Net Total:</span>
                    <span style={{ color: COLORS.primary, fontWeight: 900, fontSize: 22, letterSpacing: '-0.5px' }}>₹{subtotal.toFixed(2)}</span>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    <button 
                      onClick={startCheckout}
                      disabled={checkingDeals}
                      style={{ 
                        width: '100%', padding: '14px', background: COLORS.primary, border: 'none', 
                        borderRadius: 100, fontWeight: 900, fontSize: 14, cursor: 'pointer', color: '#fff',
                        boxShadow: '0 8px 24px rgba(108,76,241,0.2)', transition: 'all 0.2s',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8
                      }}
                    >
                      {checkingDeals ? (
                        <>Evaluating AI Clearance... <div className="spinner" style={{ width: 14, height: 14, borderLeftColor: '#fff' }}></div></>
                      ) : (
                        'Proceed to Checkout'
                      )}
                    </button>
                  </div>
                </div>

              </div>
            )}
          </div>
        </div>
      </div>

      {/* AI Deal Modal popup */}
      {coupon && (
        <AiDealModal
          coupon={coupon}
          products={products}
          onAccept={acceptCoupon}
          onDecline={() => { setCoupon(null); finishCheckout(); }}
        />
      )}

      {/* Dynamic Slide Drawer (Item 17) */}
      {insightItem && (
        <AiInsightDrawer 
          item={insightItem} 
          onClose={() => setInsightItem(null)} 
          sensorData={sensorData}
        />
      )}

    </div>
  );
}

// ─── Simple Helper Components ────────────────────────────────────────────────
function ChipButton({ label, active, onClick }) {
  return (
    <button 
      onClick={onClick}
      style={{
        padding: '5px 12px', borderRadius: 100, cursor: 'pointer',
        border: active ? `1px solid ${COLORS.primary}` : '1px solid #e2e8f0',
        background: active ? COLORS.primary : 'rgba(255,255,255,0.8)',
        color: active ? '#fff' : '#64748b', fontSize: 11, fontWeight: 800,
        boxShadow: '0 2px 5px rgba(0,0,0,0.02)'
      }}
    >
      {label}
    </button>
  );
}

function ToggleOption({ label, active, onClick }) {
  return (
    <div 
      onClick={onClick}
      style={{ 
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', 
        padding: '10px 12px', background: active ? 'rgba(108,76,241,0.05)' : '#f8fafc',
        borderRadius: 10, border: `1px solid ${active ? COLORS.primary : '#e2e8f0'}`,
        cursor: 'pointer', fontSize: 12, fontWeight: 800, color: active ? COLORS.primary : '#475569'
      }}
    >
      <span>{label}</span>
      <div style={{
        width: 16, height: 16, borderRadius: 4, 
        background: active ? COLORS.primary : '#e2e8f0',
        display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 10
      }}>
        {active ? '✓' : ''}
      </div>
    </div>
  );
}
