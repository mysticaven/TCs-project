import React, { useState, useEffect, useMemo } from 'react';

// ─── High-Quality Product Images with Proper Fallbacks ──────────────────────
const PREMIUM_IMAGES = {
  'Fruits': {
    url: 'https://images.unsplash.com/photo-1619546813926-a78fa6372cd2?auto=format&fit=crop&q=85&w=500&h=400',
    placeholder: '🍎'
  },
  'Vegetables': {
    url: 'https://images.unsplash.com/photo-1597362925123-77861d3fbac7?auto=format&fit=crop&q=85&w=500&h=400',
    placeholder: '🥬'
  },
  'Dairy': {
    url: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?auto=format&fit=crop&q=85&w=500&h=400',
    placeholder: '🥛'
  },
  'Meat': {
    url: 'https://images.unsplash.com/photo-1607623814075-e51df1bdc82f?auto=format&fit=crop&q=85&w=500&h=400',
    placeholder: '🥩'
  },
  'Frozen Food': {
    url: 'https://images.unsplash.com/photo-1563245372-f21724e3856d?auto=format&fit=crop&q=85&w=500&h=400',
    placeholder: '🧊'
  },
  'Drinks': {
    url: 'https://images.unsplash.com/photo-1527960656366-ee2a999e32e6?auto=format&fit=crop&q=85&w=500&h=400',
    placeholder: '🥤'
  },
  'Snacks & Beverages': {
    url: 'https://images.unsplash.com/photo-1534073828943-f801091bb18c?auto=format&fit=crop&q=85&w=500&h=400',
    placeholder: '🍿'
  },
  'Home & Kitchen': {
    url: 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&q=85&w=500&h=400',
    placeholder: '🍳'
  },
  'Personal Care': {
    url: 'https://images.unsplash.com/photo-1526947425960-945c6e72858f?auto=format&fit=crop&q=85&w=500&h=400',
    placeholder: '🧴'
  },
  'Clothing & Accessories': {
    url: 'https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?auto=format&fit=crop&q=85&w=500&h=400',
    placeholder: '👕'
  },
  'Office Supplies': {
    url: 'https://images.unsplash.com/photo-1586075010633-2470394e2344?auto=format&fit=crop&q=85&w=500&h=400',
    placeholder: '📝'
  },
  'Tools & Hardware': {
    url: 'https://images.unsplash.com/photo-1581147036324-c17ac41dfa6c?auto=format&fit=crop&q=85&w=500&h=400',
    placeholder: '🔧'
  },
  'Toys & Games': {
    url: 'https://images.unsplash.com/photo-1531525645387-7f14be1bdbbd?auto=format&fit=crop&q=85&w=500&h=400',
    placeholder: '🧩'
  },
  'Pets': {
    url: 'https://images.unsplash.com/photo-1516734212186-a967f81ad0d7?auto=format&fit=crop&q=85&w=500&h=400',
    placeholder: '🐾'
  }
};

