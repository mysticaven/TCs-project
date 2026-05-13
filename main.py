from fastapi import FastAPI, HTTPException
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from pydantic import BaseModel
from sqlalchemy import create_engine, Column, Integer, String, Float, DateTime, Text, Date
from sqlalchemy.orm import DeclarativeBase, sessionmaker
from contextlib import asynccontextmanager
from typing import Optional
import json, os, csv
from datetime import datetime, date, timedelta

# ─── Database Setup ─────────────────────────────────────────────────────────
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./smartai.db")
engine = create_engine(
    DATABASE_URL,
    connect_args={"check_same_thread": False} if "sqlite" in DATABASE_URL else {}
)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

class Base(DeclarativeBase):
    pass

class Product(Base):
    __tablename__ = "products"
    id         = Column(Integer, primary_key=True, index=True)
    name       = Column(String(200), unique=True, index=True)
    category   = Column(String(100))
    price      = Column(Float)
    stock      = Column(Integer, default=100)
    expiry_date = Column(Date, nullable=True)   # None = non-perishable
    image_emoji = Column(String(10), default="📦")

class Transaction(Base):
    __tablename__ = "transactions"
    id              = Column(Integer, primary_key=True, index=True)
    session_id      = Column(String(100))
    cart_items      = Column(Text)
    coupon_shown    = Column(String(200), nullable=True)
    coupon_accepted = Column(Integer, default=0)
    total           = Column(Float, default=0.0)
    created_at      = Column(DateTime, default=datetime.utcnow)

# ─── Emoji map ───────────────────────────────────────────────────────────────
CATEGORY_EMOJI = {
    'Electronics': '💻', 'Groceries': '🛒', 'Snacks & Beverages': '🍫',
    'Home & Kitchen': '🏠', 'Personal Care': '🧴', 'Clothing & Accessories': '👕',
    'Office Supplies': '📎', 'Tools & Hardware': '🔧', 'Toys & Games': '🎮', 'Pets': '🐾'
}
ITEM_EMOJI = {
    'Laptop': '💻', 'Wireless Mouse': '🖱️', 'DSLR Camera': '📷', 'SD Card': '💾',
    'Smartphone': '📱', 'Smartwatch': '⌚', 'Wireless Earbuds': '🎧',
    'Bluetooth Speaker': '🔊', '4K TV': '📺', 'Gaming Console': '🎮',
    'Gaming Mouse': '🖱️', 'Router': '📡', 'Tablet': '📱', 'External SSD': '💾',
    'VR Headset': '🥽', 'Webcam': '📸', 'Microphone': '🎙️', 'Flash Drive': '💾',
    'Power Bank': '🔋', 'Soundbar': '🔊',
    'Milk': '🥛', 'Eggs': '🥚', 'Bread': '🍞', 'Butter': '🧈', 'Cheese': '🧀',
    'Yogurt': '🥛', 'Chicken Breast': '🍗', 'Ground Beef': '🥩', 'Salmon': '🐟',
    'Apples': '🍎', 'Bananas': '🍌', 'Oranges': '🍊', 'Spinach': '🥬',
    'Tomatoes': '🍅', 'Onions': '🧅', 'Potatoes': '🥔', 'Rice': '🍚',
    'Pasta': '🍝', 'Tomato Sauce': '🥫', 'Olive Oil': '🫙',
    'Potato Chips': '🥔', 'Tortilla Chips': '🌽', 'Salsa': '🫙', 'Popcorn': '🍿',
    'Chocolate Bar': '🍫', 'Gummy Bears': '🐻', 'Cookies': '🍪', 'Crackers': '🍘',
    'Cola': '🥤', 'Diet Cola': '🥤', 'Orange Juice': '🍊', 'Apple Juice': '🍎',
    'Bottled Water': '💧', 'Sparkling Water': '💧', 'Energy Drink': '⚡',
    'Coffee Beans': '☕', 'Tea Bags': '🍵', 'Beer (6-pack)': '🍺',
    'Red Wine': '🍷', 'White Wine': '🍾',
    'Blender': '🥤', 'Coffee Maker': '☕', 'Toaster': '🍞', 'Microwave': '📦',
    'Air Fryer': '🍳', 'Frying Pan': '🍳', 'Saucepan': '🥘', 'Knife Set': '🔪',
    'Cutting Board': '🔪', 'Mop': '🧹', 'Broom': '🧹', 'Dish Soap': '🧴',
    'Shampoo': '🧴', 'Conditioner': '🧴', 'Body Wash': '🧴', 'Toothpaste': '🦷',
    'Toothbrush': '🪥', 'Deodorant': '🧴', 'Razors': '🪒', 'Sunscreen': '🌞',
    'Hammer': '🔨', 'Drill': '🔩', 'Screwdriver Set': '🔧', 'Nails': '📌',
    'Flashlight': '🔦', 'Batteries (AA)': '🔋', 'Batteries (AAA)': '🔋',
    'Dog Food': '🐕', 'Cat Food': '🐈', 'Dog Treats': '🦴', 'Cat Treats': '🐟',
    'Dog Toy': '🎾', 'Cat Toy': '🐠', 'Leash': '🐕', 'Cat Litter': '🪣',
    'Lego Set': '🧱', 'Action Figure': '🦸', 'Doll': '🪆', 'Board Game': '🎲',
    'Soccer Ball': '⚽', 'Basketball': '🏀', 'Football': '🏈',
    'T-Shirt': '👕', 'Jeans': '👖', 'Sneakers': '👟', 'Dress Shoes': '👞',
    'Socks': '🧦', 'Hat': '🧢', 'Sunglasses': '🕶️', 'Watch': '⌚', 'Backpack': '🎒',
    'Notebook': '📓', 'Pens': '✏️', 'Pencils': '✏️', 'Stapler': '📌',
}

