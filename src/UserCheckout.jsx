import React, { useState, useEffect, useRef, useMemo } from 'react';

// ─── Image Mapping (Premium Feel) ───────────────────────────────────────────
const GET_IMAGE = (name, cat) => {
  const query = encodeURIComponent(name);
  return `https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=400&h=300&q=${query}`;
  // Note: In a real app, we'd have a specific map or use a search API.
  // For this demo, we'll use a high-quality grocery/tech placeholder if specific ones aren't found.
};

const CATEGORY_IMAGES = {
  'Electronics': 'https://images.unsplash.com/photo-1498049794561-7780e7231661?auto=format&fit=crop&q=80&w=400',
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

// ─── Star Rating ─────────────────────────────────────────────────────────────
const Stars = ({ n }) => (
  <span style={{ color: '#f90', fontSize: 12 }}>
    {'★'.repeat(n)}{'☆'.repeat(5 - n)}
  </span>
);

// ─── AI Deal Modal (Triggered on Checkout) ─────────────────────────────
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
      background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10000,
      animation: 'fadeIn 0.3s ease-out'
    }}>
      <style>{`
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes popIn { from { transform: scale(0.8); opacity: 0; } to { transform: scale(1); opacity: 1; } }
      `}</style>
      
      <div style={{
        width: 420, background: '#fff', borderRadius: 20, overflow: 'hidden',
        boxShadow: '0 20px 60px rgba(0,0,0,0.4)', animation: 'popIn 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
      }}>
        {/* Header */}
        <div style={{ 
          background: 'linear-gradient(135deg, #232F3E, #37475A)', 
          padding: '24px', textAlign: 'center', color: '#fff' 
        }}>
          <div style={{ 
            display: 'inline-block', background: 'rgba(255,216,20,0.1)', 
            padding: '4px 12px', borderRadius: 20, color: '#FFD814', 
            fontSize: 12, fontWeight: 800, marginBottom: 8, border: '1px solid rgba(255,216,20,0.3)'
          }}>
            🤖 AI SMART REWARD
          </div>
          <h2 style={{ margin: 0, fontSize: 24, fontWeight: 900 }}>Special Deal Found!</h2>
          <p style={{ margin: '8px 0 0', opacity: 0.8, fontSize: 13 }}>We found a perfect match for your cart.</p>
        </div>

        <div style={{ padding: 24 }}>
          {prod && (
            <div style={{ 
              background: '#f9f9f9', borderRadius: 16, padding: 16, 
              border: '1px solid #eee', marginBottom: 20, display: 'flex', gap: 16
            }}>
              <div style={{ 
                width: 80, height: 80, background: '#fff', borderRadius: 12, 
                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 40,
                boxShadow: '0 4px 12px rgba(0,0,0,0.05)'
              }}>
                {prod.image_emoji || '📦'}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 11, color: '#007185', fontWeight: 700, textTransform: 'uppercase' }}>{prod.category}</div>
                <div style={{ fontSize: 16, fontWeight: 800, color: '#111', margin: '2px 0 6px' }}>{prod.name}</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ textDecoration: 'line-through', color: '#999', fontSize: 13 }}>₹{prod.price}</span>
                  <span style={{ color: '#cc0c39', fontWeight: 900, fontSize: 22 }}>₹{coupon.discount_price}</span>
                  <span style={{ background: '#cc0c39', color: '#fff', fontSize: 10, fontWeight: 900, padding: '2px 6px', borderRadius: 4 }}>
                    {coupon.discount_text}
                  </span>
                </div>
              </div>
            </div>
          )}

          <p style={{ fontSize: 14, color: '#444', lineHeight: 1.5, marginBottom: 20, fontStyle: 'italic', borderLeft: '4px solid #FFD814', paddingLeft: 12 }}>
            "{coupon.message}"
          </p>

          <div style={{ display: 'flex', gap: 12 }}>
            <button onClick={onDecline} style={{ flex: 1, padding: '14px 0', background: '#f0f0f0', border: 'none', borderRadius: 12, cursor: 'pointer', fontWeight: 700, color: '#555' }}>
              No, Checkout Now
            </button>
            <button onClick={() => onAccept(prod, coupon.discount_price)} style={{ flex: 1.5, padding: '14px 0', background: '#FFD814', border: 'none', borderRadius: 12, cursor: 'pointer', fontWeight: 800, fontSize: 16, boxShadow: '0 4px 15px rgba(255,216,20,0.3)' }}>
              Add to Cart & Pay
            </button>
          </div>

          <div style={{ textAlign: 'center', marginTop: 16, fontSize: 11, color: '#aaa' }}>
            Offer expires in <strong style={{ color: '#cc0c39' }}>{secs}s</strong>
          </div>
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
  
  const imgUrl = CATEGORY_IMAGES[item.category] || `https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=60&w=400`;

  const handleAdd = () => {
    setFlash(true);
    onAdd(item);
    setTimeout(() => setFlash(false), 1600);
  };

  if (!item || !item.name) return null;

  return (
    <div
      style={{
        background: '#fff', borderRadius: 12, border: '1px solid #e7e7e7',
        overflow: 'hidden', display: 'flex', flexDirection: 'column',
        boxShadow: '0 2px 8px rgba(0,0,0,0.04)', transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        position: 'relative', cursor: 'pointer'
      }}
      onMouseEnter={e => {
        e.currentTarget.style.transform = 'translateY(-4px)';
        e.currentTarget.style.boxShadow = '0 12px 24px rgba(0,0,0,0.1)';
      }}
      onMouseLeave={e => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.04)';
      }}
    >
      <div style={{ position: 'absolute', top: 10, left: 10, zIndex: 2, background: '#cc0c39', color: '#fff', fontSize: 11, fontWeight: 900, padding: '3px 8px', borderRadius: 4, boxShadow: '0 2px 6px rgba(204,12,57,0.3)' }}>
        {discPct}% OFF
      </div>

      {/* Image / Emoji Layered */}
      <div style={{ height: 160, position: 'relative', overflow: 'hidden', background: '#f8f8f8' }}>
        <img src={imgUrl} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.85 }} />
        <div style={{ 
          position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, 
          background: 'linear-gradient(to bottom, transparent, rgba(255,255,255,0.9))',
          display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 56
        }}>
          {item.image_emoji || '📦'}
        </div>
      </div>

      {/* Info */}
      <div style={{ padding: '12px 14px', flex: 1, display: 'flex', flexDirection: 'column' }}>
        <div style={{ fontSize: 11, color: '#007185', fontWeight: 700, marginBottom: 2 }}>{item.category}</div>
        <div style={{ fontSize: 14, fontWeight: 700, color: '#111', lineHeight: 1.3, height: 36, overflow: 'hidden', marginBottom: 4 }}>
          {item.name}
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginBottom: 8 }}>
          <Stars n={rating} />
          <span style={{ fontSize: 11, color: '#007185' }}>{reviews.toLocaleString()}</span>
        </div>

        <div style={{ marginTop: 'auto' }}>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
            <span style={{ fontSize: 22, fontWeight: 900, color: '#0F1111' }}>₹{item.price}</span>
            <span style={{ fontSize: 12, color: '#565959', textDecoration: 'line-through' }}>₹{mrp}</span>
          </div>
          <div style={{ fontSize: 11, color: '#cc0c39', fontWeight: 700, marginBottom: 12 }}>Save ₹{mrp - item.price}</div>
          
          <button onClick={handleAdd} style={{
            width: '100%', padding: '10px 0', borderRadius: 25, border: 'none', cursor: 'pointer',
            background: flash ? '#00B127' : inCart ? '#FFD814' : '#FFA41C',
            color: flash ? '#fff' : '#111', fontWeight: 800, fontSize: 13, 
            transition: 'all 0.2s', boxShadow: '0 2px 5px rgba(0,0,0,0.1)'
          }}>
            {flash ? '✓ Added to Cart' : inCart ? 'Add One More' : 'Add to Cart'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Order Confirmation ───────────────────────────────────────────────────────
function OrderSuccess({ itemCount, total, savings, onContinue }) {
  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
      <div style={{ background: '#fff', borderRadius: 24, padding: 48, textAlign: 'center', maxWidth: 500, boxShadow: '0 30px 60px rgba(0,0,0,0.12)', animation: 'popIn 0.5s ease-out' }}>
        <div style={{ fontSize: 80, marginBottom: 16 }}>🎉</div>
        <h1 style={{ color: '#111', margin: '0 0 8px', fontSize: 32, fontWeight: 900 }}>Payment Successful!</h1>
        <p style={{ color: '#555', fontSize: 16 }}>Your order of <strong>{itemCount} items</strong> is being processed.</p>
        
        <div style={{ background: '#f8f9fa', borderRadius: 16, padding: 24, margin: '24px 0', border: '1px dashed #ddd' }}>
          <div style={{ color: '#666', fontSize: 14, marginBottom: 4 }}>Amount Paid</div>
          <div style={{ fontWeight: 900, fontSize: 36, color: '#111' }}>₹{total.toFixed(2)}</div>
          {savings > 0 && (
            <div style={{ marginTop: 12, display: 'inline-block', background: '#E7F9ED', color: '#007600', padding: '6px 16px', borderRadius: 20, fontSize: 14, fontWeight: 700 }}>
              You saved ₹{savings} with AI Smart Deals!
            </div>
          )}
        </div>

        <button onClick={onContinue} style={{ width: '100%', background: '#232F3E', color: '#fff', border: 'none', borderRadius: 12, padding: '16px', fontWeight: 800, fontSize: 16, cursor: 'pointer', transition: 'transform 0.2s' }}>
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
  const [checkingDeals, setCheckingDeals] = useState(false);
  
  // ── Fetch products from FastAPI backend ──────────────────────────
  useEffect(() => {
    fetch('/api/products')
      .then(r => r.json())
      .then(data => {
        setProducts(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const handleAdd = (item) => {
    setCart(prev => {
      const exists = prev.find(i => i.id === item.id);
      if (exists) return prev.map(i => i.id === item.id ? { ...i, qty: i.qty + 1 } : i);
      return [...prev, { ...item, qty: 1 }];
    });
  };

  const startCheckout = async () => {
    if (cart.length === 0) return;
    
    // User clicked Checkout/Buy Now -> Check for AI deals first
    setCheckingDeals(true);
    
    try {
      const res = await fetch('/api/coupon', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cart: cart.map(i => i.name) })
      });
      const data = await res.json();
      
      // Delay for "AI processing" effect
      setTimeout(() => {
        setCheckingDeals(false);
        if (data.coupon) {
          setCoupon(data.coupon);
        } else {
          // No deals, proceed directly to final checkout
          finishCheckout();
        }
      }, 1200);
    } catch (e) {
      setCheckingDeals(false);
      finishCheckout();
    }
  };

  const finishCheckout = async (finalCart = cart) => {
    const accepted = finalCart.some(i => i.isOffer);
    await fetch('/api/checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        cart: finalCart,
        coupon_shown: coupon?.recommendation || null,
        coupon_accepted: accepted
      })
    }).catch(() => {});
    setOrderDone(true);
  };

  const acceptCoupon = (prod, discountPrice) => {
    if (!prod) return setCoupon(null);
    const updatedCart = [...cart];
    const exists = updatedCart.find(i => i.id === prod.id);
    
    let nextCart;
    if (exists) {
      nextCart = updatedCart.map(i => i.id === prod.id ? { ...i, qty: i.qty + 1 } : i);
    } else {
      nextCart = [...updatedCart, { ...prod, price: discountPrice ?? prod.price, qty: 1, isOffer: true }];
    }
    
    setCart(nextCart);
    setCoupon(null);
    finishCheckout(nextCart); // Proceed to checkout with the new item
  };

  const updateQty = (id, d) => setCart(prev =>
    prev.map(i => i.id === id ? { ...i, qty: Math.max(1, i.qty + d) } : i)
  );
  const removeItem = (id) => setCart(prev => prev.filter(i => i.id !== id));

  const subtotal = cart.reduce((s, i) => s + i.price * i.qty, 0);
  const itemCount = cart.reduce((s, i) => s + i.qty, 0);
  const aiSavings = cart.filter(i => i.isOffer).reduce((s, i) => s + (i.qty * 15), 0); // Mock savings calc
  
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
    <div style={{ minHeight: '100vh', background: '#f4f6f8', fontFamily: "'Outfit', 'Inter', sans-serif" }}>
      {/* ── Navbar ── */}
      <nav style={{ background: '#232F3E', padding: '12px 24px', display: 'flex', alignItems: 'center', gap: 16, position: 'sticky', top: 0, zIndex: 100, boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
        <div style={{ color: '#FF9900', fontWeight: 900, fontSize: 26, letterSpacing: '-1px' }}>
          smart<span style={{ color: '#fff' }}>shop</span>
        </div>
        
        <div style={{ flex: 1, display: 'flex', background: '#fff', borderRadius: 8, overflow: 'hidden', maxWidth: 800 }}>
          <select value={category} onChange={e => setCategory(e.target.value)}
            style={{ padding: '0 15px', background: '#f3f3f3', border: 'none', borderRight: '1px solid #ddd', fontSize: 13, cursor: 'pointer', outline: 'none' }}>
            {categories.map(c => <option key={c}>{c}</option>)}
          </select>
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search from 1000+ premium products..."
            style={{ flex: 1, padding: '12px 16px', border: 'none', fontSize: 15, outline: 'none' }} />
          <button style={{ padding: '0 20px', background: '#FF9900', border: 'none', cursor: 'pointer', fontSize: 18 }}>🔍</button>
        </div>

        <div style={{ color: '#fff', position: 'relative', cursor: 'pointer', textAlign: 'center', minWidth: 60 }}>
          <div style={{ fontSize: 24 }}>🛒</div>
          {itemCount > 0 && (
            <div style={{ position: 'absolute', top: -5, right: 8, background: '#f08804', color: '#fff', borderRadius: '50%', width: 20, height: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 900 }}>{itemCount}</div>
          )}
        </div>
      </nav>

      {/* ── Body ── */}
      <div style={{ display: 'flex', gap: 24, maxWidth: 1400, margin: '0 auto', padding: 24, alignItems: 'flex-start' }}>
        
        {/* Products Grid */}
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <h2 style={{ margin: 0, fontSize: 22, fontWeight: 800, color: '#111' }}>
              {category === 'All' ? 'Our Collections' : category}
            </h2>
            <div style={{ fontSize: 14, color: '#666' }}>Showing {filtered.length} products</div>
          </div>

          {loading ? (
            <div style={{ textAlign: 'center', padding: '100px 0' }}>
              <div style={{ fontSize: 40, animation: 'spin 2s linear infinite' }}>⏳</div>
              <p style={{ color: '#666', marginTop: 12 }}>Connecting to Smart AI Database...</p>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 20 }}>
              {filtered.map(item => (
                <ProductCard key={item.id} item={item} onAdd={handleAdd} inCart={cart.some(c => c.id === item.id)} />
              ))}
            </div>
          )}
        </div>

        {/* Cart Sidebar */}
        <div style={{ width: 340, flexShrink: 0, position: 'sticky', top: 90 }}>
          <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #e0e0e0', boxShadow: '0 4px 20px rgba(0,0,0,0.05)', overflow: 'hidden' }}>
            <div style={{ background: '#232F3E', padding: '16px 20px', color: '#fff', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontWeight: 800, fontSize: 16 }}>Shopping Cart</span>
              <span style={{ background: 'rgba(255,255,255,0.2)', padding: '2px 8px', borderRadius: 10, fontSize: 12 }}>{itemCount} items</span>
            </div>

            {cart.length === 0 ? (
              <div style={{ padding: 48, textAlign: 'center', color: '#bbb' }}>
                <div style={{ fontSize: 60, marginBottom: 16, opacity: 0.3 }}>🛒</div>
                <div style={{ fontWeight: 700, fontSize: 16, color: '#999' }}>Your cart is empty</div>
                <p style={{ fontSize: 13, marginTop: 8 }}>Add something to see AI deals at checkout!</p>
              </div>
            ) : (
              <div style={{ padding: 20 }}>
                <div style={{ maxHeight: 400, overflowY: 'auto', marginBottom: 20 }}>
                  {cart.map(item => (
                    <div key={item.id} style={{ display: 'flex', gap: 12, marginBottom: 16, paddingBottom: 16, borderBottom: '1px solid #f0f0f0' }}>
                      <div style={{ width: 50, height: 50, background: '#f8f8f8', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24 }}>
                        {item.image_emoji || '📦'}
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 13, fontWeight: 700, color: '#111', lineHeight: 1.2 }}>{item.name}</div>
                        <div style={{ fontSize: 15, fontWeight: 800, color: '#111', margin: '4px 0' }}>₹{item.price}</div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <div style={{ display: 'flex', alignItems: 'center', background: '#f3f3f3', borderRadius: 6, padding: '2px' }}>
                            <button onClick={() => updateQty(item.id, -1)} style={{ width: 24, height: 24, border: 'none', background: 'none', cursor: 'pointer', fontWeight: 900 }}>−</button>
                            <span style={{ width: 24, textAlign: 'center', fontSize: 13, fontWeight: 800 }}>{item.qty}</span>
                            <button onClick={() => updateQty(item.id, 1)} style={{ width: 24, height: 24, border: 'none', background: 'none', cursor: 'pointer', fontWeight: 900 }}>+</button>
                          </div>
                          <button onClick={() => removeItem(item.id)} style={{ background: 'none', border: 'none', color: '#cc0c39', cursor: 'pointer', fontSize: 12, fontWeight: 700 }}>Remove</button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div style={{ borderTop: '2px solid #f0f0f0', paddingTop: 16 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                    <span style={{ color: '#666' }}>Subtotal</span>
                    <span style={{ fontWeight: 700 }}>₹{subtotal.toFixed(2)}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20 }}>
                    <span style={{ color: '#111', fontWeight: 800, fontSize: 18 }}>Total</span>
                    <span style={{ color: '#B12704', fontWeight: 900, fontSize: 22 }}>₹{subtotal.toFixed(2)}</span>
                  </div>

                  <button 
                    onClick={startCheckout}
                    disabled={checkingDeals}
                    style={{ 
                      width: '100%', padding: '16px', background: '#FFD814', border: 'none', 
                      borderRadius: 12, fontWeight: 800, fontSize: 16, cursor: 'pointer',
                      boxShadow: '0 4px 12px rgba(255,216,20,0.3)', transition: 'all 0.2s',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10
                    }}
                  >
                    {checkingDeals ? (
                      <>Checking AI Deals... <div className="spinner"></div></>
                    ) : (
                      'Proceed to Checkout'
                    )}
                  </button>
                  
                  <button 
                    onClick={startCheckout}
                    style={{ 
                      width: '100%', padding: '14px', background: '#FFA41C', border: 'none', 
                      borderRadius: 12, fontWeight: 800, fontSize: 15, cursor: 'pointer', marginTop: 12
                    }}
                  >
                    Buy Now
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* AI Deal Modal */}
      {coupon && (
        <AiDealModal
          coupon={coupon}
          products={products}
          onAccept={acceptCoupon}
          onDecline={() => { setCoupon(null); finishCheckout(); }}
        />
      )}

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        .spinner { width: 18px; height: 18px; border: 3px solid rgba(0,0,0,0.1); border-top-color: #111; border-radius: 50%; animation: spin 0.8s linear infinite; }
        @keyframes popIn { from { transform: scale(0.9); opacity: 0; } to { transform: scale(1); opacity: 1; } }
      `}</style>
    </div>
  );
}
