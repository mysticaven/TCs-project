from fastapi import FastAPI, HTTPException
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
import pandas as pd
import os
import uvicorn

app = FastAPI(title="Smart AI Manager Backend")

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount static files for React app
if os.path.exists("dist"):
    app.mount("/", StaticFiles(directory="dist", html=True), name="static")

# Load ML Rules
ml_rules = []
rules_path = os.path.join("ml_models", "massive_trained_rules.csv")
if os.path.exists(rules_path):
    try:
        df = pd.read_csv(rules_path)
        for _, row in df.iterrows():
            antecedents = [x.strip() for x in str(row['antecedents']).split(',')]
            consequents = [x.strip() for x in str(row['consequents']).split(',')]
            ml_rules.append({
                'antecedents': antecedents,
                'consequents': consequents,
                'confidence': float(row.get('confidence', 0)),
                'lift': float(row.get('lift', 0))
            })
        print(f"✅ Loaded {len(ml_rules)} ML rules")
    except Exception as e:
        print(f"⚠️ Error loading ML rules: {e}")

# Load Products
products = []
sales_csv = os.path.join("ml_models", "massive_sales_data.csv")
if os.path.exists(sales_csv):
    try:
        df = pd.read_csv(sales_csv, nrows=100000)
        seen = set()
        id_counter = 1
        for _, row in df.iterrows():
            name = str(row.get('Product_Name', '')).strip()
            category = str(row.get('Category', '')).strip()
            price = float(row.get('Price', 9.99))
            if name and name not in seen:
                seen.add(name)
                products.append({
                    'id': id_counter,
                    'name': name,
                    'category': category,
                    'price': round(price, 2)
                })
                id_counter += 1
        print(f"✅ Loaded {len(products)} products")
    except Exception as e:
        print(f"⚠️ Error loading products: {e}")

# Fallback products
if not products:
    products = [
        {"id": 1, "name": "Laptop", "category": "Electronics", "price": 45000},
        {"id": 2, "name": "Wireless Mouse", "category": "Electronics", "price": 1200},
        {"id": 3, "name": "DSLR Camera", "category": "Electronics", "price": 55000},
        {"id": 4, "name": "SD Card", "category": "Accessories", "price": 800},
        {"id": 5, "name": "Pasta", "category": "Groceries", "price": 250},
        {"id": 6, "name": "Garlic Bread", "category": "Groceries", "price": 100},
        {"id": 7, "name": "Diapers", "category": "Baby", "price": 600},
        {"id": 8, "name": "Wet Wipes", "category": "Baby", "price": 150},
    ]

# Mock data
kpi_data = {
    "liveRevenue": 15420,
    "occupancyRate": 85,
    "wasteRiskLevel": "High"
}

recommendations_data = [
    {
        "id": 1,
        "trigger": "Mutton Curry sales are 40% below target",
        "action": "Create a 15% discount bundle with Cold Coffee",
        "impact": "+₹1,200 revenue",
        "status": "pending"
    },
    {
        "id": 2,
        "trigger": "Tomatoes expiring in <12 hours",
        "action": "Recommend Tomato Soup as \"Chef's Special\" today",
        "impact": "Save ₹400 in waste",
        "status": "pending"
    }
]

inventory_data = [
    {"id": 1, "name": "Tomatoes", "category": "Groceries", "status": "Red", "expiry": "< 12 hours", "stock": "10 kg"},
    {"id": 2, "name": "Milk", "category": "Beverages", "status": "Orange", "expiry": "1 Day", "stock": "20 Liters"},
    {"id": 3, "name": "Chicken", "category": "Main Course", "status": "Green", "expiry": "3 Days", "stock": "50 kg"},
    {"id": 4, "name": "Cold Coffee Beans", "category": "Beverages", "status": "Green", "expiry": "1 Month", "stock": "5 kg"},
    {"id": 5, "name": "Mutton", "category": "Main Course", "status": "Orange", "expiry": "2 Days", "stock": "15 kg"},
]

