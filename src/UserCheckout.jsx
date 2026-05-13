import React, { useState, useEffect, useMemo } from 'react';
import { MENU_ITEMS } from './data/products';

// ─── Category Icons (emoji-based, no dependency) ───────────────────────────
const CATEGORY_ICONS = {
  'Electronics': '💻', 'Groceries': '🛒', 'Snacks & Beverages': '🍫',
  'Home & Kitchen': '🏠', 'Personal Care': '🧴', 'Clothing & Accessories': '👕',
  'Office Supplies': '📎', 'Tools & Hardware': '🔧', 'Toys & Games': '🎮', 'Pets': '🐾'
};

// Star rating component
const Stars = ({ rating = 4.2, count = 1847 }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 4 }}>
    {[1,2,3,4,5].map(s => (
      <span key={s} style={{ color: s <= Math.round(rating) ? '#f90' : '#ccc', fontSize: 13 }}>★</span>
    ))}
    <span style={{ color: '#007185', fontSize: 12, cursor: 'pointer' }}>{count.toLocaleString()}</span>
  </div>
);

// Prime badge
const PrimeBadge = () => (
  <div style={{ display: 'inline-flex', alignItems: 'center', background: '#00a8e0', color: '#fff', fontSize: 10, fontWeight: 800, padding: '1px 6px', borderRadius: 3, marginTop: 4, letterSpacing: 1 }}>
    prime
  </div>
);