def get_emoji(name, category):
    return ITEM_EMOJI.get(name) or CATEGORY_EMOJI.get(category) or '📦'

# ─── ML Rules ────────────────────────────────────────────────────────────────
ML_RULES = []

def load_ml_rules():
    rules_path = os.path.join(os.path.dirname(__file__), "ml_models", "massive_trained_rules.csv")
    if not os.path.exists(rules_path):
        print("[WARN] ML rules CSV not found. Run: python ml_models/train_on_massive.py")
        return
    with open(rules_path, "r") as f:
        reader = csv.reader(f)
        next(reader)
        for row in reader:
            if len(row) < 7: continue
            ant_raw = row[0].strip().strip('"')
            con_raw = row[1].strip().strip('"')
            try:
                confidence = float(row[5])
                lift = float(row[6])
            except (ValueError, IndexError):
                continue
            if lift > 1.0:
                ML_RULES.append({
                    "antecedents": [a.strip() for a in ant_raw.split(",")],
                    "consequents": [c.strip() for c in con_raw.split(",")],
                    "confidence": confidence,
                    "lift": lift
                })
    ML_RULES.sort(key=lambda r: r["lift"], reverse=True)
    print(f"[OK] Loaded {len(ML_RULES)} ML rules")

def find_coupon(cart_names: list[str], expiry_override: str = None) -> Optional[dict]:
    """
    Find best coupon:
    1. If expiry_override is given (from manager marking product near-expiry),
       force that product as the recommendation.
    2. Otherwise use market basket association rules.
    """
    with SessionLocal() as db:
        # --- Expiry-based: push near-expiry products as coupons ---
        if expiry_override:
            prod = db.query(Product).filter(Product.name.ilike(expiry_override)).first()
            if prod:
                days = (prod.expiry_date - date.today()).days if prod.expiry_date else 999
                discount_pct = min(70, max(20, 70 - days * 10))  # closer = bigger discount
                return {
                    "recommendation": prod.name,
                    "trigger_items": ["expiry-push"],
                    "discount_text": f"{discount_pct}% OFF",
                    "discount_price": round(prod.price * (1 - discount_pct / 100), 2),
                    "original_price": prod.price,
                    "confidence": 99,
                    "lift": 9.9,
                    "message": f"Sell before expiry! {prod.name} expires in {days} day(s). Get {discount_pct}% off now!",
                    "expiry_push": True
                }

        # --- MBA-based: match cart to trained association rules ---
        if not cart_names: return None
        cart_set = set(n.strip() for n in cart_names)
        for rule in ML_RULES:
            if all(a in cart_set for a in rule["antecedents"]):
                rec = rule["consequents"][0]
                if rec in cart_set: continue
                prod = db.query(Product).filter(Product.name.ilike(rec)).first()
                price = prod.price if prod else 49.99
                discount_pct = min(50, round(rule["lift"] * 8))
                return {
                    "recommendation": rec,
                    "trigger_items": rule["antecedents"],
                    "discount_text": f"{discount_pct}% OFF",
                    "discount_price": round(price * (1 - discount_pct / 100), 2),
                    "original_price": price,
                    "confidence": round(rule["confidence"] * 100),
                    "lift": round(rule["lift"], 2),
                    "message": f"{round(rule['confidence']*100)}% of shoppers who buy "
                               f"'{' + '.join(rule['antecedents'])}' also buy '{rec}'!"
                }
    return None