sales_data = [
    {"time": "10:00", "actual": 2000, "predicted": 2200},
    {"time": "11:00", "actual": 3500, "predicted": 3000},
    {"time": "12:00", "actual": 4000, "predicted": 4500},
    {"time": "13:00", "actual": 6000, "predicted": 6500},
    {"time": "14:00", "actual": 5500, "predicted": 5000},
    {"time": "15:00", "actual": 3000, "predicted": 3500},
]

# Global state for IoT offers
latest_iot_offer = None

# Pydantic models
class CartRequest(BaseModel):
    cart: List[str]

class IoTCartRequest(BaseModel):
    device_id: str
    cart: List[str]

class CouponResponse(BaseModel):
    coupon: Optional[dict]

class IoTResponse(BaseModel):
    success: bool
    ai_response: dict

class OfferResponse(BaseModel):
    new_offer: bool
    offer: Optional[dict]

# Helper function for coupon
def find_best_coupon(cart_items: List[str]):
    if not cart_items:
        return None
    cart_set = set(cart_items)
    # Sort by highest lift
    sorted_rules = sorted(ml_rules, key=lambda r: r['lift'], reverse=True)
    for rule in sorted_rules:
        if all(ant in cart_set for ant in rule['antecedents']):
            rec = rule['consequents'][0]
            if rec not in cart_set:
                product = next((p for p in products if p['name'].lower() == rec.lower()), None)
                price = product['price'] if product else 99
                discount_pct = min(50, int(rule['lift'] * 8))
                discount_price = round(price * (1 - discount_pct / 100), 2)
                return {
                    "recommendation": rec,
                    "triggerItems": rule['antecedents'],
                    "discountText": f"{discount_pct}% OFF",
                    "discountPrice": discount_price,
                    "originalPrice": price,
                    "confidence": round(rule['confidence'] * 100),
                    "lift": round(rule['lift'], 2),
                    "message": f"🤖 AI Insight: {round(rule['confidence'] * 100)}% of customers who buy {', '.join(rule['antecedents'])} also buy {rec}!"
                }
    return None

# API Routes
@app.get("/api/kpi")
def get_kpi():
    return kpi_data

@app.get("/api/recommendations")
def get_recommendations():
    return recommendations_data

@app.get("/api/inventory")
def get_inventory():
    return inventory_data

@app.get("/api/sales")
def get_sales():
    return sales_data

@app.get("/api/products")
def get_products():
    return products

@app.post("/api/coupon")
def get_coupon(request: CartRequest):
    coupon = find_best_coupon(request.cart)
    return {"coupon": coupon}

@app.post("/api/cart/sync")
def sync_cart(request: IoTCartRequest):
    global latest_iot_offer
    cart = request.cart
    coupon = find_best_coupon(cart)
    if coupon:
        offer_item = next((p for p in products if p['name'] == coupon['recommendation']), {"name": coupon['recommendation']})
        latest_iot_offer = {
            "triggerItem": ", ".join(cart),
            "offerItem": offer_item,
            "discountText": coupon['discountText'],
            "discountPrice": coupon['discountPrice'],
            "message": coupon['message'],
            "aiType": f"FastAPI MBA (Lift: {coupon['lift']})"
        }
    else:
        latest_iot_offer = None
    return {"success": True, "ai_response": coupon or {"recommendation": None}}

@app.get("/api/iot/latest_offer")
def get_latest_offer():
    global latest_iot_offer
    if latest_iot_offer:
        offer = latest_iot_offer
        latest_iot_offer = None
        return {"new_offer": True, "offer": offer}
    return {"new_offer": False}

@app.post("/api/recommendations/{rec_id}/approve")
def approve_recommendation(rec_id: int):
    for rec in recommendations_data:
        if rec['id'] == rec_id:
            rec['status'] = 'approved'
            return {"message": "Recommendation approved successfully"}
    raise HTTPException(status_code=404, detail="Recommendation not found")

@app.post("/api/recommendations/{rec_id}/dismiss")
def dismiss_recommendation(rec_id: int):
    for rec in recommendations_data:
        if rec['id'] == rec_id:
            rec['status'] = 'dismissed'
            return {"message": "Recommendation dismissed successfully"}
    raise HTTPException(status_code=404, detail="Recommendation not found")

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)