// ─── Product Card (Amazon-style) ────────────────────────────────────────────
const ProductCard = ({ item, onAddToCart, inCart }) => {
  const [added, setAdded] = useState(false);
  const rating = useMemo(() => +(3.5 + Math.random() * 1.5).toFixed(1), []);
  const reviews = useMemo(() => Math.floor(200 + Math.random() * 5000), []);
  const discount = useMemo(() => Math.floor(5 + Math.random() * 40), []);
  const mrp = useMemo(() => Math.round(item.price * (1 + discount / 100)), [item.price, discount]);

  const handleAdd = async () => {
    setAdded(true);
    await onAddToCart(item);
    setTimeout(() => setAdded(false), 2000);
  };

  return (
    <div style={{
      background: '#fff', borderRadius: 8, overflow: 'hidden',
      boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
      border: '1px solid #e8e8e8', display: 'flex', flexDirection: 'column',
      transition: 'box-shadow 0.2s', cursor: 'default',
      position: 'relative'
    }}
      onMouseEnter={e => e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.15)'}
      onMouseLeave={e => e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.08)'}
    >
      {/* Discount badge */}
      <div style={{ position: 'absolute', top: 8, left: 8, background: '#cc0c39', color: '#fff', fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 3 }}>
        -{discount}%
      </div>

      {/* Product "image" placeholder */}
      <div style={{ height: 160, background: 'linear-gradient(135deg, #f5f5f5, #ececec)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 52 }}>
        {CATEGORY_ICONS[item.category] || '📦'}
      </div>

      {/* Details */}
      <div style={{ padding: '12px 14px', flex: 1, display: 'flex', flexDirection: 'column' }}>
        <div style={{ fontSize: 13, color: '#0F1111', fontWeight: 500, lineHeight: 1.4, minHeight: 36, marginBottom: 4 }}>
          {item.name}
        </div>
        <div style={{ fontSize: 11, color: '#565959', marginBottom: 4 }}>{item.category}</div>
        <Stars rating={rating} count={reviews} />
        <PrimeBadge />

        {/* Pricing */}
        <div style={{ marginTop: 10 }}>
          <span style={{ fontSize: 11, color: '#565959' }}>M.R.P: </span>
          <span style={{ fontSize: 11, color: '#565959', textDecoration: 'line-through' }}>₹{mrp}</span>
          <div style={{ fontSize: 20, fontWeight: 700, color: '#0F1111', lineHeight: 1 }}>₹{item.price}</div>
          <div style={{ fontSize: 11, color: '#cc0c39', fontWeight: 600 }}>Save ₹{mrp - item.price} ({discount}%)</div>
        </div>

        <div style={{ fontSize: 11, color: '#007600', marginTop: 6, fontWeight: 600 }}>In Stock</div>

        {/* Add to Cart button */}
        <button
          onClick={handleAdd}
          style={{
            marginTop: 12, padding: '8px 12px', borderRadius: 20,
            border: 'none', cursor: 'pointer', fontWeight: 700, fontSize: 13,
            background: added ? '#e6b800' : (inCart ? '#f0c040' : '#FFD814'),
            color: '#111', transition: 'all 0.2s', width: '100%'
          }}
        >
          {added ? '✓ Added to Cart' : inCart ? 'Add More' : 'Add to Cart'}
        </button>
      </div>
    </div>
  );
};

// ─── AI Offer Popup (Amazon Deal Notification style) ────────────────────────
const AiOfferPopup = ({ offer, onAccept, onDecline }) => {
  const [timeLeft, setTimeLeft] = useState(30);

  useEffect(() => {
    const timer = setInterval(() => setTimeLeft(t => {
      if (t <= 1) { clearInterval(timer); onDecline(); return 0; }
      return t - 1;
    }), 1000);
    return () => clearInterval(timer);
  }, []);

  if (!offer) return null;

  return (
    <div style={{
      position: 'fixed', bottom: 30, right: 30, zIndex: 9999,
      width: 380, background: '#fff', borderRadius: 12,
      boxShadow: '0 8px 40px rgba(0,0,0,0.3)', border: '2px solid #FFD814',
      animation: 'slideInUp 0.4s ease-out',
      overflow: 'hidden'
    }}>
      <style>{`
        @keyframes slideInUp { from { transform: translateY(100px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
        @keyframes pulse { 0%,100% { opacity: 1; } 50% { opacity: 0.6; } }
      `}</style>

      {/* Header */}
      <div style={{ background: 'linear-gradient(135deg, #232F3E, #37475A)', padding: '12px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 20 }}>🤖</span>
          <div>
            <div style={{ color: '#FFD814', fontWeight: 800, fontSize: 14 }}>AI Smart Deal!</div>
            <div style={{ color: '#aaa', fontSize: 10 }}>Based on your cart • Market Basket Analysis</div>
          </div>
        </div>
        <div style={{ background: '#cc0c39', color: '#fff', borderRadius: '50%', width: 28, height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 800 }}>
          {timeLeft}s
        </div>
      </div>

      {/* Body */}
      <div style={{ padding: 16 }}>
        <div style={{ fontSize: 13, color: '#444', lineHeight: 1.5, marginBottom: 12 }}>
          {offer.message || `Customers who bought ${offer.triggerItem} also bought this!`}
        </div>

        {offer.offerItem && (
          <div style={{ background: '#FFF9E6', border: '1px dashed #FFD814', borderRadius: 8, padding: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <div>
              <div style={{ fontWeight: 700, fontSize: 14, color: '#0F1111' }}>{offer.offerItem.name}</div>
              <div style={{ fontSize: 12, color: '#565959' }}>{offer.offerItem.category}</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4 }}>
                <span style={{ textDecoration: 'line-through', color: '#999', fontSize: 12 }}>₹{offer.offerItem.price}</span>
                <span style={{ color: '#cc0c39', fontWeight: 800, fontSize: 18 }}>₹{offer.discountPrice}</span>
              </div>
            </div>
            <div style={{ background: '#cc0c39', color: '#fff', borderRadius: 6, padding: '6px 12px', fontWeight: 800, fontSize: 14, textAlign: 'center' }}>
              {offer.discountText}
            </div>
          </div>
        )}

        {/* AI badge */}
        <div style={{ background: '#f0f8ff', border: '1px solid #cce', borderRadius: 6, padding: '6px 10px', fontSize: 11, color: '#555', marginBottom: 14, display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ color: '#007185', fontWeight: 700 }}>AI Engine:</span>
          {offer.aiType || 'Cloud Market Basket Analysis'}
        </div>

        {/* Buttons */}
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={onDecline} style={{ flex: 1, padding: '10px 0', background: '#f5f5f5', border: '1px solid #ccc', borderRadius: 20, cursor: 'pointer', fontWeight: 600, fontSize: 13, color: '#333' }}>
            No Thanks
          </button>
          <button onClick={onAccept} style={{ flex: 2, padding: '10px 0', background: '#FFD814', border: 'none', borderRadius: 20, cursor: 'pointer', fontWeight: 800, fontSize: 14, color: '#111' }}>
            🛒 Add to Cart
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── Main Component ──────────────────────────────────────────────────────────
export default function UserCheckout() {
  const [cart, setCart] = useState([]);
  const [currentOffer, setCurrentOffer] = useState(null);
  const [showOffer, setShowOffer] = useState(false);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState(false);

  const categories = ['All', ...Object.keys(CATEGORY_ICONS)];

  // IoT Camera polling
  useEffect(() => {
    if (!isCameraActive) return;
    const interval = setInterval(async () => {
      try {
        const res = await fetch('/api/iot/latest_offer');
        const data = await res.json();
        if (data.new_offer && data.offer) {
          setCurrentOffer(data.offer);
          setShowOffer(true);
        }
      } catch (e) { /* silent fail */ }
    }, 3000);
    return () => clearInterval(interval);
  }, [isCameraActive]);

  // Add to cart + ML recommendation
  const handleAddToCart = async (item) => {
    const newCart = [...cart];
    const existing = newCart.find(i => i.id === item.id);
    if (existing) { existing.qty += 1; } else { newCart.push({ ...item, qty: 1 }); }
    setCart([...newCart]);

    try {
      const res = await fetch('/api/cart/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ device_id: 'kiosk-01', cart: newCart.map(i => i.name) })
      });
      const data = await res.json();
      if (data.ai_response?.recommendation) {
        const recName = data.ai_response.recommendation;
        const recItem = MENU_ITEMS.find(i => i.name === recName);
        if (recItem && !showOffer) {
          const pct = (data.ai_response.discountText?.match(/(\d+)%/) || [])[1] || 20;
          const discountPrice = Math.floor(recItem.price * (1 - pct / 100));
          setCurrentOffer({
            triggerItem: item.name,
            offerItem: recItem,
            discountText: data.ai_response.discountText,
            discountPrice,
            message: data.ai_response.message,
            aiType: `Cloud MBA (Lift: ${data.ai_response.lift})`
          });
          setTimeout(() => setShowOffer(true), 600);
        }
      }
    } catch (e) { /* ML offline, still works locally */ }
  };

  const handleAcceptOffer = () => {
    if (currentOffer?.offerItem) {
      setCart(prev => {
        const exists = prev.find(i => i.id === currentOffer.offerItem.id);
        if (exists) return prev.map(i => i.id === currentOffer.offerItem.id ? { ...i, qty: i.qty + 1 } : i);
        return [...prev, { ...currentOffer.offerItem, price: currentOffer.discountPrice, qty: 1, isOffer: true }];
      });
    }
    setShowOffer(false);
  };

  const updateQty = (id, delta) => {
    setCart(prev => prev.map(i => i.id === id ? { ...i, qty: Math.max(1, i.qty + delta) } : i));
  };

  const removeItem = (id) => setCart(prev => prev.filter(i => i.id !== id));

  const filtered = MENU_ITEMS.filter(item =>
    (activeCategory === 'All' || item.category === activeCategory) &&
    item.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const subtotal = cart.reduce((s, i) => s + i.price * i.qty, 0);
  const savings = cart.reduce((s, i) => s + (i.isOffer ? Math.floor(i.price * 0.25) : 0), 0);
  const itemCount = cart.reduce((s, i) => s + i.qty, 0);

  const handleCheckout = () => {
    setIsCheckingOut(true);
    setTimeout(() => { setOrderPlaced(true); setIsCheckingOut(false); }, 2000);
  };

  if (orderPlaced) return (
    <div style={{ minHeight: '100vh', background: '#EAEDED', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Amazon Ember, Arial, sans-serif' }}>
      <div style={{ background: '#fff', borderRadius: 8, padding: 48, textAlign: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', maxWidth: 480 }}>
        <div style={{ fontSize: 64, marginBottom: 16 }}>✅</div>
        <h2 style={{ color: '#007600', margin: '0 0 8px' }}>Order Placed Successfully!</h2>
        <p style={{ color: '#555', marginBottom: 24 }}>Your order for {itemCount} item(s) has been placed. Estimated delivery: <strong>Tomorrow by 10 PM</strong></p>
        <div style={{ background: '#FFF9E6', border: '1px solid #FFD814', borderRadius: 8, padding: 16, marginBottom: 24 }}>
          <div style={{ fontWeight: 700, fontSize: 18 }}>Order Total: ₹{subtotal.toFixed(2)}</div>
          {savings > 0 && <div style={{ color: '#cc0c39', fontSize: 14 }}>You saved ₹{savings} with AI deals!</div>}
        </div>
        <button onClick={() => { setOrderPlaced(false); setCart([]); }}
          style={{ background: '#FFD814', border: 'none', borderRadius: 20, padding: '12px 32px', fontWeight: 800, fontSize: 16, cursor: 'pointer', color: '#111' }}>
          Continue Shopping
        </button>
      </div>
    </div>
  );

  return (
    <div style={{ minHeight: '100vh', background: '#EAEDED', fontFamily: 'Amazon Ember, Arial, sans-serif' }}>

      {/* ── Top Navbar ── */}
      <div style={{ background: '#232F3E', padding: '10px 20px', display: 'flex', alignItems: 'center', gap: 16, position: 'sticky', top: 0, zIndex: 100 }}>
        {/* Logo */}
        <div style={{ color: '#FF9900', fontWeight: 900, fontSize: 20, letterSpacing: -1, minWidth: 100 }}>
          smart<span style={{ color: '#fff' }}>shop</span>
        </div>

        {/* Search bar */}
        <div style={{ flex: 1, display: 'flex', maxWidth: 800 }}>
          <select value={activeCategory} onChange={e => setActiveCategory(e.target.value)}
            style={{ padding: '10px 8px', background: '#f3f3f3', border: 'none', borderRadius: '4px 0 0 4px', fontSize: 12, cursor: 'pointer', maxWidth: 120 }}>
            <option value="All">All Categories</option>
            {Object.keys(CATEGORY_ICONS).map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          <input
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            placeholder="Search products..."
            style={{ flex: 1, padding: '10px 14px', border: 'none', fontSize: 14, outline: 'none' }}
          />
          <button style={{ padding: '0 18px', background: '#FF9900', border: 'none', borderRadius: '0 4px 4px 0', cursor: 'pointer', fontSize: 18 }}>🔍</button>
        </div>

        {/* IoT Camera Toggle */}
        <button onClick={() => setIsCameraActive(!isCameraActive)}
          style={{ padding: '8px 14px', background: isCameraActive ? '#007600' : '#555', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer', fontSize: 12, fontWeight: 700, whiteSpace: 'nowrap' }}>
          📷 {isCameraActive ? 'IoT: LIVE' : 'IoT: OFF'}
        </button>

        {/* Cart icon */}
        <div style={{ color: '#fff', textAlign: 'center', cursor: 'pointer', position: 'relative', minWidth: 60 }}>
          <div style={{ fontSize: 24 }}>🛒</div>
          {itemCount > 0 && <div style={{ position: 'absolute', top: -4, right: 8, background: '#FF9900', color: '#111', borderRadius: '50%', width: 20, height: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 800 }}>{itemCount}</div>}
          <div style={{ fontSize: 10, color: '#ccc' }}>Cart</div>
        </div>
      </div>

      {/* ── Main Content ── */}
      <div style={{ display: 'flex', gap: 0, maxWidth: 1400, margin: '0 auto', padding: '20px 16px', alignItems: 'flex-start' }}>

        {/* ── Product Grid ── */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ marginBottom: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ fontSize: 14, color: '#555' }}>
              {filtered.length > 0
                ? <span><strong>{filtered.length}</strong> results{activeCategory !== 'All' ? ` in "${activeCategory}"` : ''}{searchTerm ? ` for "${searchTerm}"` : ''}</span>
                : <span style={{ color: '#cc0c39' }}>No products found</span>
              }
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 16 }}>
            {filtered.map(item => (
              <ProductCard
                key={item.id}
                item={item}
                onAddToCart={handleAddToCart}
                inCart={cart.some(c => c.id === item.id)}
              />
            ))}
          </div>
        </div>

        {/* ── Cart Sidebar ── */}
        <div style={{ width: 320, marginLeft: 20, flexShrink: 0, position: 'sticky', top: 80 }}>
          <div style={{ background: '#fff', borderRadius: 8, border: '1px solid #ddd', overflow: 'hidden' }}>
            {/* Cart Header */}
            <div style={{ background: '#232F3E', padding: '12px 16px', color: '#FFD814', fontWeight: 800, fontSize: 16 }}>
              🛒 Your Cart ({itemCount} items)
            </div>

            {cart.length === 0 ? (
              <div style={{ padding: 32, textAlign: 'center', color: '#888' }}>
                <div style={{ fontSize: 48, marginBottom: 8 }}>🛒</div>
                <div style={{ fontWeight: 600 }}>Your cart is empty</div>
                <div style={{ fontSize: 12, marginTop: 4 }}>Add items to get started</div>
              </div>
            ) : (
              <>
                {/* Cart Items */}
                <div style={{ maxHeight: 380, overflowY: 'auto', padding: 12 }}>
                  {cart.map(item => (
                    <div key={item.id} style={{ display: 'flex', gap: 10, marginBottom: 14, paddingBottom: 14, borderBottom: '1px solid #f0f0f0' }}>
                      {/* Item emoji */}
                      <div style={{ width: 44, height: 44, background: '#f5f5f5', borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, flexShrink: 0 }}>
                        {CATEGORY_ICONS[item.category] || '📦'}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 12, fontWeight: 600, color: '#0F1111', lineHeight: 1.3 }}>{item.name}</div>
                        {item.isOffer && <span style={{ fontSize: 10, background: '#cc0c39', color: '#fff', padding: '1px 5px', borderRadius: 3, fontWeight: 700 }}>AI DEAL</span>}
                        <div style={{ fontSize: 13, fontWeight: 700, color: '#0F1111', marginTop: 2 }}>₹{item.price}</div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 4 }}>
                          <button onClick={() => updateQty(item.id, -1)} style={{ width: 22, height: 22, border: '1px solid #ccc', background: '#f5f5f5', borderRadius: 3, cursor: 'pointer', fontWeight: 700 }}>−</button>
                          <span style={{ fontSize: 13, fontWeight: 700, minWidth: 18, textAlign: 'center' }}>{item.qty}</span>
                          <button onClick={() => updateQty(item.id, 1)} style={{ width: 22, height: 22, border: '1px solid #ccc', background: '#f5f5f5', borderRadius: 3, cursor: 'pointer', fontWeight: 700 }}>+</button>
                          <button onClick={() => removeItem(item.id)} style={{ background: 'none', border: 'none', color: '#cc0c39', cursor: 'pointer', fontSize: 12, padding: '0 4px', fontWeight: 600 }}>Delete</button>
                        </div>
                      </div>
                      <div style={{ fontSize: 13, fontWeight: 700, color: '#0F1111', flexShrink: 0 }}>₹{(item.price * item.qty)}</div>
                    </div>
                  ))}
                </div>

                {/* Cart Summary */}
                <div style={{ padding: '12px 16px', background: '#FAFAFA', borderTop: '1px solid #eee' }}>
                  {savings > 0 && (
                    <div style={{ color: '#cc0c39', fontSize: 12, fontWeight: 600, marginBottom: 4 }}>
                      💰 AI Deals saved you ₹{savings}!
                    </div>
                  )}
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 16, fontWeight: 700, marginBottom: 12 }}>
                    <span>Subtotal ({itemCount} items):</span>
                    <span>₹{subtotal.toFixed(2)}</span>
                  </div>
                  <div style={{ fontSize: 12, color: '#007600', marginBottom: 12 }}>✅ FREE Delivery on orders above ₹499</div>
                  <button onClick={handleCheckout} disabled={isCheckingOut}
                    style={{ width: '100%', padding: '12px 0', background: '#FFD814', border: 'none', borderRadius: 20, fontWeight: 800, fontSize: 15, cursor: 'pointer', color: '#111', marginBottom: 8 }}>
                    {isCheckingOut ? 'Processing...' : '⚡ Proceed to Checkout'}
                  </button>
                  <button style={{ width: '100%', padding: '10px 0', background: '#FFA41C', border: 'none', borderRadius: 20, fontWeight: 700, fontSize: 14, cursor: 'pointer', color: '#111' }}>
                    Buy Now
                  </button>
                </div>
              </>
            )}
          </div>

          {/* AI System Status */}
          <div style={{ background: '#fff', borderRadius: 8, border: '1px solid #ddd', marginTop: 12, padding: 14 }}>
            <div style={{ fontWeight: 700, fontSize: 13, color: '#232F3E', marginBottom: 8 }}>🤖 AI Engine Status</div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 4 }}>
              <span style={{ color: '#555' }}>ML Model</span>
              <span style={{ color: '#007600', fontWeight: 600 }}>● Active</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 4 }}>
              <span style={{ color: '#555' }}>Training Data</span>
              <span style={{ color: '#0066c0', fontWeight: 600 }}>1M+ rows</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 4 }}>
              <span style={{ color: '#555' }}>IoT Camera</span>
              <span style={{ color: isCameraActive ? '#007600' : '#cc0c39', fontWeight: 600 }}>
                {isCameraActive ? '● LIVE' : '○ Offline'}
              </span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12 }}>
              <span style={{ color: '#555' }}>Backend</span>
              <span style={{ color: '#007600', fontWeight: 600 }}>● EC2 Connected</span>
            </div>
          </div>
        </div>
      </div>

      {/* AI Offer Popup */}
      {showOffer && currentOffer && (
        <AiOfferPopup
          offer={currentOffer}
          onAccept={handleAcceptOffer}
          onDecline={() => setShowOffer(false)}
        />
      )}
    </div>
  );
}
