from fastapi import FastAPI, HTTPException
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from pydantic import BaseModel
from sqlalchemy import create_engine, Column, Integer, String, Float, DateTime, Text
from sqlalchemy.orm import DeclarativeBase, sessionmaker, Session
from contextlib import asynccontextmanager
from typing import Optional
import json, os, csv, re
from datetime import datetime

# ─── Database Setup ─────────────────────────────────────────────────────────
# SQLite locally → swap DATABASE_URL env var for PostgreSQL on AWS RDS
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./smartai.db")
engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False} if "sqlite" in DATABASE_URL else {})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

class Base(DeclarativeBase):
    pass

class Product(Base):
    __tablename__ = "products"
    id         = Column(Integer, primary_key=True, index=True)
    name       = Column(String(200), unique=True, index=True)
    category   = Column(String(100))
    price      = Column(Float)

class Transaction(Base):
    __tablename__ = "transactions"
    id           = Column(Integer, primary_key=True, index=True)
    session_id   = Column(String(100))
    cart_items   = Column(Text)   # JSON array of item names
    coupon_shown = Column(String(200), nullable=True)
    coupon_accepted = Column(Integer, default=0)
    total        = Column(Float, default=0.0)
    created_at   = Column(DateTime, default=datetime.utcnow)

# ─── ML Rules (loaded once at startup, no Python subprocess needed) ──────────
ML_RULES = []

def load_ml_rules():
    rules_path = os.path.join(os.path.dirname(__file__), "ml_models", "massive_trained_rules.csv")
    if not os.path.exists(rules_path):
        print("⚠️  ML rules CSV not found. Run: python ml_models/train_on_massive.py")
        return
    with open(rules_path, "r") as f:
        reader = csv.reader(f)
        next(reader)  # skip header
        for row in reader:
            if len(row) < 7: continue
            # Handle quoted antecedents like '"Garlic Bread, Wireless Mouse"'
            ant_raw = row[0].strip().strip('"')
            con_raw = row[1].strip().strip('"')
            antecedents = [a.strip() for a in ant_raw.split(",")]
            consequents = [c.strip() for c in con_raw.split(",")]
            try:
                confidence = float(row[5])
                lift = float(row[6])
            except (ValueError, IndexError):
                continue
            if lift > 1.0:
                ML_RULES.append({"antecedents": antecedents, "consequents": consequents,
                                  "confidence": confidence, "lift": lift})
    ML_RULES.sort(key=lambda r: r["lift"], reverse=True)
    print(f"✅ Loaded {len(ML_RULES)} ML rules (pure Python, no separate process needed)")

def find_coupon(cart_names: list[str]) -> Optional[dict]:
    """Find the best ML coupon for a given cart. Called directly in-process."""
    if not cart_names: return None
    cart_set = set(n.strip() for n in cart_names)
    with SessionLocal() as db:
        for rule in ML_RULES:
            if all(a in cart_set for a in rule["antecedents"]):
                rec = rule["consequents"][0]
                if rec in cart_set: continue
                product = db.query(Product).filter(Product.name.ilike(rec)).first()
                price = product.price if product else 49.99
                discount_pct = min(50, round(rule["lift"] * 8))
                discount_price = round(price * (1 - discount_pct / 100), 2)
                return {
                    "recommendation": rec,
                    "trigger_items": rule["antecedents"],
                    "discount_text": f"{discount_pct}% OFF",
                    "discount_price": discount_price,
                    "original_price": price,
                    "confidence": round(rule["confidence"] * 100),
                    "lift": round(rule["lift"], 2),
                    "message": f"🤖 {round(rule['confidence']*100)}% of shoppers who buy "
                               f"'{' + '.join(rule['antecedents'])}' also buy '{rec}'!"
                }
    return None

def seed_products():
    """Seed database from products.json if table is empty."""
    json_path = os.path.join(os.path.dirname(__file__), "backend", "data", "products.json")
    if not os.path.exists(json_path):
        print("⚠️  products.json not found — DB will have no products")
        return
    with SessionLocal() as db:
        if db.query(Product).count() > 0:
            print(f"✅ Products already in DB: {db.query(Product).count()}")
            return
        data = json.loads(open(json_path).read())
        for item in data:
            db.add(Product(id=item["id"], name=item["name"],
                           category=item["category"], price=item["price"]))
        db.commit()
        print(f"✅ Seeded {len(data)} products into database")