const SPECIFIC_IMAGES = [
  { keywords: ['apple', 'apples'], url: 'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?auto=format&fit=crop&q=85&w=500&h=400', emoji: '🍎' },
  { keywords: ['banana', 'bananas'], url: 'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?auto=format&fit=crop&q=85&w=500&h=400', emoji: '🍌' },
  { keywords: ['orange', 'oranges'], url: 'https://images.unsplash.com/photo-1547514701-42782101795e?auto=format&fit=crop&q=85&w=500&h=400', emoji: '🍊' },
  { keywords: ['strawberry', 'strawberries'], url: 'https://images.unsplash.com/photo-1464965911861-746a04b4bca6?auto=format&fit=crop&q=85&w=500&h=400', emoji: '🍓' },
  { keywords: ['milk'], url: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?auto=format&fit=crop&q=85&w=500&h=400', emoji: '🥛' },
  { keywords: ['egg', 'eggs'], url: 'https://images.unsplash.com/photo-1506976785307-8732e854ad03?auto=format&fit=crop&q=85&w=500&h=400', emoji: '🥚' },
  { keywords: ['bread', 'bakery'], url: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&q=85&w=500&h=400', emoji: '🍞' },
  { keywords: ['cheese', 'cheddar'], url: 'https://images.unsplash.com/photo-1486299267070-83823f5448dd?auto=format&fit=crop&q=85&w=500&h=400', emoji: '🧀' },
  { keywords: ['beef', 'steak'], url: 'https://images.unsplash.com/photo-1603048588665-791ca8aea617?auto=format&fit=crop&q=85&w=500&h=400', emoji: '🥩' },
  { keywords: ['chicken', 'poultry'], url: 'https://images.unsplash.com/photo-1604503468506-a8da13d82791?auto=format&fit=crop&q=85&w=500&h=400', emoji: '🍗' },
  { keywords: ['salmon', 'fish'], url: 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?auto=format&fit=crop&q=85&w=500&h=400', emoji: '🐟' },
  { keywords: ['pizza'], url: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&q=85&w=500&h=400', emoji: '🍕' },
  { keywords: ['ice cream', 'dessert'], url: 'https://images.unsplash.com/photo-1497034825429-c343d7c6a68f?auto=format&fit=crop&q=85&w=500&h=400', emoji: '🍦' },
  { keywords: ['cola', 'soda', 'coke'], url: 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?auto=format&fit=crop&q=85&w=500&h=400', emoji: '🥤' },
  { keywords: ['coffee'], url: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&q=85&w=500&h=400', emoji: '☕' },
  { keywords: ['tomato', 'tomatoes'], url: 'https://images.unsplash.com/photo-1595855759920-86582396756a?auto=format&fit=crop&q=85&w=500&h=400', emoji: '🍅' },
  { keywords: ['potato', 'potatoes'], url: 'https://images.unsplash.com/photo-1518977676601-b53f82aba655?auto=format&fit=crop&q=85&w=500&h=400', emoji: '🥔' },
  { keywords: ['onion', 'onions'], url: 'https://images.unsplash.com/photo-1580191947416-62d35a55e71d?auto=format&fit=crop&q=85&w=500&h=400', emoji: '🧅' },
];

const GET_IMAGE = (name = '', category = 'Groceries') => {
  const lowercaseName = name.toLowerCase();

  for (const item of SPECIFIC_IMAGES) {
    if (item.keywords.some(k => lowercaseName.includes(k))) {
      return { url: item.url, emoji: item.emoji };
    }
  }

  const categoryData = PREMIUM_IMAGES[category];
  return categoryData || {
    url: 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=85&w=500&h=400',
    emoji: '📦'
  };
};

// ─── Color Palette ────────────────────────────────────────────────────────
const COLORS = {
  primary: '#2563EB',      // Vivid Blue
  accent: '#F59E0B',       // Warm Amber
  success: '#10B981',      // Fresh Green
  danger: '#EF4444',       // Bright Red
  background: '#F9FAFB',   // Clean Off-white
  cardBg: '#FFFFFF',
  text: '#111827',
  textSecondary: '#6B7280',
  border: '#E5E7EB'
};

// ─── Image Loading Component ──────────────────────────────────────────────
function ImageWithFallback({ url, emoji, alt, className }) {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%', overflow: 'hidden', background: '#F3F4F6' }}>
      {!imageError && (
        <img
          src={url}
          alt={alt}
          onLoad={() => setImageLoaded(true)}
          onError={() => setImageError(true)}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            objectPosition: 'center',
            opacity: imageLoaded ? 1 : 0.3,
            transition: 'opacity 0.3s ease-in-out',
            filter: imageLoaded ? 'none' : 'blur(4px)'
          }}
          loading="lazy"
        />
      )}

      {/* Fallback Emoji Overlay */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: imageLoaded && !imageError ? '32px' : '56px',
          background: imageLoaded && !imageError ? 'transparent' : 'rgba(243, 244, 246, 0.8)',
          backdropFilter: 'blur(2px)',
          opacity: imageLoaded && !imageError ? 0.4 : 1,
          transition: 'all 0.3s ease-in-out'
        }}
      >
        {emoji}
      </div>
    </div>
  );
}

// ─── AI Deal Modal ────────────────────────────────────────────────────────
function AiDealModal({ coupon, products, onAccept, onDecline }) {
  const [secs, setSecs] = useState(15);

  useEffect(() => {
    const t = setInterval(() => setSecs(s => {
      if (s <= 1) { clearInterval(t); onDecline(); return 0; }
      return s - 1;
    }), 1000);
    return () => clearInterval(t);
  }, [onDecline]);

  const prod = products.find(p => p.name === coupon.recommendation);
  const imageData = prod ? GET_IMAGE(prod.name, prod.category) : { emoji: '📦', url: '' };

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      background: 'rgba(17, 24, 39, 0.88)', backdropFilter: 'blur(12px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 10000, animation: 'fadeIn 0.3s ease-out'
    }}>
      <div style={{
        width: '90%', maxWidth: 480, background: COLORS.cardBg, borderRadius: 24,
        overflow: 'hidden', boxShadow: '0 25px 50px rgba(0,0,0,0.35)',
        animation: 'popIn 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
      }}>
        {/* Header with gradient */}
        <div style={{
          background: `linear-gradient(135deg, ${COLORS.primary} 0%, ${COLORS.accent} 100%)`,
          padding: '32px 28px',
          color: '#FFFFFF',
          textAlign: 'center'
        }}>
          <div style={{
            display: 'inline-block',
            background: 'rgba(255, 255, 255, 0.2)',
            padding: '6px 16px',
            borderRadius: 100,
            color: '#FEF3C7',
            fontSize: 11,
            fontWeight: 900,
            marginBottom: 12,
            letterSpacing: '1.2px',
            backdropFilter: 'blur(10px)'
          }}>
            ⚡ AI SMART RECOMMENDATION
          </div>
          <h2 style={{ margin: 0, fontSize: 28, fontWeight: 900, letterSpacing: '-0.8px' }}>
            Smart Deal Found!
          </h2>
          <p style={{ margin: '8px 0 0', opacity: 0.9, fontSize: 14, fontWeight: 500 }}>
            Dynamically matched to your basket
          </p>
        </div>

        <div style={{ padding: 32 }}>
          {prod && (
            <div style={{
              background: '#F9FAFB',
              borderRadius: 18,
              padding: 20,
              marginBottom: 24,
              border: `1px solid ${COLORS.border}`,
              display: 'flex',
              gap: 18,
              alignItems: 'center'
            }}>
              {/* Product Image */}
              <div style={{
                width: 100,
                height: 100,
                background: COLORS.cardBg,
                borderRadius: 14,
                flexShrink: 0,
                border: `2px solid ${COLORS.primary}`,
                boxShadow: '0 4px 12px rgba(37, 99, 235, 0.1)'
              }}>
                <ImageWithFallback
                  url={imageData.url}
                  emoji={imageData.emoji}
                  alt={prod.name}
                />
              </div>

              {/* Product Details */}
              <div style={{ flex: 1 }}>
                <div style={{
                  fontSize: 11,
                  color: COLORS.textSecondary,
                  fontWeight: 900,
                  textTransform: 'uppercase',
                  letterSpacing: '1px',
                  marginBottom: 6
                }}>
                  {prod.category}
                </div>
                <div style={{
                  fontSize: 18,
                  fontWeight: 900,
                  color: COLORS.text,
                  marginBottom: 10,
                  lineHeight: 1.3
                }}>
                  {prod.name}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <span style={{
                    textDecoration: 'line-through',
                    color: COLORS.textSecondary,
                    fontSize: 15
                  }}>
                    ₹{(prod.price * 1.15).toFixed(0)}
                  </span>
                  <span style={{
                    color: COLORS.danger,
                    fontWeight: 900,
                    fontSize: 24,
                    letterSpacing: '-0.5px'
                  }}>
                    ₹{coupon.discount_price}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Message */}
          <div style={{
            background: '#ECFDF5',
            color: '#065F46',
            padding: '18px 16px',
            borderRadius: 16,
            fontSize: 14,
            fontWeight: 600,
            lineHeight: 1.5,
            marginBottom: 28,
            border: `1px solid ${COLORS.success}20`,
            borderLeft: `4px solid ${COLORS.success}`
          }}>
            💡 {coupon.message}
          </div>

          {/* Buttons */}
          <div style={{ display: 'flex', gap: 14, marginBottom: 20 }}>
            <button
              onClick={onDecline}
              style={{
                flex: 1,
                padding: '14px 0',
                background: '#F3F4F6',
                border: 'none',
                borderRadius: 12,
                cursor: 'pointer',
                fontWeight: 800,
                color: COLORS.textSecondary,
                fontSize: 14,
                transition: 'all 0.2s ease',
                ':hover': { background: '#E5E7EB' }
              }}
              onMouseEnter={(e) => e.target.style.background = '#E5E7EB'}
              onMouseLeave={(e) => e.target.style.background = '#F3F4F6'}
            >
              Not Now
            </button>
            <button
              onClick={() => onAccept(prod, coupon.discount_price)}
              style={{
                flex: 1.4,
                padding: '14px 0',
                background: `linear-gradient(135deg, ${COLORS.primary}, ${COLORS.accent})`,
                border: 'none',
                borderRadius: 12,
                cursor: 'pointer',
                fontWeight: 900,
                fontSize: 15,
                color: '#FFFFFF',
                boxShadow: `0 12px 24px ${COLORS.primary}30`,
                transition: 'all 0.2s ease'
              }}
            >
              Add & Proceed
            </button>
          </div>

          <div style={{
            textAlign: 'center',
            fontSize: 12,
            color: COLORS.textSecondary,
            fontWeight: 600
          }}>
            This offer expires in <span style={{ color: COLORS.danger, fontWeight: 900 }}>{secs}s</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Enhanced Product Card ────────────────────────────────────────────────
function ProductCard({ item, onAdd, inCart }) {
  const [adding, setAdding] = useState(false);
  const imageData = GET_IMAGE(item.name, item.category);

  const handleAdd = (e) => {
    e.stopPropagation();
    setAdding(true);
    onAdd(item);
    setTimeout(() => setAdding(false), 600);
  };

  return (
    <div
      style={{
        background: COLORS.cardBg,
        borderRadius: 18,
        border: `1px solid ${COLORS.border}`,
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        cursor: 'pointer',
        position: 'relative',
        ':hover': {
          transform: 'translateY(-4px)',
          boxShadow: '0 12px 24px rgba(0,0,0,0.08)'
        }
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-4px)';
        e.currentTarget.style.boxShadow = '0 12px 24px rgba(0,0,0,0.08)';
        e.currentTarget.style.borderColor = COLORS.primary;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.04)';
        e.currentTarget.style.borderColor = COLORS.border;
      }}
    >
      {/* Discount Badge */}
      {item.discount > 0 && (
        <div style={{
          position: 'absolute',
          top: 12,
          left: 12,
          zIndex: 10,
          background: COLORS.danger,
          color: '#FFFFFF',
          fontSize: 11,
          fontWeight: 900,
          padding: '6px 12px',
          borderRadius: 8,
          boxShadow: `0 6px 16px ${COLORS.danger}40`
        }}>
          -{Math.round(item.discount)}%
        </div>
      )}

      {/* Image Container */}
      <div style={{
        height: 180,
        position: 'relative',
        background: '#F3F4F6',
        overflow: 'hidden'
      }}>
        <ImageWithFallback
          url={imageData.url}
          emoji={imageData.emoji}
          alt={item.name}
        />
      </div>

      {/* Content Section */}
      <div style={{
        padding: '18px 16px',
        flex: 1,
        display: 'flex',
        flexDirection: 'column'
      }}>
        {/* Category Label */}
        <div style={{
          fontSize: 10,
          color: COLORS.primary,
          fontWeight: 900,
          textTransform: 'uppercase',
          letterSpacing: '0.8px',
          marginBottom: 6
        }}>
          {item.category}
        </div>

        {/* Product Name */}
        <h3 style={{
          fontSize: 15,
          fontWeight: 900,
          color: COLORS.text,
          margin: '0 0 12px',
          lineHeight: 1.3,
          minHeight: 42
        }}>
          {item.name}
        </h3>

        {/* Price Section */}
        <div style={{ marginTop: 'auto' }}>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 8 }}>
            <span style={{
              fontSize: 24,
              fontWeight: 900,
              color: COLORS.text,
              letterSpacing: '-0.5px'
            }}>
              ₹{Math.floor(item.price)}
            </span>
            {item.discount > 0 && (
              <span style={{
                fontSize: 12,
                color: COLORS.textSecondary,
                textDecoration: 'line-through'
              }}>
                ₹{(item.price * (1 + item.discount / 100)).toFixed(0)}
              </span>
            )}
          </div>

          {/* Add Button */}
          <button
            onClick={handleAdd}
            disabled={adding}
            style={{
              width: '100%',
              padding: '11px 0',
              borderRadius: 10,
              border: 'none',
              cursor: 'pointer',
              background: adding ? COLORS.success : inCart ? COLORS.accent : COLORS.primary,
              color: '#FFFFFF',
              fontWeight: 900,
              fontSize: 13,
              boxShadow: `0 6px 16px ${adding ? COLORS.success : inCart ? COLORS.accent : COLORS.primary}30`,
              transition: 'all 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 6
            }}
          >
            {adding ? '✓ Added' : inCart ? '+ Add' : 'Add to Basket'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main Checkout Component ──────────────────────────────────────────────
export default function UserCheckout() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cart, setCart] = useState([]);
  const [coupon, setCoupon] = useState(null);

  // Filters
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [priceRange, setPriceRange] = useState(1000);
  const [filterDiscountOnly, setFilterDiscountOnly] = useState(false);

  const [orderDone, setOrderDone] = useState(false);
  const [checkingDeals, setCheckingDeals] = useState(false);
  const [purchaseSuggestion, setPurchaseSuggestion] = useState(null);

  // Fetch products
  useEffect(() => {
    fetch('/api/products?limit=200')
      .then(r => r.json())
      .then(data => {
        const valid = (Array.isArray(data.products) ? data.products : [])
          .filter(p => p.name && isNaN(p.name));
        setProducts(valid);
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

  const updateQty = (id, delta) => setCart(prev =>
    prev.map(i => i.id === id ? { ...i, qty: Math.max(1, i.qty + delta) } : i)
  );

  const removeItem = (id) => setCart(prev => prev.filter(i => i.id !== id));

  // Calculations
  const subtotal = cart.reduce((s, i) => s + i.price * i.qty, 0);
  const itemCount = cart.reduce((s, i) => s + i.qty, 0);
  const totalMRP = cart.reduce((s, i) => s + (i.price * (1 + (i.discount || 0) / 100)) * i.qty, 0);
  const savings = totalMRP - subtotal;

  // Filter products
  const filtered = useMemo(() => {
    return products.filter(p => {
      if (selectedCategory !== 'All' && p.category !== selectedCategory) return false;
      if (search && !p.name.toLowerCase().includes(search.toLowerCase())) return false;
      if (p.price > priceRange) return false;
      if (filterDiscountOnly && p.discount === 0) return false;
      return true;
    });
  }, [products, search, selectedCategory, priceRange, filterDiscountOnly]);

  const categories = ['All', ...new Set(products.map(p => p.category))];

  const startCheckout = async () => {
    if (cart.length === 0) return;
    setCheckingDeals(true);

    try {
      // Get ML coupon before marking order done
      const res = await fetch('/api/coupon', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cart: cart.map(i => i.name) })
      });
      const data = await res.json();
      if (data.coupon) setCoupon(data.coupon); // show the AI modal

      // Save transaction to DB
      await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cart,
          coupon_shown: data.coupon?.recommendation || null,
          coupon_accepted: false
        })
      }).catch(() => {});
    } catch (e) { }

    setCheckingDeals(false);
    setOrderDone(true);
  };

  // Order Complete Screen
  if (orderDone) {
    return (
      <div style={{
        minHeight: '100vh',
        background: COLORS.background,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20,
        fontFamily: 'system-ui, -apple-system, sans-serif'
      }}>
        <div style={{
          background: COLORS.cardBg,
          borderRadius: 28,
          padding: 52,
          textAlign: 'center',
          maxWidth: 520,
          boxShadow: '0 25px 50px rgba(0,0,0,0.08)',
          border: `1px solid ${COLORS.border}`
        }}>
          <div style={{ fontSize: 72, marginBottom: 20 }}>✅</div>
          <h1 style={{
            color: COLORS.text,
            margin: '0 0 8px',
            fontSize: 32,
            fontWeight: 900,
            letterSpacing: '-0.8px'
          }}>
            Order Complete!
          </h1>
          <p style={{ color: COLORS.textSecondary, fontSize: 15 }}>
            Your purchase has been processed and inventory updated.
          </p>

          <div style={{
            background: COLORS.background,
            borderRadius: 18,
            padding: 28,
            margin: '28px 0',
            border: `2px dashed ${COLORS.border}`
          }}>
            <div style={{
              color: COLORS.textSecondary,
              fontSize: 13,
              fontWeight: 700,
              textTransform: 'uppercase',
              marginBottom: 8,
              letterSpacing: '0.8px'
            }}>
              Total Paid
            </div>
            <div style={{
              fontWeight: 900,
              fontSize: 42,
              color: COLORS.primary,
              letterSpacing: '-1px'
            }}>
              ₹{subtotal.toFixed(2)}
            </div>
            {savings > 0 && (
              <div style={{
                fontSize: 14,
                color: COLORS.success,
                fontWeight: 700,
                marginTop: 8
              }}>
                You saved ₹{savings.toFixed(0)}
              </div>
            )}
          </div>

          <button
            onClick={() => {
              setOrderDone(false);
              setCart([]);
              setPurchaseSuggestion(null);
            }}
            style={{
              width: '100%',
              background: COLORS.primary,
              color: '#FFFFFF',
              border: 'none',
              borderRadius: 12,
              padding: '16px',
              fontWeight: 900,
              fontSize: 16,
              cursor: 'pointer',
              boxShadow: `0 8px 20px ${COLORS.primary}30`,
              transition: 'all 0.2s'
            }}
          >
            Start New Basket
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: COLORS.background,
      fontFamily: 'system-ui, -apple-system, sans-serif',
      padding: '0 0 60px'
    }}>
      <style>{`
        @keyframes fadeIn { from { opacity: 0 } to { opacity: 1 } }
        @keyframes popIn { 
          from { transform: scale(0.95); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
        * { box-sizing: border-box; }
      `}</style>

      {/* Header/Search Bar */}
      <div style={{
        background: COLORS.cardBg,
        borderBottom: `1px solid ${COLORS.border}`,
        position: 'sticky',
        top: 0,
        zIndex: 99,
        padding: '16px 24px'
      }}>
        <div style={{
          maxWidth: 1400,
          margin: '0 auto',
          display: 'flex',
          gap: 16,
          alignItems: 'center',
          flexWrap: 'wrap'
        }}>
          {/* Category Select */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            style={{
              padding: '10px 14px',
              background: COLORS.background,
              border: `1px solid ${COLORS.border}`,
              borderRadius: 10,
              fontSize: 13,
              fontWeight: 700,
              cursor: 'pointer',
              color: COLORS.text
            }}
          >
            {categories.map(c => <option key={c}>{c}</option>)}
          </select>

          {/* Search Input */}
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search products..."
            style={{
              flex: 1,
              minWidth: 200,
              padding: '10px 16px',
              border: `1px solid ${COLORS.border}`,
              borderRadius: 10,
              fontSize: 14,
              outline: 'none',
              fontWeight: 500,
              color: COLORS.text
            }}
          />
        </div>
      </div>

      {/* Main Content */}
      <div style={{
        display: 'flex',
        gap: 28,
        maxWidth: 1400,
        margin: '28px auto',
        padding: '0 24px',
        alignItems: 'flex-start'
      }}>
        {/* Filters Sidebar */}
        <div style={{
          width: 240,
          background: COLORS.cardBg,
          borderRadius: 18,
          padding: 24,
          border: `1px solid ${COLORS.border}`,
          flexShrink: 0,
          position: 'sticky',
          top: 100
        }}>
          <h4 style={{
            margin: '0 0 16px',
            fontSize: 15,
            fontWeight: 900,
            color: COLORS.text
          }}>
            Filters
          </h4>

          {/* Price Slider */}
          <div style={{ marginBottom: 24 }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              fontSize: 12,
              fontWeight: 800,
              color: COLORS.textSecondary,
              marginBottom: 8
            }}>
              <span>Max Price</span>
              <span style={{ color: COLORS.primary }}>₹{priceRange}</span>
            </div>
            <input
              type="range"
              min={1}
              max={1000}
              step={10}
              value={priceRange}
              onChange={(e) => setPriceRange(parseFloat(e.target.value))}
              style={{
                width: '100%',
                accentColor: COLORS.primary,
                cursor: 'pointer'
              }}
            />
          </div>

          {/* Discount Toggle */}
          <div
            onClick={() => setFilterDiscountOnly(!filterDiscountOnly)}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '12px',
              background: filterDiscountOnly ? `${COLORS.primary}10` : COLORS.background,
              borderRadius: 10,
              border: `1px solid ${filterDiscountOnly ? COLORS.primary : COLORS.border}`,
              cursor: 'pointer'
            }}
          >
            <span style={{ fontWeight: 800, fontSize: 13, color: COLORS.text }}>
              On Sale Only
            </span>
            <div style={{
              width: 18,
              height: 18,
              borderRadius: 4,
              background: filterDiscountOnly ? COLORS.primary : COLORS.background,
              border: `1px solid ${COLORS.border}`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#FFFFFF',
              fontSize: 11,
              fontWeight: 900
            }}>
              {filterDiscountOnly ? '✓' : ''}
            </div>
          </div>
        </div>

        {/* Products Grid */}
        <div style={{ flex: 1 }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 24
          }}>
            <h3 style={{
              margin: 0,
              fontSize: 22,
              fontWeight: 900,
              color: COLORS.text
            }}>
              {selectedCategory === 'All' ? 'All Products' : selectedCategory}
            </h3>
            <div style={{
              fontSize: 14,
              color: COLORS.textSecondary,
              fontWeight: 700
            }}>
              {filtered.length} items
            </div>
          </div>

          {loading ? (
            <div style={{ textAlign: 'center', padding: '100px 0' }}>
              <p style={{ color: COLORS.textSecondary, fontWeight: 600 }}>
                Loading products...
              </p>
            </div>
          ) : filtered.length === 0 ? (
            <div style={{
              textAlign: 'center',
              padding: '80px 20px',
              background: COLORS.cardBg,
              borderRadius: 18,
              border: `1px solid ${COLORS.border}`
            }}>
              <div style={{ fontSize: 48, marginBottom: 12 }}>🔍</div>
              <h4 style={{
                margin: 0,
                fontSize: 16,
                fontWeight: 900,
                color: COLORS.text
              }}>
                No products found
              </h4>
              <p style={{
                color: COLORS.textSecondary,
                fontSize: 14,
                marginTop: 8
              }}>
                Try adjusting your filters
              </p>
            </div>
          ) : (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
              gap: 20
            }}>
              {filtered.map(item => (
                <ProductCard
                  key={item.id}
                  item={item}
                  onAdd={handleAdd}
                  inCart={cart.some(c => c.id === item.id)}
                />
              ))}
            </div>
          )}
        </div>

        {/* Shopping Cart Sidebar */}
        <div style={{
          width: 340,
          flexShrink: 0,
          position: 'sticky',
          top: 100
        }}>
          <div style={{
            background: COLORS.cardBg,
            borderRadius: 18,
            border: `1px solid ${COLORS.border}`,
            boxShadow: '0 4px 16px rgba(0,0,0,0.05)',
            overflow: 'hidden'
          }}>
            {/* Cart Header */}
            <div style={{
              background: `linear-gradient(135deg, ${COLORS.primary}, ${COLORS.accent})`,
              padding: '20px 24px',
              color: '#FFFFFF',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <span style={{ fontWeight: 900, fontSize: 16 }}>Basket</span>
              <span style={{
                background: 'rgba(255, 255, 255, 0.25)',
                padding: '4px 12px',
                borderRadius: 100,
                fontSize: 12,
                fontWeight: 800
              }}>
                {itemCount} items
              </span>
            </div>

            {cart.length === 0 ? (
              <div style={{
                padding: 52,
                textAlign: 'center',
                color: COLORS.textSecondary
              }}>
                <div style={{ fontSize: 56, marginBottom: 16, opacity: 0.3 }}>🛒</div>
                <div style={{
                  fontWeight: 800,
                  fontSize: 15,
                  color: COLORS.text,
                  marginBottom: 8
                }}>
                  Your basket is empty
                </div>
                <p style={{
                  fontSize: 13,
                  margin: 0,
                  color: COLORS.textSecondary
                }}>
                  Add items to get started
                </p>
              </div>
            ) : (
              <div style={{ padding: 20 }}>
                {/* Cart Items */}
                <div style={{
                  maxHeight: 300,
                  overflowY: 'auto',
                  marginBottom: 20
                }}>
                  {cart.map(item => (
                    <div
                      key={item.id}
                      style={{
                        display: 'flex',
                        gap: 12,
                        marginBottom: 16,
                        paddingBottom: 16,
                        borderBottom: `1px solid ${COLORS.border}`
                      }}
                    >
                      <div style={{
                        width: 50,
                        height: 50,
                        background: COLORS.background,
                        borderRadius: 10,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: 24,
                        flexShrink: 0,
                        border: `1px solid ${COLORS.border}`
                      }}>
                        {GET_IMAGE(item.name, item.category).emoji}
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{
                          fontSize: 13,
                          fontWeight: 800,
                          color: COLORS.text,
                          marginBottom: 4
                        }}>
                          {item.name}
                        </div>
                        <div style={{
                          fontSize: 13,
                          fontWeight: 900,
                          color: COLORS.primary,
                          marginBottom: 8
                        }}>
                          ₹{item.price}
                        </div>
                        <div style={{
                          display: 'flex',
                          gap: 8,
                          alignItems: 'center'
                        }}>
                          <div style={{
                            display: 'flex',
                            background: COLORS.background,
                            borderRadius: 8,
                            overflow: 'hidden'
                          }}>
                            <button
                              onClick={() => updateQty(item.id, -1)}
                              style={{
                                width: 28,
                                height: 28,
                                border: 'none',
                                background: 'none',
                                cursor: 'pointer',
                                fontSize: 16,
                                color: COLORS.textSecondary,
                                fontWeight: 'bold'
                              }}
                            >
                              −
                            </button>
                            <span style={{
                              width: 28,
                              textAlign: 'center',
                              lineHeight: '28px',
                              fontSize: 12,
                              fontWeight: 800,
                              color: COLORS.text,
                              borderLeft: `1px solid ${COLORS.border}`,
                              borderRight: `1px solid ${COLORS.border}`
                            }}>
                              {item.qty}
                            </span>
                            <button
                              onClick={() => updateQty(item.id, 1)}
                              style={{
                                width: 28,
                                height: 28,
                                border: 'none',
                                background: 'none',
                                cursor: 'pointer',
                                fontSize: 16,
                                color: COLORS.textSecondary,
                                fontWeight: 'bold'
                              }}
                            >
                              +
                            </button>
                          </div>
                          <button
                            onClick={() => removeItem(item.id)}
                            style={{
                              marginLeft: 'auto',
                              background: 'none',
                              border: 'none',
                              color: COLORS.danger,
                              fontSize: 12,
                              cursor: 'pointer',
                              fontWeight: 800
                            }}
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Totals */}
                <div style={{
                  borderTop: `2px solid ${COLORS.border}`,
                  paddingTop: 16
                }}>
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    marginBottom: 8,
                    fontSize: 13,
                    color: COLORS.textSecondary,
                    fontWeight: 600
                  }}>
                    <span>Subtotal:</span>
                    <span>₹{subtotal.toFixed(0)}</span>
                  </div>
                  {savings > 0 && (
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      marginBottom: 12,
                      fontSize: 13,
                      color: COLORS.success,
                      fontWeight: 700
                    }}>
                      <span>Savings:</span>
                      <span>-₹{savings.toFixed(0)}</span>
                    </div>
                  )}

                  {/* Checkout Button */}
                  <button
                    onClick={startCheckout}
                    disabled={checkingDeals}
                    style={{
                      width: '100%',
                      padding: '14px',
                      marginTop: 16,
                      background: checkingDeals
                        ? COLORS.textSecondary
                        : `linear-gradient(135deg, ${COLORS.primary}, ${COLORS.accent})`,
                      border: 'none',
                      borderRadius: 12,
                      fontWeight: 900,
                      fontSize: 15,
                      cursor: checkingDeals ? 'not-allowed' : 'pointer',
                      color: '#FFFFFF',
                      boxShadow: `0 8px 20px ${COLORS.primary}30`,
                      transition: 'all 0.2s'
                    }}
                  >
                    {checkingDeals ? 'Processing...' : 'Checkout'}
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
          onAccept={(prod, price) => {
            setCart(prev => [...prev, { ...prod, qty: 1, price }]);
            setCoupon(null);
          }}
          onDecline={() => setCoupon(null)}
        />
      )}
    </div>
  );
}