def seed_products():
    json_path = os.path.join(os.path.dirname(__file__), "backend", "data", "products.json")
    if not os.path.exists(json_path):
        print("[WARN] products.json not found")
        return
    with SessionLocal() as db:
        if db.query(Product).count() > 0:
            print(f"[OK] {db.query(Product).count()} products already in DB")
            return
        data = json.loads(open(json_path).read())
        # Assign sample expiry dates to perishable categories
        perishable = ['Groceries', 'Snacks & Beverages']
        today = date.today()
        for i, item in enumerate(data):
            exp = None
            if item.get("category") in perishable:
                # Spread expiry: some expire soon (1-3 days), most in 7-30 days
                days_out = [1, 2, 3, 5, 7, 10, 14, 20, 30][i % 9]
                exp = today + timedelta(days=days_out)
            db.add(Product(
                id=item["id"], name=item["name"],
                category=item["category"], price=item["price"],
                stock=50 + (i % 100),
                expiry_date=exp,
                image_emoji=get_emoji(item["name"], item["category"])
            ))
        db.commit()
        print(f"[OK] Seeded {len(data)} products into DB")

# ─── Lifecycle ───────────────────────────────────────────────────────────────
@asynccontextmanager
async def lifespan(app: FastAPI):
    Base.metadata.create_all(bind=engine)
    seed_products()
    load_ml_rules()
    print("[START] FastAPI ready on http://localhost:8000")
    print(f"[START] API docs at http://localhost:8000/docs")
    yield

app = FastAPI(title="Smart AI Manager API", version="2.0", lifespan=lifespan)

# ─── Pydantic schemas ────────────────────────────────────────────────────────
class CouponRequest(BaseModel):
    cart: list[str]

class CheckoutRequest(BaseModel):
    cart: list[dict]
    coupon_shown: Optional[str] = None
    coupon_accepted: bool = False

class AddProductRequest(BaseModel):
    name: str
    category: str
    price: float
    stock: int = 100
    expiry_date: Optional[str] = None   # "YYYY-MM-DD"

class UpdateProductRequest(BaseModel):
    stock: Optional[int] = None
    price: Optional[float] = None
    expiry_date: Optional[str] = None

# ═══════════════════════════════════════════════════════════════════
# ROUTES
# ═══════════════════════════════════════════════════════════════════

@app.get("/api/health")
def health():
    return {"status": "ok", "ml_rules": len(ML_RULES), "version": "2.0"}

# ── Products ──────────────────────────────────────────────────────
@app.get("/api/products")
def get_products():
    with SessionLocal() as db:
        products = db.query(Product).order_by(Product.category, Product.name).all()
        return [{
            "id": p.id, "name": p.name, "category": p.category,
            "price": p.price, "stock": p.stock,
            "expiry_date": p.expiry_date.isoformat() if p.expiry_date else None,
            "image_emoji": p.image_emoji
        } for p in products]

@app.get("/api/products/expiring")
def get_expiring(days: int = 3):
    """Products expiring within N days — used to push coupons"""
    cutoff = date.today() + timedelta(days=days)
    with SessionLocal() as db:
        products = db.query(Product).filter(
            Product.expiry_date != None,
            Product.expiry_date <= cutoff
        ).order_by(Product.expiry_date).all()
        return [{
            "id": p.id, "name": p.name, "category": p.category,
            "price": p.price, "stock": p.stock,
            "expiry_date": p.expiry_date.isoformat(),
            "days_left": (p.expiry_date - date.today()).days,
            "image_emoji": p.image_emoji
        } for p in products]

@app.post("/api/products")
def add_product(req: AddProductRequest):
    """Manager adds a new product with optional expiry date"""
    with SessionLocal() as db:
        existing = db.query(Product).filter(Product.name.ilike(req.name)).first()
        if existing:
            raise HTTPException(status_code=400, detail="Product already exists")
        exp = date.fromisoformat(req.expiry_date) if req.expiry_date else None
        new_id = (db.query(Product).count() or 0) + 1000
        p = Product(
            id=new_id, name=req.name, category=req.category,
            price=req.price, stock=req.stock, expiry_date=exp,
            image_emoji=get_emoji(req.name, req.category)
        )
        db.add(p); db.commit()
        return {"success": True, "id": new_id}

@app.put("/api/products/{product_id}")
def update_product(product_id: int, req: UpdateProductRequest):
    with SessionLocal() as db:
        p = db.query(Product).filter(Product.id == product_id).first()
        if not p: raise HTTPException(status_code=404, detail="Product not found")
        if req.stock is not None: p.stock = req.stock
        if req.price is not None: p.price = req.price
        if req.expiry_date is not None:
            p.expiry_date = date.fromisoformat(req.expiry_date)
        db.commit()
        return {"success": True}