# ─── App Lifecycle ───────────────────────────────────────────────────────────
@asynccontextmanager
async def lifespan(app: FastAPI):
    Base.metadata.create_all(bind=engine)
    seed_products()
    load_ml_rules()
    print(f"🚀 FastAPI backend ready on port 8000")
    yield

app = FastAPI(title="Smart AI Manager API", lifespan=lifespan)

# ─── Pydantic Models ─────────────────────────────────────────────────────────
class CouponRequest(BaseModel):
    cart: list[str]

class CheckoutRequest(BaseModel):
    cart: list[dict]
    coupon_shown: Optional[str] = None
    coupon_accepted: bool = False

# ═══════════════════════════════════════════════════════════════════
# API ROUTES
# ═══════════════════════════════════════════════════════════════════

@app.get("/api/health")
def health():
    return {"status": "ok", "products": 0, "ml_rules": len(ML_RULES)}

# ── Products ──────────────────────────────────────────────────────
@app.get("/api/products")
def get_products():
    with SessionLocal() as db:
        return db.query(Product).order_by(Product.category, Product.name).all()

@app.get("/api/products/{category}")
def get_by_category(category: str):
    with SessionLocal() as db:
        return db.query(Product).filter(Product.category.ilike(f"%{category}%")).all()

# ── ML Coupon (2-second inactivity trigger from frontend) ─────────
@app.post("/api/coupon")
def get_coupon(req: CouponRequest):
    """
    Pure in-process ML inference.
    No Python subprocess, no Raspberry Pi, no external service.
    Reads pre-trained CSV rules that are loaded into memory at startup.
    """
    coupon = find_coupon(req.cart)
    if coupon:
        print(f"[ML] Cart: {req.cart} → Rec: {coupon['recommendation']} (Lift: {coupon['lift']})")
    return {"coupon": coupon}

# ── Checkout (saves transaction to DB) ────────────────────────────
@app.post("/api/checkout")
def checkout(req: CheckoutRequest):
    total = sum(i.get("price", 0) * i.get("qty", 1) for i in req.cart)
    item_names = [i["name"] for i in req.cart]
    with SessionLocal() as db:
        tx = Transaction(
            session_id=f"session_{datetime.utcnow().timestamp()}",
            cart_items=json.dumps(item_names),
            coupon_shown=req.coupon_shown,
            coupon_accepted=1 if req.coupon_accepted else 0,
            total=total
        )
        db.add(tx); db.commit()
        return {"success": True, "transaction_id": tx.id, "total": total}

# ── Dashboard KPIs ────────────────────────────────────────────────
@app.get("/api/kpi")
def kpi():
    with SessionLocal() as db:
        total_sales = db.query(Transaction).count()
        revenue = sum(t.total for t in db.query(Transaction).all()) or 15420
        coupons_accepted = db.query(Transaction).filter(Transaction.coupon_accepted == 1).count()
    return {
        "liveRevenue": round(revenue, 2),
        "totalTransactions": total_sales,
        "couponsAccepted": coupons_accepted,
        "occupancyRate": 85,
        "wasteRiskLevel": "High"
    }

@app.get("/api/recommendations")
def recommendations():
    return [
        {"id": 1, "trigger": "Mutton Curry 40% below target",
         "action": "15% discount bundle with Cold Coffee", "impact": "+₹1,200", "status": "pending"},
        {"id": 2, "trigger": "Tomatoes expiring <12h",
         "action": "Recommend Tomato Soup as Chef Special", "impact": "Save ₹400", "status": "pending"}
    ]

@app.get("/api/inventory")
def inventory():
    return [
        {"id": 1, "name": "Tomatoes", "category": "Groceries", "status": "Red", "expiry": "< 12 hours", "stock": "10 kg"},
        {"id": 2, "name": "Milk", "category": "Beverages", "status": "Orange", "expiry": "1 Day", "stock": "20 Liters"},
        {"id": 3, "name": "Chicken", "category": "Main Course", "status": "Green", "expiry": "3 Days", "stock": "50 kg"},
    ]

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

# ─── Serve React Frontend (built dist/) ─────────────────────────────────────
DIST_DIR = os.path.join(os.path.dirname(__file__), "dist")
if os.path.exists(DIST_DIR):
    app.mount("/assets", StaticFiles(directory=os.path.join(DIST_DIR, "assets")), name="assets")

@app.get("/{full_path:path}")
def serve_frontend(full_path: str):
    index = os.path.join(DIST_DIR, "index.html")
    if os.path.exists(index):
        return FileResponse(index)
    return {"message": "Frontend not built. Run: npm run build"}
