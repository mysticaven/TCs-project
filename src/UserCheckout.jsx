import React, { useState, useEffect, useRef, useMemo } from 'react';

const CAT_ICONS = {
  'Electronics': '💻', 'Groceries': '🛒', 'Snacks & Beverages': '🍫',
  'Home & Kitchen': '🏠', 'Personal Care': '🧴', 'Clothing & Accessories': '👕',
  'Office Supplies': '📎', 'Tools & Hardware': '🔧', 'Toys & Games': '🎮',
  'Pets': '🐾', 'Food': '🍔', 'Baby': '🍼', 'Accessories': '🎒', 'default': '📦'
};
const getIcon = (cat) => CAT_ICONS[cat] || CAT_ICONS.default;

const Stars = ({ n = 4 }) => (
  <span style={{ color: '#f90', fontSize: 12 }}>{'★'.repeat(n)}{'☆'.repeat(5 - n)}</span>
);

// ─── AI Offer Toast ──────────────────────────────────────────────
function AiOfferToast({ offer, onAccept, onDecline, allProducts }) {
  const [secs, setSecs] = useState(30);
  useEffect(() => {
    const t = setInterval(() => setSecs(s => { if (s <= 1) { onDecline(); return 0; } return s - 1; }), 1000);
    return () => clearInterval(t);
  }, []);

  const recProduct = allProducts.find(p => p.name === offer.recommendation || p.name === offer.offerItem?.name);

  return (
    <div style={{
      position: 'fixed', bottom: 24, right: 24, zIndex: 9999, width: 360,
      background: '#fff', borderRadius: 12, boxShadow: '0 8px 40px rgba(0,0,0,0.25)',
      border: '2px solid #FFD814', overflow: 'hidden',
      animation: 'slideUp 0.3s ease-out'
    }}>
      <style>{`@keyframes slideUp{from{transform:translateY(80px);opacity:0}to{transform:translateY(0);opacity:1}}`}</style>
      <div style={{ background: '#232F3E', padding: '10px 14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <div style={{ color: '#FFD814', fontWeight: 800, fontSize: 14 }}>🤖 AI Smart Deal Unlocked!</div>
          <div style={{ color: '#aaa', fontSize: 11 }}>Market Basket Analysis • Based on your cart</div>
        </div>
        <div style={{ background: '#cc0c39', color: '#fff', borderRadius: '50%', width: 30, height: 30, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 12 }}>{secs}s</div>
      </div>
      <div style={{ padding: 14 }}>
        <p style={{ fontSize: 13, color: '#333', margin: '0 0 10px', lineHeight: 1.4 }}>
          {offer.message || `Customers with similar carts also bought this!`}
        </p>
        {recProduct && (
          <div style={{ background: '#FFF9E6', border: '1px dashed #FFD814', borderRadius: 8, padding: 10, display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
            <div>
              <div style={{ fontWeight: 700, fontSize: 14 }}>{recProduct.name}</div>
              <div style={{ fontSize: 11, color: '#666' }}>{recProduct.category}</div>
              <div style={{ marginTop: 4 }}>
                <span style={{ textDecoration: 'line-through', color: '#999', fontSize: 12, marginRight: 6 }}>₹{recProduct.price}</span>
                <span style={{ color: '#cc0c39', fontWeight: 800, fontSize: 17 }}>₹{offer.discountPrice || Math.round(recProduct.price * 0.75)}</span>
              </div>
            </div>
            <div style={{ background: '#cc0c39', color: '#fff', borderRadius: 6, padding: '6px 10px', fontWeight: 800, textAlign: 'center', fontSize: 13 }}>
              {offer.discountText || '25% OFF'}
            </div>
          </div>
        )}
        <div style={{ fontSize: 11, color: '#555', background: '#f5f5f5', padding: '5px 10px', borderRadius: 6, marginBottom: 12 }}>
          <strong style={{ color: '#007185' }}>AI Engine:</strong> Lift Score: {offer.lift || '4.2'} • Confidence: {offer.confidence || '77'}%
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={onDecline} style={{ flex: 1, padding: '9px 0', background: '#f0f0f0', border: '1px solid #ccc', borderRadius: 20, cursor: 'pointer', fontWeight: 600, fontSize: 13 }}>No Thanks</button>
          <button onClick={() => onAccept(recProduct || offer.offerItem, offer.discountPrice)} style={{ flex: 2, padding: '9px 0', background: '#FFD814', border: 'none', borderRadius: 20, cursor: 'pointer', fontWeight: 800, fontSize: 14 }}>🛒 Add to Cart</button>
        </div>
      </div>
    </div>
  );
}

// ─── Product Card ────────────────────────────────────────────────
function ProductCard({ item, onAdd, inCart }) {
  const [clicked, setClicked] = useState(false);
  const rating = useMemo(() => 3 + Math.floor(Math.random() * 2 + 1), [item.id]);
  const reviews = useMemo(() => 100 + Math.floor(Math.random() * 4900), [item.id]);
  const discPct = useMemo(() => 5 + Math.floor(Math.random() * 35), [item.id]);
  const mrp = Math.round(item.price * (1 + discPct / 100));

  const handleAdd = () => {
    setClicked(true);
    onAdd(item);
    setTimeout(() => setClicked(false), 1800);
  };

  return (
    <div style={{
      background: '#fff', borderRadius: 8, border: '1px solid #e0e0e0',
      overflow: 'hidden', display: 'flex', flexDirection: 'column',
      transition: 'box-shadow 0.2s', position: 'relative'
    }}
      onMouseEnter={e => e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.14)'}
      onMouseLeave={e => e.currentTarget.style.boxShadow = 'none'}
    >
      <div style={{ position: 'absolute', top: 8, left: 8, background: '#cc0c39', color: '#fff', fontSize: 10, fontWeight: 700, padding: '2px 6px', borderRadius: 3, zIndex: 1 }}>-{discPct}%</div>
      <div style={{ height: 140, background: '#f5f5f5', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 48 }}>
        {getIcon(item.category)}
      </div>
      <div style={{ padding: '10px 12px', flex: 1, display: 'flex', flexDirection: 'column' }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: '#111', lineHeight: 1.3, minHeight: 34, marginBottom: 2 }} title={item.name}>
          {item.name.length > 40 ? item.name.slice(0, 38) + '…' : item.name}
        </div>
        <div style={{ fontSize: 10, color: '#888', marginBottom: 4 }}>{item.category}</div>
        <Stars n={rating} />
        <span style={{ fontSize: 10, color: '#007185' }}> ({reviews.toLocaleString()})</span>
        <div style={{ marginTop: 8 }}>
          <div style={{ fontSize: 10, color: '#777' }}>M.R.P: <span style={{ textDecoration: 'line-through' }}>₹{mrp}</span></div>
          <div style={{ fontSize: 18, fontWeight: 800, color: '#0F1111' }}>₹{item.price}</div>
          <div style={{ fontSize: 10, color: '#cc0c39', fontWeight: 600 }}>Save ₹{mrp - item.price} ({discPct}%)</div>
        </div>
        <div style={{ fontSize: 11, color: '#007600', fontWeight: 600, margin: '4px 0 8px' }}>In Stock</div>
        <button onClick={handleAdd} style={{
          padding: '8px 0', borderRadius: 20, border: 'none', cursor: 'pointer',
          fontWeight: 700, fontSize: 13, marginTop: 'auto',
          background: clicked ? '#e6b800' : inCart ? '#f0c040' : '#FFD814',
          color: '#111', transition: 'background 0.2s'
        }}>
          {clicked ? '✓ Added!' : inCart ? 'Add More' : 'Add to Cart'}
        </button>
      </div>
    </div>
  );
}

// ─── Main Component ──────────────────────────────────────────────
export default function UserCheckout() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cart, setCart] = useState([]);
  const [offer, setOffer] = useState(null);
  const [showOffer, setShowOffer] = useState(false);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [isCameraOn, setIsCameraOn] = useState(false);
  const [orderDone, setOrderDone] = useState(false);
  const inactivityTimer = useRef(null);
  const lastCartRef = useRef([]);

  // ── Load products from backend (which reads CSV) ──────────────
  useEffect(() => {
    fetch('/api/products')
      .then(r => r.json())
      .then(data => { setProducts(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  // ── IoT Camera polling ────────────────────────────────────────
  useEffect(() => {
    if (!isCameraOn) return;
    const interval = setInterval(async () => {
      try {
        const r = await fetch('/api/iot/latest_offer');
        const d = await r.json();
        if (d.new_offer && d.offer && !showOffer) {
          setOffer({ ...d.offer, recommendation: d.offer.offerItem?.name });
          setShowOffer(true);
        }
      } catch (e) {}
    }, 3000);
    return () => clearInterval(interval);
  }, [isCameraOn, showOffer]);

  // ── 2-second inactivity coupon trigger ───────────────────────
  const triggerCoupon = async (cartItems) => {
    if (cartItems.length === 0 || showOffer) return;
    try {
      const r = await fetch('/api/coupon', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cart: cartItems.map(i => i.name) })
      });
      const d = await r.json();
      if (d.coupon) { setOffer(d.coupon); setShowOffer(true); }
    } catch (e) {}
  };

  const handleAdd = (item) => {
    setCart(prev => {
      const exists = prev.find(i => i.id === item.id);
      const next = exists
        ? prev.map(i => i.id === item.id ? { ...i, qty: i.qty + 1 } : i)
        : [...prev, { ...item, qty: 1 }];
      lastCartRef.current = next;

      // Reset 2-second inactivity timer on every add
      clearTimeout(inactivityTimer.current);
      inactivityTimer.current = setTimeout(() => {
        if (!showOffer) triggerCoupon(lastCartRef.current);
      }, 2000);

      return next;
    });
  };

  const acceptOffer = (recProduct, discountPrice) => {
    if (!recProduct) return setShowOffer(false);
    setCart(prev => {
      const exists = prev.find(i => i.id === recProduct.id);
      if (exists) return prev.map(i => i.id === recProduct.id ? { ...i, qty: i.qty + 1 } : i);
      return [...prev, { ...recProduct, price: discountPrice || recProduct.price, qty: 1, isOffer: true }];
    });
    setShowOffer(false);
  };

  const updateQty = (id, d) => setCart(prev => prev.map(i => i.id === id ? { ...i, qty: Math.max(1, i.qty + d) } : i));
  const removeItem = (id) => setCart(prev => prev.filter(i => i.id !== id));
  const subtotal = cart.reduce((s, i) => s + i.price * i.qty, 0);
  const itemCount = cart.reduce((s, i) => s + i.qty, 0);
  const aiSavings = cart.filter(i => i.isOffer).reduce((s, i) => s + Math.round(i.price * 0.3), 0);

  const categories = ['All', ...new Set(products.map(p => p.category))];
  const filtered = products.filter(p =>
    (category === 'All' || p.category === category) &&
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  if (orderDone) return (
    <div style={{ minHeight: '100vh', background: '#EAEDED', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Arial, sans-serif' }}>
      <div style={{ background: '#fff', borderRadius: 10, padding: 48, textAlign: 'center', maxWidth: 480, boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}>
        <div style={{ fontSize: 64 }}>✅</div>
        <h2 style={{ color: '#007600' }}>Order Placed!</h2>
        <p style={{ color: '#555' }}>Your {itemCount} item(s) will arrive <strong>Tomorrow by 10 PM</strong></p>
        <div style={{ background: '#FFF9E6', border: '1px solid #FFD814', borderRadius: 8, padding: 16, margin: '16px 0' }}>
          <div style={{ fontWeight: 700, fontSize: 20 }}>Total: ₹{subtotal.toFixed(2)}</div>
          {aiSavings > 0 && <div style={{ color: '#cc0c39', fontSize: 13, marginTop: 4 }}>You saved ₹{aiSavings} with AI deals! 🎉</div>}
        </div>
        <button onClick={() => { setOrderDone(false); setCart([]); }}
          style={{ background: '#FFD814', border: 'none', borderRadius: 20, padding: '12px 32px', fontWeight: 800, fontSize: 16, cursor: 'pointer' }}>
          Continue Shopping
        </button>
      </div>
    </div>
  );

  return (
    <div style={{ minHeight: '100vh', background: '#EAEDED', fontFamily: 'Arial, sans-serif' }}>
      {/* ── Navbar ── */}
      <div style={{ background: '#232F3E', padding: '10px 20px', display: 'flex', alignItems: 'center', gap: 12, position: 'sticky', top: 0, zIndex: 100 }}>
        <div style={{ color: '#FF9900', fontWeight: 900, fontSize: 20, minWidth: 110 }}>smart<span style={{ color: '#fff' }}>shop</span></div>
        <select value={category} onChange={e => setCategory(e.target.value)}
          style={{ padding: '9px 6px', background: '#f3f3f3', border: 'none', borderRadius: '4px 0 0 4px', fontSize: 12, maxWidth: 130 }}>
          {categories.map(c => <option key={c}>{c}</option>)}
        </select>
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search products..."
          style={{ flex: 1, padding: '9px 14px', border: 'none', fontSize: 14, outline: 'none', maxWidth: 600 }} />
        <button style={{ padding: '0 14px', height: 38, background: '#FF9900', border: 'none', borderRadius: '0 4px 4px 0', cursor: 'pointer', fontSize: 16 }}>🔍</button>
        <button onClick={() => setIsCameraOn(!isCameraOn)}
          style={{ padding: '7px 12px', background: isCameraOn ? '#007600' : '#555', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer', fontSize: 12, fontWeight: 700, whiteSpace: 'nowrap' }}>
          📷 {isCameraOn ? 'IoT: LIVE' : 'IoT: OFF'}
        </button>
        <div style={{ color: '#fff', position: 'relative', cursor: 'pointer', minWidth: 50, textAlign: 'center' }}>
          <div style={{ fontSize: 22 }}>🛒</div>
          {itemCount > 0 && <div style={{ position: 'absolute', top: -4, right: 2, background: '#FF9900', color: '#111', borderRadius: '50%', width: 18, height: 18, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 800 }}>{itemCount}</div>}
          <div style={{ fontSize: 10, color: '#ccc' }}>Cart</div>
        </div>
      </div>

      {/* ── Layout ── */}
      <div style={{ display: 'flex', gap: 16, maxWidth: 1400, margin: '0 auto', padding: '16px', alignItems: 'flex-start' }}>
        {/* Products */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ marginBottom: 10, fontSize: 13, color: '#555' }}>
            {loading ? '⏳ Loading products from training data...' : <><strong>{filtered.length}</strong> products found</>}
          </div>
          {loading ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(190px,1fr))', gap: 14 }}>
              {[...Array(12)].map((_, i) => (
                <div key={i} style={{ height: 300, background: '#fff', borderRadius: 8, animation: 'pulse 1.2s infinite' }}>
                  <style>{`@keyframes pulse{0%,100%{opacity:1}50%{opacity:0.5}}`}</style>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(190px,1fr))', gap: 14 }}>
              {filtered.map(item => (
                <ProductCard key={item.id} item={item} onAdd={handleAdd} inCart={cart.some(c => c.id === item.id)} />
              ))}
            </div>
          )}
        </div>

        {/* Cart Sidebar */}
        <div style={{ width: 300, flexShrink: 0, position: 'sticky', top: 76 }}>
          <div style={{ background: '#fff', borderRadius: 8, border: '1px solid #ddd', overflow: 'hidden', marginBottom: 12 }}>
            <div style={{ background: '#232F3E', padding: '11px 14px', color: '#FFD814', fontWeight: 800, fontSize: 15 }}>
              🛒 Cart ({itemCount})
            </div>
            {cart.length === 0 ? (
              <div style={{ padding: 32, textAlign: 'center', color: '#888' }}>
                <div style={{ fontSize: 40, marginBottom: 8 }}>🛒</div>
                <div>Your cart is empty</div>
                <div style={{ fontSize: 11, color: '#aaa', marginTop: 4 }}>Add items to get AI recommendations!</div>
              </div>
            ) : (
              <>
                <div style={{ maxHeight: 350, overflowY: 'auto', padding: 12 }}>
                  {cart.map(item => (
                    <div key={item.id} style={{ display: 'flex', gap: 8, marginBottom: 12, paddingBottom: 12, borderBottom: '1px solid #f0f0f0' }}>
                      <div style={{ width: 40, height: 40, background: '#f5f5f5', borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, flexShrink: 0 }}>{getIcon(item.category)}</div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 12, fontWeight: 600, lineHeight: 1.3 }}>{item.name}</div>
                        {item.isOffer && <span style={{ fontSize: 9, background: '#cc0c39', color: '#fff', padding: '1px 4px', borderRadius: 3, fontWeight: 700 }}>AI DEAL</span>}
                        <div style={{ fontSize: 13, fontWeight: 700, color: '#111' }}>₹{item.price}</div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 3 }}>
                          <button onClick={() => updateQty(item.id, -1)} style={{ width: 20, height: 20, border: '1px solid #ccc', background: '#f5f5f5', cursor: 'pointer', borderRadius: 3, fontWeight: 700, fontSize: 12 }}>−</button>
                          <span style={{ fontSize: 12, fontWeight: 700, minWidth: 16, textAlign: 'center' }}>{item.qty}</span>
                          <button onClick={() => updateQty(item.id, 1)} style={{ width: 20, height: 20, border: '1px solid #ccc', background: '#f5f5f5', cursor: 'pointer', borderRadius: 3, fontWeight: 700, fontSize: 12 }}>+</button>
                          <button onClick={() => removeItem(item.id)} style={{ background: 'none', border: 'none', color: '#cc0c39', cursor: 'pointer', fontSize: 11, fontWeight: 600, marginLeft: 4 }}>Delete</button>
                        </div>
                      </div>
                      <div style={{ fontSize: 12, fontWeight: 700, flexShrink: 0 }}>₹{item.price * item.qty}</div>
                    </div>
                  ))}
                </div>
                <div style={{ padding: '12px 14px', background: '#FAFAFA', borderTop: '1px solid #eee' }}>
                  {aiSavings > 0 && <div style={{ color: '#cc0c39', fontSize: 12, fontWeight: 600, marginBottom: 6 }}>💰 AI saved you ₹{aiSavings}!</div>}
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700, fontSize: 15, marginBottom: 10 }}>
                    <span>Subtotal ({itemCount}):</span><span>₹{subtotal.toFixed(2)}</span>
                  </div>
                  <div style={{ fontSize: 11, color: '#007600', marginBottom: 10 }}>✅ FREE Delivery on orders above ₹499</div>
                  <button onClick={() => setOrderDone(true)} style={{ width: '100%', padding: '11px 0', background: '#FFD814', border: 'none', borderRadius: 20, fontWeight: 800, fontSize: 15, cursor: 'pointer', marginBottom: 6 }}>
                    ⚡ Proceed to Checkout
                  </button>
                  <button style={{ width: '100%', padding: '9px 0', background: '#FFA41C', border: 'none', borderRadius: 20, fontWeight: 700, fontSize: 14, cursor: 'pointer' }}>
                    Buy Now
                  </button>
                </div>
              </>
            )}
          </div>

          {/* AI Status */}
          <div style={{ background: '#fff', borderRadius: 8, border: '1px solid #ddd', padding: 12, fontSize: 12 }}>
            <div style={{ fontWeight: 700, color: '#232F3E', marginBottom: 8 }}>🤖 AI Engine Status</div>
            {[
              ['ML Model', '● Active', '#007600'],
              ['Training Data', '1M+ rows', '#0066c0'],
              ['Products Loaded', `${products.length} items`, '#0066c0'],
              ['Coupon Trigger', '2s inactivity', '#777'],
              ['IoT Camera', isCameraOn ? '● LIVE' : '○ Offline', isCameraOn ? '#007600' : '#cc0c39'],
            ].map(([label, val, color]) => (
              <div key={label} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                <span style={{ color: '#555' }}>{label}</span>
                <span style={{ color, fontWeight: 600 }}>{val}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {showOffer && offer && (
        <AiOfferToast
          offer={offer}
          allProducts={products}
          onAccept={acceptOffer}
          onDecline={() => setShowOffer(false)}
        />
      )}
    </div>
  );
}
