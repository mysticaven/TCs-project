import React, { useState, useEffect, useRef, useMemo } from 'react';

// ─── Category Icons ──────────────────────────────────────────────────────────
const ICONS = {
  'Electronics': '💻', 'Groceries': '🛒', 'Snacks & Beverages': '🍫',
  'Home & Kitchen': '🏠', 'Personal Care': '🧴', 'Clothing & Accessories': '👕',
  'Office Supplies': '📎', 'Tools & Hardware': '🔧', 'Toys & Games': '🎮',
  'Pets': '🐾', 'Food': '🍔', 'Baby': '🍼', 'Accessories': '🎒',
};
const icon = (cat) => ICONS[cat] || '📦';

// ─── Star Rating ─────────────────────────────────────────────────────────────
const Stars = ({ n }) => (
  <span style={{ color: '#f90', fontSize: 12 }}>
    {'★'.repeat(n)}{'☆'.repeat(5 - n)}
  </span>
);

// ─── AI Deal Toast (appears after 2s inactivity) ─────────────────────────────
function AiToast({ coupon, products, onAccept, onDecline }) {
  const [secs, setSecs] = useState(30);
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
      position: 'fixed', bottom: 24, right: 24, zIndex: 9999, width: 360,
      background: '#fff', borderRadius: 12, border: '2px solid #FFD814',
      boxShadow: '0 8px 40px rgba(0,0,0,0.22)', overflow: 'hidden',
      animation: 'slideUp 0.35s ease-out',
    }}>
      <style>{`@keyframes slideUp{from{transform:translateY(80px);opacity:0}to{transform:translateY(0);opacity:1}}`}</style>

      {/* Header */}
      <div style={{ background: '#232F3E', padding: '10px 14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <div style={{ color: '#FFD814', fontWeight: 800, fontSize: 14 }}>🤖 AI Smart Deal Unlocked!</div>
          <div style={{ color: '#aaa', fontSize: 10 }}>Market Basket Analysis • Based on your cart</div>
        </div>
        <div style={{ background: '#cc0c39', color: '#fff', borderRadius: '50%', width: 30, height: 30, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 11 }}>{secs}s</div>
      </div>

      {/* Body */}
      <div style={{ padding: 14 }}>
        <p style={{ fontSize: 13, color: '#333', lineHeight: 1.4, margin: '0 0 10px' }}>{coupon.message}</p>

        {prod && (
          <div style={{ background: '#FFF9E6', border: '1px dashed #FFD814', borderRadius: 8, padding: 10, display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
            <div>
              <div style={{ fontWeight: 700, fontSize: 14 }}>{icon(prod.category)} {prod.name}</div>
              <div style={{ fontSize: 11, color: '#666', marginBottom: 4 }}>{prod.category}</div>
              <span style={{ textDecoration: 'line-through', color: '#999', fontSize: 12, marginRight: 8 }}>₹{prod.price}</span>
              <span style={{ color: '#cc0c39', fontWeight: 800, fontSize: 18 }}>₹{coupon.discount_price}</span>
            </div>
            <div style={{ background: '#cc0c39', color: '#fff', borderRadius: 6, padding: '6px 10px', fontWeight: 800, fontSize: 13, textAlign: 'center' }}>
              {coupon.discount_text}
            </div>
          </div>
        )}

        {/* AI stats */}
        <div style={{ fontSize: 11, background: '#f5f5f5', padding: '5px 10px', borderRadius: 6, marginBottom: 12, color: '#555' }}>
          <strong style={{ color: '#007185' }}>ML Engine:</strong> Lift: {coupon.lift} • Confidence: {coupon.confidence}%
        </div>

        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={onDecline} style={{ flex: 1, padding: '9px 0', background: '#f0f0f0', border: '1px solid #ccc', borderRadius: 20, cursor: 'pointer', fontWeight: 600, fontSize: 13 }}>
            No Thanks
          </button>
          <button onClick={() => onAccept(prod, coupon.discount_price)} style={{ flex: 2, padding: '9px 0', background: '#FFD814', border: 'none', borderRadius: 20, cursor: 'pointer', fontWeight: 800, fontSize: 14 }}>
            🛒 Add to Cart
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Product Card ─────────────────────────────────────────────────────────────
function ProductCard({ item, onAdd, inCart }) {
  const [flash, setFlash] = useState(false);
  const rating = useMemo(() => 3 + (item.id % 3), [item.id]);
  const reviews = useMemo(() => 120 + (item.id * 37 % 4800), [item.id]);
  const discPct = useMemo(() => 5 + (item.id * 13 % 40), [item.id]);
  const mrp = Math.round(item.price * (1 + discPct / 100));

  const handleAdd = () => {
    setFlash(true);
    onAdd(item);
    setTimeout(() => setFlash(false), 1600);
  };

  return (
    <div
      onMouseEnter={e => e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.13)'}
      onMouseLeave={e => e.currentTarget.style.boxShadow = '0 1px 4px rgba(0,0,0,0.07)'}
      style={{
        background: '#fff', borderRadius: 8, border: '1px solid #e0e0e0',
        overflow: 'hidden', display: 'flex', flexDirection: 'column',
        boxShadow: '0 1px 4px rgba(0,0,0,0.07)', transition: 'box-shadow 0.2s', position: 'relative'
      }}>
      {/* Discount badge */}
      <div style={{ position: 'absolute', top: 8, left: 8, background: '#cc0c39', color: '#fff', fontSize: 10, fontWeight: 700, padding: '2px 6px', borderRadius: 3 }}>
        -{discPct}%
      </div>

      {/* Emoji thumbnail */}
      <div style={{ height: 130, background: '#f7f7f7', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 46 }}>
        {icon(item.category)}
      </div>

      {/* Info */}
      <div style={{ padding: '10px 12px', flex: 1, display: 'flex', flexDirection: 'column' }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: '#111', lineHeight: 1.3, minHeight: 32, marginBottom: 2 }}>
          {item.name.length > 36 ? item.name.slice(0, 34) + '…' : item.name}
        </div>
        <div style={{ fontSize: 10, color: '#888', marginBottom: 3 }}>{item.category}</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <Stars n={rating} />
          <span style={{ fontSize: 10, color: '#007185' }}>({reviews.toLocaleString()})</span>
        </div>
        <div style={{ marginTop: 8 }}>
          <div style={{ fontSize: 10, color: '#999' }}>M.R.P: <span style={{ textDecoration: 'line-through' }}>₹{mrp}</span></div>
          <div style={{ fontSize: 18, fontWeight: 800, color: '#0F1111', lineHeight: 1.1 }}>₹{item.price}</div>
          <div style={{ fontSize: 10, color: '#cc0c39', fontWeight: 600 }}>Save ₹{mrp - item.price} ({discPct}%)</div>
        </div>
        <div style={{ fontSize: 11, color: '#007600', fontWeight: 600, margin: '4px 0 8px' }}>In Stock</div>
        <button onClick={handleAdd} style={{
          marginTop: 'auto', padding: '8px 0', borderRadius: 20, border: 'none', cursor: 'pointer',
          background: flash ? '#e6b800' : inCart ? '#f0c040' : '#FFD814',
          color: '#111', fontWeight: 700, fontSize: 13, transition: 'background 0.2s'
        }}>
          {flash ? '✓ Added!' : inCart ? 'Add More' : 'Add to Cart'}
        </button>
      </div>
    </div>
  );
}

// ─── Order Confirmation ───────────────────────────────────────────────────────
function OrderSuccess({ itemCount, total, savings, onContinue }) {
  return (
    <div style={{ minHeight: '100vh', background: '#EAEDED', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Arial, sans-serif' }}>
      <div style={{ background: '#fff', borderRadius: 10, padding: 48, textAlign: 'center', maxWidth: 480, boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}>
        <div style={{ fontSize: 64, marginBottom: 8 }}>✅</div>
        <h2 style={{ color: '#007600', margin: '0 0 8px' }}>Order Placed!</h2>
        <p style={{ color: '#555' }}>{itemCount} items • Delivery <strong>Tomorrow by 10 PM</strong></p>
        <div style={{ background: '#FFF9E6', border: '1px solid #FFD814', borderRadius: 8, padding: 16, margin: '16px 0' }}>
          <div style={{ fontWeight: 800, fontSize: 22 }}>Total: ₹{total.toFixed(2)}</div>
          {savings > 0 && <div style={{ color: '#cc0c39', fontSize: 13, marginTop: 4 }}>🎉 You saved ₹{savings} with AI deals!</div>}
        </div>
        <button onClick={onContinue} style={{ background: '#FFD814', border: 'none', borderRadius: 20, padding: '12px 32px', fontWeight: 800, fontSize: 16, cursor: 'pointer' }}>
          Continue Shopping
        </button>
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function UserCheckout() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cart, setCart] = useState([]);
  const [coupon, setCoupon] = useState(null);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [orderDone, setOrderDone] = useState(false);
  const [mlStatus, setMlStatus] = useState('Loading…');
  const inactivityRef = useRef(null);
  const latestCartRef = useRef([]);

  // ── Fetch products from FastAPI backend ──────────────────────────
  useEffect(() => {
    fetch('/api/products')
      .then(r => r.json())
      .then(data => {
        setProducts(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(() => setLoading(false));

    fetch('/api/health')
      .then(r => r.json())
      .then(d => setMlStatus(`${d.ml_rules} rules loaded`))
      .catch(() => setMlStatus('Backend offline'));
  }, []);

  // ── Add to cart + start 2-second inactivity timer ───────────────
  const handleAdd = (item) => {
    setCart(prev => {
      const exists = prev.find(i => i.id === item.id);
      const next = exists
        ? prev.map(i => i.id === item.id ? { ...i, qty: i.qty + 1 } : i)
        : [...prev, { ...item, qty: 1 }];

      latestCartRef.current = next;

      // Reset inactivity timer — coupon fires 2s after last "Add to Cart"
      clearTimeout(inactivityRef.current);
      inactivityRef.current = setTimeout(() => {
        if (!coupon && latestCartRef.current.length > 0) {
          fetchCoupon(latestCartRef.current);
        }
      }, 2000);

      return next;
    });
  };

  const fetchCoupon = async (cartItems) => {
    try {
      const res = await fetch('/api/coupon', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cart: cartItems.map(i => i.name) })
      });
      const data = await res.json();
      if (data.coupon) setCoupon(data.coupon);
    } catch (e) {
      console.error('ML coupon fetch failed:', e);
    }
  };

  const acceptCoupon = (prod, discountPrice) => {
    if (!prod) return setCoupon(null);
    setCart(prev => {
      const exists = prev.find(i => i.id === prod.id);
      if (exists) return prev.map(i => i.id === prod.id ? { ...i, qty: i.qty + 1 } : i);
      return [...prev, { ...prod, price: discountPrice ?? prod.price, qty: 1, isOffer: true }];
    });
    setCoupon(null);
  };

  const updateQty = (id, d) => setCart(prev =>
    prev.map(i => i.id === id ? { ...i, qty: Math.max(1, i.qty + d) } : i)
  );
  const removeItem = (id) => setCart(prev => prev.filter(i => i.id !== id));

  const handleCheckout = async () => {
    const accepted = cart.some(i => i.isOffer);
    await fetch('/api/checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        cart,
        coupon_shown: coupon?.recommendation || null,
        coupon_accepted: accepted
      })
    }).catch(() => {});
    setOrderDone(true);
  };

  const subtotal = cart.reduce((s, i) => s + i.price * i.qty, 0);
  const itemCount = cart.reduce((s, i) => s + i.qty, 0);
  const aiSavings = cart.filter(i => i.isOffer).reduce((s, i) => s + Math.round(i.price * 0.25), 0);
  const categories = ['All', ...new Set(products.map(p => p.category))];
  const filtered = products.filter(p =>
    (category === 'All' || p.category === category) &&
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  if (orderDone) return (
    <OrderSuccess
      itemCount={itemCount} total={subtotal} savings={aiSavings}
      onContinue={() => { setOrderDone(false); setCart([]); }}
    />
  );

  return (
    <div style={{ minHeight: '100vh', background: '#EAEDED', fontFamily: 'Arial, sans-serif' }}>

      {/* ── Navbar ── */}
      <nav style={{ background: '#232F3E', padding: '10px 20px', display: 'flex', alignItems: 'center', gap: 12, position: 'sticky', top: 0, zIndex: 100 }}>
        <div style={{ color: '#FF9900', fontWeight: 900, fontSize: 22, minWidth: 110 }}>
          smart<span style={{ color: '#fff' }}>shop</span>
        </div>
        <select value={category} onChange={e => setCategory(e.target.value)}
          style={{ padding: '9px 6px', background: '#f3f3f3', border: 'none', borderRadius: '4px 0 0 4px', fontSize: 12, maxWidth: 130, cursor: 'pointer' }}>
          {categories.map(c => <option key={c}>{c}</option>)}
        </select>
        <input value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Search 200+ products..."
          style={{ flex: 1, padding: '9px 14px', border: 'none', fontSize: 14, outline: 'none', maxWidth: 640 }} />
        <button style={{ padding: '0 16px', height: 38, background: '#FF9900', border: 'none', borderRadius: '0 4px 4px 0', cursor: 'pointer', fontSize: 16 }}>🔍</button>
        <div style={{ color: '#fff', position: 'relative', cursor: 'pointer', textAlign: 'center', minWidth: 48 }}>
          <div style={{ fontSize: 22 }}>🛒</div>
          {itemCount > 0 && (
            <div style={{ position: 'absolute', top: -4, right: 0, background: '#FF9900', color: '#111', borderRadius: '50%', width: 18, height: 18, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 800 }}>{itemCount}</div>
          )}
          <div style={{ fontSize: 10, color: '#ccc' }}>Cart</div>
        </div>
      </nav>

      {/* ── Body ── */}
      <div style={{ display: 'flex', gap: 16, maxWidth: 1440, margin: '0 auto', padding: 16, alignItems: 'flex-start' }}>

        {/* Products Grid */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 13, color: '#555', marginBottom: 10 }}>
            {loading
              ? '⏳ Loading products from database…'
              : <><strong>{filtered.length}</strong> products found</>}
          </div>
          {loading ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(185px,1fr))', gap: 14 }}>
              {[...Array(12)].map((_, i) => (
                <div key={i} style={{ height: 290, background: '#eee', borderRadius: 8, opacity: 0.6 }} />
              ))}
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(185px,1fr))', gap: 14 }}>
              {filtered.map(item => (
                <ProductCard key={item.id} item={item} onAdd={handleAdd} inCart={cart.some(c => c.id === item.id)} />
              ))}
            </div>
          )}
        </div>

        {/* Cart Sidebar */}
        <div style={{ width: 295, flexShrink: 0, position: 'sticky', top: 76 }}>
          {/* Cart Box */}
          <div style={{ background: '#fff', borderRadius: 8, border: '1px solid #ddd', overflow: 'hidden', marginBottom: 12 }}>
            <div style={{ background: '#232F3E', padding: '11px 14px', color: '#FFD814', fontWeight: 800, fontSize: 15 }}>
              🛒 Your Cart ({itemCount} items)
            </div>

            {cart.length === 0 ? (
              <div style={{ padding: 32, textAlign: 'center', color: '#999' }}>
                <div style={{ fontSize: 40, marginBottom: 8 }}>🛒</div>
                <div style={{ fontWeight: 600, marginBottom: 4 }}>Your cart is empty</div>
                <div style={{ fontSize: 11 }}>Add items → AI recommends in 2s!</div>
              </div>
            ) : (
              <>
                <div style={{ maxHeight: 360, overflowY: 'auto', padding: 12 }}>
                  {cart.map(item => (
                    <div key={item.id} style={{ display: 'flex', gap: 8, marginBottom: 12, paddingBottom: 12, borderBottom: '1px solid #f0f0f0' }}>
                      <div style={{ width: 38, height: 38, background: '#f5f5f5', borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0 }}>
                        {icon(item.category)}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 12, fontWeight: 600, lineHeight: 1.3 }}>{item.name}</div>
                        {item.isOffer && <span style={{ fontSize: 9, background: '#cc0c39', color: '#fff', padding: '1px 4px', borderRadius: 3, fontWeight: 700 }}>AI DEAL</span>}
                        <div style={{ fontSize: 13, fontWeight: 700 }}>₹{item.price}</div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 3 }}>
                          <button onClick={() => updateQty(item.id, -1)} style={{ width: 20, height: 20, border: '1px solid #ccc', background: '#f5f5f5', cursor: 'pointer', borderRadius: 3, fontWeight: 700, lineHeight: '18px', padding: 0 }}>−</button>
                          <span style={{ fontSize: 12, fontWeight: 700, width: 16, textAlign: 'center' }}>{item.qty}</span>
                          <button onClick={() => updateQty(item.id, 1)} style={{ width: 20, height: 20, border: '1px solid #ccc', background: '#f5f5f5', cursor: 'pointer', borderRadius: 3, fontWeight: 700, lineHeight: '18px', padding: 0 }}>+</button>
                          <button onClick={() => removeItem(item.id)} style={{ background: 'none', border: 'none', color: '#cc0c39', cursor: 'pointer', fontSize: 11, fontWeight: 600, paddingLeft: 6 }}>Delete</button>
                        </div>
                      </div>
                      <div style={{ fontSize: 12, fontWeight: 700, flexShrink: 0 }}>₹{(item.price * item.qty).toFixed(0)}</div>
                    </div>
                  ))}
                </div>
                <div style={{ padding: '12px 14px', background: '#FAFAFA', borderTop: '1px solid #eee' }}>
                  {aiSavings > 0 && <div style={{ color: '#cc0c39', fontSize: 12, fontWeight: 600, marginBottom: 6 }}>💰 AI saved you ₹{aiSavings}!</div>}
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700, fontSize: 15, marginBottom: 10 }}>
                    <span>Subtotal ({itemCount}):</span>
                    <span>₹{subtotal.toFixed(2)}</span>
                  </div>
                  <div style={{ fontSize: 11, color: '#007600', marginBottom: 10 }}>✅ FREE Delivery on orders above ₹499</div>
                  <button onClick={handleCheckout}
                    style={{ width: '100%', padding: '11px 0', background: '#FFD814', border: 'none', borderRadius: 20, fontWeight: 800, fontSize: 15, cursor: 'pointer', marginBottom: 7 }}>
                    ⚡ Proceed to Checkout
                  </button>
                  <button style={{ width: '100%', padding: '9px 0', background: '#FFA41C', border: 'none', borderRadius: 20, fontWeight: 700, fontSize: 14, cursor: 'pointer' }}>
                    Buy Now
                  </button>
                </div>
              </>
            )}
          </div>

          {/* ML Status Panel */}
          <div style={{ background: '#fff', borderRadius: 8, border: '1px solid #ddd', padding: 12, fontSize: 12 }}>
            <div style={{ fontWeight: 700, color: '#232F3E', marginBottom: 8, fontSize: 13 }}>🤖 AI Engine</div>
            {[
              ['Backend', 'FastAPI + SQLite', '#0066c0'],
              ['ML Rules', mlStatus, '#007600'],
              ['Products', `${products.length} items`, '#0066c0'],
              ['Coupon Trigger', '2s after last add', '#555'],
              ['AWS Ready', 'EC2 / RDS swap', '#007600'],
            ].map(([k, v, c]) => (
              <div key={k} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                <span style={{ color: '#555' }}>{k}</span>
                <span style={{ color: c, fontWeight: 600 }}>{v}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* AI Deal Toast */}
      {coupon && (
        <AiToast
          coupon={coupon}
          products={products}
          onAccept={acceptCoupon}
          onDecline={() => setCoupon(null)}
        />
      )}
    </div>
  );
}