# ── ML Coupon  ────────────────────────────────────────────────────
@app.post("/api/coupon")
def get_coupon(req: CouponRequest):
    """
    Called after 2s inactivity in checkout.
    Also checks for near-expiry products to push — expiry coupons take priority.
    """
    # Check if any near-expiry products should be pushed first
    with SessionLocal() as db:
        tomorrow = date.today() + timedelta(days=2)
        expiring = db.query(Product).filter(
            Product.expiry_date != None,
            Product.expiry_date <= tomorrow,
            Product.stock > 0
        ).order_by(Product.expiry_date).first()

    if expiring:
        coupon = find_coupon(req.cart, expiry_override=expiring.name)
    else:
        coupon = find_coupon(req.cart)

    if coupon:
        print(f"[ML] Coupon: {coupon['recommendation']} ({coupon['discount_text']})")
    return {"coupon": coupon}

# ── Checkout  ─────────────────────────────────────────────────────
@app.post("/api/checkout")
def checkout(req: CheckoutRequest):
    total = sum(i.get("price", 0) * i.get("qty", 1) for i in req.cart)
    with SessionLocal() as db:
        tx = Transaction(
            session_id=f"s_{datetime.utcnow().timestamp()}",
            cart_items=json.dumps([i["name"] for i in req.cart]),
            coupon_shown=req.coupon_shown,
            coupon_accepted=1 if req.coupon_accepted else 0,
            total=total
        )
        db.add(tx); db.commit()
        return {"success": True, "transaction_id": tx.id, "total": total}

# ── Dashboard ──────────────────────────────────────────────────────
@app.get("/api/kpi")
def kpi():
    with SessionLocal() as db:
        txns = db.query(Transaction).all()
        revenue = sum(t.total for t in txns) or 15420
        accepted = sum(1 for t in txns if t.coupon_accepted == 1)
        expiring = db.query(Product).filter(
            Product.expiry_date != None,
            Product.expiry_date <= date.today() + timedelta(days=3)
        ).count()
    return {
        "liveRevenue": round(revenue, 2),
        "totalTransactions": len(txns),
        "couponsAccepted": accepted,
        "expiringProducts": expiring,
        "occupancyRate": 85,
        "wasteRiskLevel": "High" if expiring > 5 else "Medium" if expiring > 0 else "Low"
    }

@app.get("/api/recommendations")
def recommendations():
    with SessionLocal() as db:
        expiring = db.query(Product).filter(
            Product.expiry_date != None,
            Product.expiry_date <= date.today() + timedelta(days=3)
        ).order_by(Product.expiry_date).limit(5).all()
    recs = []
    for p in expiring:
        days = (p.expiry_date - date.today()).days
        disc = min(70, max(20, 70 - days * 10))
        recs.append({
            "id": p.id,
            "trigger": f"{p.name} expires in {days} day(s)",
            "action": f"Push {disc}% off coupon to checkout customers",
            "impact": f"Prevent waste of {p.stock} units",
            "status": "pending"
        })
    if not recs:
        recs = [{"id": 0, "trigger": "No expiring items", "action": "All stock is fresh", "impact": "", "status": "ok"}]
    return recs

@app.get("/api/inventory")
def inventory():
    with SessionLocal() as db:
        products = db.query(Product).order_by(Product.expiry_date).limit(20).all()
        return [{
            "id": p.id, "name": p.name, "category": p.category,
            "price": p.price, "stock": p.stock,
            "expiry_date": p.expiry_date.isoformat() if p.expiry_date else None,
            "days_left": (p.expiry_date - date.today()).days if p.expiry_date else None,
            "status": (
                "Red" if p.expiry_date and (p.expiry_date - date.today()).days <= 1 else
                "Orange" if p.expiry_date and (p.expiry_date - date.today()).days <= 3 else
                "Green"
            ),
            "image_emoji": p.image_emoji
        } for p in products]

@app.get("/api/sales")
def sales():
    return [
        {"time": "10:00", "actual": 2000, "predicted": 2200},
        {"time": "11:00", "actual": 3500, "predicted": 3000},
        {"time": "12:00", "actual": 4000, "predicted": 4500},
        {"time": "13:00", "actual": 6000, "predicted": 6500},
        {"time": "14:00", "actual": 5500, "predicted": 5000},
        {"time": "15:00", "actual": 3000, "predicted": 3500},
    ]

@app.post("/api/recommendations/{rec_id}/approve")
def approve(rec_id: int): return {"message": "Approved"}

@app.post("/api/recommendations/{rec_id}/dismiss")
def dismiss(rec_id: int): return {"message": "Dismissed"}

# ─── Serve React Frontend ────────────────────────────────────────────────────
DIST_DIR = os.path.join(os.path.dirname(__file__), "dist")
if os.path.exists(DIST_DIR):
    app.mount("/assets", StaticFiles(directory=os.path.join(DIST_DIR, "assets")), name="assets")

@app.get("/{full_path:path}")
def serve_frontend(full_path: str):
    index = os.path.join(DIST_DIR, "index.html")
    if os.path.exists(index):
        return FileResponse(index)
    return {"message": "Run 'npm run build' to serve frontend"}
