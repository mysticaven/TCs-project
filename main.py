import os
import json
import csv
import random
import math
from datetime import datetime, date, timedelta
from typing import Optional, List
from contextlib import asynccontextmanager

from fastapi import FastAPI, HTTPException, Query, BackgroundTasks
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from sqlalchemy import create_engine, Column, Integer, String, Float, DateTime, Date, Text, desc
from sqlalchemy.orm import DeclarativeBase, sessionmaker

import xai_engine as xai

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
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), unique=True, index=True)
    category = Column(String(100))
    quantity = Column(Integer, default=100)  # Quantity in stock
    price = Column(Float)
    expiry_date = Column(Date, nullable=True)   # None = non-perishable
    freshness_score = Column(Float, default=100.0)
    health_score = Column(Float, default=100.0)
    discount = Column(Float, default=0.0)       # Applied discount percentage
    image_url = Column(Text, nullable=True)
    supplier = Column(String(255), default="Global Foods Inc.")
    created_at = Column(DateTime, default=datetime.utcnow)
    image_emoji = Column(String(10), default="📦")

    @property
    def stock(self):
        return self.quantity

class Transaction(Base):
    __tablename__ = "transactions"
    id = Column(Integer, primary_key=True, index=True)
    session_id = Column(String(100))
    cart_items = Column(Text)  # JSON string
    coupon_shown = Column(String(200), nullable=True)
    coupon_accepted = Column(Integer, default=0)
    total = Column(Float, default=0.0)
    savings = Column(Float, default=0.0)
    created_at = Column(DateTime, default=datetime.utcnow)

class AIDecision(Base):
    __tablename__ = "ai_decisions"
    id = Column(Integer, primary_key=True, index=True)
    product_name = Column(String(255))
    trigger = Column(String(255))
    action = Column(String(255))
    impact = Column(String(255))
    status = Column(String(50), default="applied")  # applied, replenished, executed
    model = Column(String(100))
    confidence = Column(Float, default=95.0)
    created_at = Column(DateTime, default=datetime.utcnow)

class SensorReading(Base):
    __tablename__ = "sensor_readings"
    id = Column(Integer, primary_key=True, index=True)
    temperature = Column(Float)
    humidity = Column(Float)
    gas_ppm = Column(Float)
    ph = Column(Float)
    created_at = Column(DateTime, default=datetime.utcnow)

class MLPrediction(Base):
    __tablename__ = "ml_predictions"
    id = Column(Integer, primary_key=True, index=True)
    product_name = Column(String(255))
    prediction = Column(String(100))
    confidence = Column(Float)
    actual_label = Column(String(100), nullable=True)
    model = Column(String(100))
    created_at = Column(DateTime, default=datetime.utcnow)

# ─── Emojis ───────────────────────────────────────────────────────────────
CATEGORY_EMOJI = {
    'Fruits': '🍎', 'Vegetables': '🥬', 'Dairy': '🥛', 'Meat': '🍗',
    'Frozen Food': '🍕', 'Drinks': '🥤', 'Electronics': '💻',
    'Personal Care': '🧴', 'Toys & Games': '🎮', 'Pets': '🐾', 'Groceries': '🛒',
    'Snacks & Beverages': '🍫', 'Home & Kitchen': '🏠', 'Office Supplies': '📎',
    'Tools & Hardware': '🔧', 'Clothing & Accessories': '👕'
}

ITEM_EMOJI = {
    'Apples': '🍎', 'Bananas': '🍌', 'Oranges': '🍊', 'Strawberries': '🍓', 'Blueberries': '🫐',
    'Peaches': '🍑', 'Grapes': '🍇', 'Watermelon': '🍉', 'Mangoes': '🥭',
    'Spinach': '🥬', 'Tomatoes': '🍅', 'Potatoes': '🥔', 'Onions': '🧅', 'Carrots': '🥕',
    'Broccoli': '🥦', 'Garlic': '🧄', 'Cucumbers': '🥒', 'Lettuce': '🥬',
    'Milk': '🥛', 'Eggs': '🥚', 'Bread': '🍞', 'Butter': '🧈', 'Cheese': '🧀', 'Yogurt': '🥛',
    'Chicken': '🍗', 'Chicken Breast': '🍗', 'Beef': '🥩', 'Ground Beef': '🥩', 'Salmon': '🐟',
    'Pizza': '🍕', 'Ice Cream': '🍨', 'Frozen Pizza': '🍕', 'French Fries': '🍟',
    'Cola': '🥤', 'Soda': '🥤', 'Orange Juice': '🍊', 'Coffee': '☕', 'Tea': '🍵',
    'Laptop': '💻', 'Wireless Mouse': '🖱️', 'Smartwatch': '⌚', 'Tablet': '📱', 'Camera': '📷',
    'Shampoo': '🧴', 'Toothbrush': '🪥', 'Soap': '🧼',
    'Lego Set': '🧱', 'Board Game': '🎲', 'Dog Food': '🐕', 'Cat Food': '🐈'
}

def get_emoji(name: str, category: str) -> str:
    for k, v in ITEM_EMOJI.items():
        if k.lower() in name.lower():
            return v
    return CATEGORY_EMOJI.get(category, '📦')

# ─── ML Rules ────────────────────────────────────────────────────────────────
ML_RULES = []

def load_ml_rules():
    rules_path = os.path.join(os.path.dirname(__file__), "ml_models", "retail_rules.csv")
    if not os.path.exists(rules_path):
        # Create a mock rule list if not present
        ML_RULES.append({
            "antecedents": ["Pasta"], "consequents": ["Tomato Sauce"], "confidence": 0.85, "lift": 2.5
        })
        ML_RULES.append({
            "antecedents": ["Burger"], "consequents": ["Potato Chips"], "confidence": 0.75, "lift": 2.1
        })
        ML_RULES.append({
            "antecedents": ["Milk"], "consequents": ["Eggs"], "confidence": 0.70, "lift": 1.8
        })
        print("[OK] Created mock ML rules")
        return
    
    try:
        with open(rules_path, "r", encoding="utf-8") as f:
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
    except Exception as e:
        print(f"[ERROR] Failed to load ML rules: {e}")

def randomIntFromId(prod_id: int, min_val: int, max_val: int) -> int:
    x = math.sin(prod_id) * 10000
    return int((x - math.floor(x)) * (max_val - min_val + 1)) + min_val

def get_seeded_image_url(name: str, category: str) -> str:
    n = name.lower()
    
    # Keyword matches mapping to direct beautiful product image assets
    if 'apple' in n:
        return 'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?auto=format&fit=crop&q=80&w=400'
    if 'banana' in n:
        return 'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?auto=format&fit=crop&q=80&w=400'
    if 'orange' in n:
        return 'https://images.unsplash.com/photo-1547514701-42782101795e?auto=format&fit=crop&q=80&w=400'
    if 'strawberry' in n or 'berry' in n or 'blueberries' in n or 'raspberries' in n or 'cherry' in n or 'cherries' in n:
        return 'https://images.unsplash.com/photo-1464965911861-746a04b4bca6?auto=format&fit=crop&q=80&w=400'
    if 'milk' in n or 'dairy' in n or 'cream' in n:
        return 'https://images.unsplash.com/photo-1550583724-b2692b85b150?auto=format&fit=crop&q=80&w=400'
    if 'egg' in n:
        return 'https://images.unsplash.com/photo-1506976785307-8732e854ad03?auto=format&fit=crop&q=80&w=400'
    if 'bread' in n or 'bakery' in n or 'waffle' in n or 'waffles' in n:
        return 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&q=80&w=400'
    if 'cheese' in n or 'cheddar' in n or 'mozzarella' in n:
        return 'https://images.unsplash.com/photo-1486299267070-83823f5448dd?auto=format&fit=crop&q=80&w=400'
    if 'beef' in n or 'meat' in n or 'steak' in n or 'ribeye' in n or 'pork' in n or 'lamb' in n or 'bacon' in n or 'ham' in n or 'sausage' in n:
        return 'https://images.unsplash.com/photo-1603048588665-791ca8aea617?auto=format&fit=crop&q=80&w=400'
    if 'chicken' in n or 'breast' in n or 'poultry' in n or 'turkey' in n or 'nuggets' in n:
        return 'https://images.unsplash.com/photo-1604503468506-a8da13d82791?auto=format&fit=crop&q=80&w=400'
    if 'salmon' in n or 'fish' in n or 'shrimp' in n or 'seafood' in n or 'tuna' in n:
        return 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?auto=format&fit=crop&q=80&w=400'
    if 'pizza' in n or 'burrito' in n or 'burger' in n or 'fries' in n or 'sticks' in n or 'stickers' in n:
        return 'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&q=80&w=400'
    if 'ice cream' in n or 'dessert' in n or 'yogurt' in n:
        return 'https://images.unsplash.com/photo-1497034825429-c343d7c6a68f?auto=format&fit=crop&q=80&w=400'
    if 'cola' in n or 'soda' in n or 'coke' in n or 'lemonade' in n or 'tea' in n or 'coffee' in n or 'juice' in n or 'water' in n or 'drink' in n or 'ale' in n:
        return 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?auto=format&fit=crop&q=80&w=400'
    if 'tomato' in n or 'tomatoes' in n:
        return 'https://images.unsplash.com/photo-1595855759920-86582396756a?auto=format&fit=crop&q=80&w=400'
    if 'potato' in n or 'potatoes' in n or 'spinach' in n or 'onion' in n or 'onions' in n or 'carrot' in n or 'carrots' in n or 'broccoli' in n or 'garlic' in n or 'cucumber' in n or 'cucumbers' in n or 'pepper' in n or 'lettuce' in n or 'cauliflower' in n or 'zucchini' in n or 'mushroom' in n or 'mushrooms' in n or 'celery' in n or 'asparagus' in n or 'vegetables' in n or 'veg' in n:
        return 'https://images.unsplash.com/photo-1518977676601-b53f82aba655?auto=format&fit=crop&q=80&w=400'
    
    # Category defaults
    defaults = {
        'Fruits': 'https://images.unsplash.com/photo-1619546813926-a78fa6372cd2?auto=format&fit=crop&q=80&w=400',
        'Vegetables': 'https://images.unsplash.com/photo-1597362925123-77861d3fbac7?auto=format&fit=crop&q=80&w=400',
        'Dairy': 'https://images.unsplash.com/photo-1550583724-b2692b85b150?auto=format&fit=crop&q=80&w=400',
        'Meat': 'https://images.unsplash.com/photo-1607623814075-e51df1bdc82f?auto=format&fit=crop&q=80&w=400',
        'Frozen Food': 'https://images.unsplash.com/photo-1563245372-f21724e3856d?auto=format&fit=crop&q=80&w=400',
        'Drinks': 'https://images.unsplash.com/photo-1527960656366-ee2a999e32e6?auto=format&fit=crop&q=80&w=400'
    }
    return defaults.get(category, 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=400')

# ─── Auto-Populate 5000 Products ─────────────────────────────────────────────
def seed_products_5000():
    with SessionLocal() as db:
        prod_count = db.query(Product).count()
        if prod_count >= 100:
            print(f"[OK] {prod_count} products already in DB, skipping 5k auto-populate.")
            return

        print("Generating 5000 premium dummy products automatically...")
        
        adjectives = [
            'Organic', 'Fresh', 'Premium', 'Gourmet', 'Farm-Fresh', 'Local',
            'Natural', 'Sweet', 'Juicy', 'Crispy', 'Deluxe', 'Classic',
            'Imported', 'Smoked', 'Roasted', 'Sugar-Free', 'Low-Fat', 'Gluten-Free'
        ]
        
        categories_data = {
            'Fruits': ['Apples', 'Bananas', 'Oranges', 'Strawberries', 'Blueberries', 'Raspberries', 'Peaches', 'Grapes', 'Pineapples', 'Mangoes', 'Watermelons', 'Kiwis', 'Pears', 'Plums', 'Cherries', 'Avocados'],
            'Vegetables': ['Spinach', 'Tomatoes', 'Potatoes', 'Onions', 'Carrots', 'Broccoli', 'Garlic', 'Cucumbers', 'Bell Peppers', 'Lettuce', 'Cauliflower', 'Zucchini', 'Mushrooms', 'Celery', 'Asparagus'],
            'Dairy': ['Whole Milk', 'Low-Fat Milk', 'Cheddar Cheese', 'Mozzarella', 'Butter', 'Greek Yogurt', 'Sour Cream', 'Heavy Cream', 'Cream Cheese', 'Cottage Cheese', 'Almond Milk', 'Swiss Cheese'],
            'Meat': ['Chicken Breast', 'Ribeye Steak', 'Ground Beef', 'Pork Chops', 'Turkey Breast', 'Salmon Fillet', 'Bacon', 'Italian Sausage', 'Lamb Chops', 'Ham Fillet', 'Shrimp Pack', 'Tuna Steak'],
            'Frozen Food': ['Frozen Pizza', 'Ice Cream Tub', 'Chicken Nuggets', 'Frozen Waffles', 'Frozen Peas', 'Frozen Berries', 'French Fries', 'Frozen Burrito', 'Veggie Burgers', 'Fish Sticks', 'Pot Stickers'],
            'Drinks': ['Cola Can', 'Diet Soda', 'Lemonade Bottle', 'Orange Juice Carton', 'Apple Juice Bottle', 'Green Tea', 'Black Coffee Beans', 'Energy Drink', 'Iced Tea', 'Coconut Water', 'Sparkling Water', 'Ginger Ale']
        }
        
        suppliers = ['Apex Distributors', 'Global Foods Inc.', 'Nature\'s Harvest', 'Prime Meats Ltd.', 'CoolTemp Logistics', 'Oceanic Seafoods']
        price_ranges = {
            'Fruits': (1.99, 9.99), 'Vegetables': (0.99, 6.99), 'Dairy': (1.49, 12.99),
            'Meat': (5.99, 39.99), 'Frozen Food': (2.99, 15.99), 'Drinks': (0.99, 8.99)
        }

        name_tracker = set()
        target_count = 5000
        category_keys = list(categories_data.keys())
        today_date = date.today()

        # Seed initial catalog items first for consistency
        json_path = os.path.join(os.path.dirname(__file__), "backend", "data", "products.json")
        if os.path.exists(json_path):
            try:
                with open(json_path, "r", encoding="utf-8") as f:
                    initial_data = json.load(f)
                    for idx, item in enumerate(initial_data):
                        name = item["name"]
                        if name in name_tracker:
                            continue
                        name_tracker.add(name)
                        cat = item.get("category", "Groceries")
                        if cat not in price_ranges:
                            cat = "Dairy" if cat in ["Dairy", "Bakery", "Produce"] else "Frozen Food"
                        
                        days_out = [1, 2, 3, 5, 7, 10, 14, 20, 30][idx % 9]
                        exp = today_date + timedelta(days=days_out)
                        
                        prod = Product(
                            id=10000 + idx,
                            name=name,
                            category=cat,
                            quantity=random.randint(50, 400),
                            price=item["price"],
                            expiry_date=exp,
                            freshness_score=random.randint(40, 95),
                            health_score=random.randint(35, 98),
                            discount=0.0,
                            image_url=get_seeded_image_url(name, cat),
                            supplier=random.choice(suppliers),
                            image_emoji=item.get("image_emoji") or get_emoji(name, cat)
                        )
                        db.add(prod)
                db.commit()
                print(f"Loaded baseline {len(name_tracker)} products from products.json")
            except Exception as e:
                print(f"Error loading products.json: {e}")

        current_len = db.query(Product).count()
        attempts = 0
        max_attempts = 30000
        
        while current_len < target_count and attempts < max_attempts:
            attempts += 1
            cat = random.choice(category_keys)
            adj = random.choice(adjectives)
            base_name = random.choice(categories_data[cat])
            
            qualifier = random.choice(["", "Pack", "Extra", "Lite", "Style", "Select", "Original"])
            size = random.choice(["", " (S)", " (M)", " (L)", " (XL)", " 250g", " 500g", " 1kg", " 1L"])
            name = f"{adj} {base_name} {qualifier}".strip() + size
            
            if name in name_tracker:
                continue
            name_tracker.add(name)
            
            min_p, max_p = price_ranges[cat]
            price = round(random.uniform(min_p, max_p), 2)
            
            days_out = random.randint(-2, 45)
            exp = today_date + timedelta(days=days_out)
            
            freshness = round(random.uniform(20, 100), 1)
            temp_stab = round(random.uniform(30, 100), 1)
            hum_ctrl = round(random.uniform(40, 100), 1)
            gas_safe = round(random.uniform(25, 100), 1)
            ph_qual = round(random.uniform(30, 100), 1)
            
            health = round(0.35 * freshness + 0.25 * temp_stab + 0.20 * hum_ctrl + 0.10 * gas_safe + 0.10 * ph_qual, 1)
            
            expiry_urgency = min(100, max(0, 100 - days_out * 4)) if days_out > 0 else 100
            overstock_score = random.randint(0, 100)
            spoilage_risk = round(100 - health, 1)
            demand_drop = random.randint(0, 100)
            low_sales = random.randint(0, 100)
            
            discount_pct = 0.0
            if days_out < 5 or spoilage_risk > 60 or overstock_score > 75:
                discount_pct = round(0.4 * expiry_urgency + 0.25 * overstock_score + 0.20 * spoilage_risk + 0.10 * demand_drop + 0.05 * low_sales, 1)
                discount_pct = min(70.0, max(0.0, discount_pct))

            prod_id = 20000 + current_len
            
            prod = Product(
                id=prod_id,
                name=name,
                category=cat,
                quantity=random.randint(5, 500),
                price=price,
                expiry_date=exp,
                freshness_score=freshness,
                health_score=health,
                discount=discount_pct if discount_pct > 10 else 0.0,
                image_url=get_seeded_image_url(name, cat),
                supplier=random.choice(suppliers),
                image_emoji=get_emoji(name, cat)
            )
            db.add(prod)
            current_len += 1
            
            if current_len % 500 == 0:
                db.commit()
                print(f"Generated {current_len}/5000 products...")

        db.commit()
        print(f"[OK] Successfully seeded database with total {db.query(Product).count()} products!")

# ─── Simulated IoT Live Stream & Fully Automated AI Agent Loop ───────────────
LATEST_SENSOR = {
    "temperature": 8.4,
    "humidity": 74.0,
    "gas_ppm": 510.0,
    "ph": 5.1
}

def simulate_sensor_tick():
    """Generates drift in sensors and triggers fully automated, auto-applied AI decisions."""
    global LATEST_SENSOR
    LATEST_SENSOR["temperature"] = round(LATEST_SENSOR["temperature"] + random.uniform(-0.4, 0.4), 2)
    LATEST_SENSOR["temperature"] = max(2.0, min(12.0, LATEST_SENSOR["temperature"])) # Refrigerated range
    
    LATEST_SENSOR["humidity"] = round(LATEST_SENSOR["humidity"] + random.uniform(-1.0, 1.0), 1)
    LATEST_SENSOR["humidity"] = max(55.0, min(85.0, LATEST_SENSOR["humidity"]))
    
    LATEST_SENSOR["gas_ppm"] = round(LATEST_SENSOR["gas_ppm"] + random.uniform(-8, 12), 1)
    LATEST_SENSOR["gas_ppm"] = max(100.0, min(800.0, LATEST_SENSOR["gas_ppm"]))
    
    LATEST_SENSOR["ph"] = round(LATEST_SENSOR["ph"] + random.uniform(-0.05, 0.05), 2)
    LATEST_SENSOR["ph"] = max(4.0, min(7.5, LATEST_SENSOR["ph"]))

    with SessionLocal() as db:
        reading = SensorReading(
            temperature=LATEST_SENSOR["temperature"],
            humidity=LATEST_SENSOR["humidity"],
            gas_ppm=LATEST_SENSOR["gas_ppm"],
            ph=LATEST_SENSOR["ph"]
        )
        db.add(reading)
        
        # Select a random subset of 15 products on every tick to scan and apply decisions
        all_products = db.query(Product).all()
        if all_products:
            selected_for_review = random.sample(all_products, min(len(all_products), 15))
            today_val = date.today()

            for p in selected_for_review:
                is_perishable = p.category in ['Fruits', 'Vegetables', 'Dairy', 'Meat']
                days_left = (p.expiry_date - today_val).days if p.expiry_date else 999
                
                if is_perishable:
                    # Drift freshness and calculate health dynamically
                    freshness = max(10, min(100, 100 - (30 - days_left) * 3)) if days_left < 30 else 100.0
                    temp_factor = max(0, min(100, 100 - abs(LATEST_SENSOR["temperature"] - 4.0) * 10))
                    humidity_factor = max(0, min(100, 100 - abs(LATEST_SENSOR["humidity"] - 65.0) * 2))
                    gas_factor = max(0, min(100, 100 - (LATEST_SENSOR["gas_ppm"] / 800.0) * 100))
                    ph_factor = max(0, min(100, 100 - abs(LATEST_SENSOR["ph"] - 6.5) * 25))
                    
                    health = round(0.35 * freshness + 0.25 * temp_factor + 0.20 * humidity_factor + 0.10 * gas_factor + 0.10 * ph_factor, 1)
                    p.health_score = health
                    p.freshness_score = freshness
                    
                    # Log to prediction monitoring
                    db.add(MLPrediction(
                        product_name=p.name,
                        prediction="Fresh" if health > 75 else "Moderate" if health > 45 else "Risky",
                        confidence=round(health, 1),
                        model="Random Forest TinyML"
                    ))

                    # Auto-discount logic
                    spoilage_risk = 100 - health
                    if days_left <= 5 or spoilage_risk > 50:
                        expiry_urgency = min(100, max(0, 100 - days_left * 15)) if days_left > 0 else 100
                        overstock_score = min(100, max(0, (p.quantity / 200) * 100))
                        demand_drop = random.randint(10, 40)
                        low_sales = random.randint(15, 50)
                        
                        discount_pct = round(0.40 * expiry_urgency + 0.25 * overstock_score + 0.20 * spoilage_risk + 0.10 * demand_drop + 0.05 * low_sales, 1)
                        discount_pct = min(75.0, max(0.0, discount_pct))
                        
                        if discount_pct > 15.0 and abs(p.discount - discount_pct) > 5.0:
                            # Auto-apply discount directly to SQL database (FULLY AUTOMATED)
                            p.discount = discount_pct
                            
                            # Log decision directly as auto-applied
                            db.add(AIDecision(
                                product_name=p.name,
                                trigger=f"Expiry in {days_left}d | Spoilage risk {round(spoilage_risk)}% | Overstock",
                                action=f"AI agent auto-applied {discount_pct}% discount directly to shelf price",
                                impact=f"Diverted food waste; salvaged potential losses",
                                status="applied",
                                model="Weighted Discount Formula (XAI)",
                                confidence=94.2
                            ))
                
                # Auto-restock check for ALL reviewed items
                daily_sales = randomIntFromId(p.id, 10, 35)
                lead_time = 3
                safety_stock = 40
                reorder_point = int((daily_sales * lead_time) + safety_stock)
                
                if p.quantity < reorder_point:
                    # Stock falls under safety threshold -> Place PO & replenish stock automatically
                    units_to_order = int(daily_sales * 7) # order 1 week of stock
                    old_qty = p.quantity
                    p.quantity += units_to_order
                    
                    db.add(AIDecision(
                        product_name=p.name,
                        trigger=f"Stock ({old_qty}) fell below Safety Reorder point ({reorder_point})",
                        action=f"AI Agent auto-replenished {units_to_order} units from supplier {p.supplier}",
                        impact="Shelf availability restored to 100%; prevented customer stockout",
                        status="replenished",
                        model="EOQ Safety Reorder Point",
                        confidence=100.0
                    ))
        db.commit()

# ─── Lifecycle ───────────────────────────────────────────────────────────────
@asynccontextmanager
async def lifespan(app: FastAPI):
    from sqlalchemy.exc import OperationalError
    try:
        Base.metadata.create_all(bind=engine)
        with SessionLocal() as db:
            db.query(Product).first()
    except OperationalError:
        print("[DB] Schema mismatch, recreating database...")
        Base.metadata.drop_all(bind=engine)
        Base.metadata.create_all(bind=engine)
        
    seed_products_5000()
    
    # ─── DB Image Migrator (Automated startup migration) ───────────────────
    with SessionLocal() as db:
        null_img_count = db.query(Product).filter((Product.image_url == None) | (Product.image_url == "")).count()
        if null_img_count > 0:
            print(f"[MIGRATION] Found {null_img_count} products without image URLs. Populating Google/Unsplash images...")
            products_to_update = db.query(Product).filter((Product.image_url == None) | (Product.image_url == "")).all()
            for idx, p in enumerate(products_to_update):
                p.image_url = get_seeded_image_url(p.name, p.category)
                if idx % 500 == 0 and idx > 0:
                    db.commit()
                    print(f"[MIGRATION] Populated {idx}/{null_img_count} image URLs...")
            db.commit()
            print(f"[MIGRATION] 100% completed populating {null_img_count} image URLs successfully!")

    load_ml_rules()
    
    # Initialize some mock AI decisions if empty
    with SessionLocal() as db:
        if db.query(AIDecision).count() == 0:
            db.add(AIDecision(
                product_name="Organic Yogurt",
                trigger="Expiry <48h, stock level at 340 units",
                action="AI Agent auto-applied 35% discount directly to shelf price",
                impact="Estimated waste reduction: 88.5%; preserved salvage value",
                status="applied",
                model="Weighted Discount Formula (XAI)",
                confidence=94.2
            ))
            db.add(AIDecision(
                product_name="Fresh Bread",
                trigger="Stock fell below safety buffer point",
                action="AI Agent auto-replenished 140 units from supplier CoolTemp Logistics",
                impact="Restored shelf availability to 100%; prevented lost sales",
                status="replenished",
                model="EOQ Safety Reorder Point",
                confidence=100.0
            ))
            db.commit()
            
    print("[START] FastAPI running on http://localhost:8000")
    yield

app = FastAPI(title="Smart AI Supermarket Platform", version="3.0", lifespan=lifespan)

# ─── CORS ──────────────────────────────────────────────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ─── Pydantic Schemas ──────────────────────────────────────────────────────
class CouponRequest(BaseModel):
    cart: List[str]

class CheckoutRequest(BaseModel):
    cart: List[dict]
    coupon_shown: Optional[str] = None
    coupon_accepted: bool = False

class AddProductRequest(BaseModel):
    name: str
    category: str
    price: float
    quantity: int = 100
    expiry_date: Optional[str] = None
    supplier: Optional[str] = "Global Foods Inc."
    image_emoji: Optional[str] = "📦"

class UpdateProductRequest(BaseModel):
    price: Optional[float] = None
    quantity: Optional[int] = None
    expiry_date: Optional[str] = None
    discount: Optional[float] = None

class HealthScoreRequest(BaseModel):
    freshness: float = 70.0
    temp_stability: float = 80.0
    humidity_control: float = 75.0
    gas_safety: float = 90.0
    ph_quality: float = 85.0

class DiscountRequest(BaseModel):
    product_name: str
    expiry_urgency: float
    overstock_score: float
    spoilage_risk: float
    demand_drop: float
    low_sales_velocity: float
    days_to_expiry: Optional[int] = None
    stock_remaining: Optional[int] = None
    weekly_sales: Optional[int] = None

class SpoilageRequest(BaseModel):
    temperature: float = 9.2
    humidity: float = 78.0
    gas_ppm: float = 520.0
    ph: float = 4.8
    expiry_days: int = 3
    inventory_age_days: int = 0

class RestockRequest(BaseModel):
    product_name: str
    current_stock: int
    avg_daily_sales: float
    supplier_lead_days: int = 3
    safety_stock: int = 40

class ProductSelectionRequest(BaseModel):
    name: str
    freshness_score: float = 70
    expiry_urgency: float = 50
    inventory_overstock: float = 30
    customer_demand: float = 60
    spoilage_risk: float = 40
    sales_velocity: float = 55
    supplier_delay_risk: float = 20
    seasonal_demand: float = 50
    profit_margin: float = 65

class TraceabilityRequest(BaseModel):
    product_name: str
    days_to_expiry: int = 2
    stock: int = 340
    weekly_sales: int = 25
    spoilage_prob: float = 81.0
    freshness: float = 42.0
    temp: float = 9.2
    humidity: float = 78.0
    gas_ppm: float = 520.0
    ph: float = 4.8

# ═══════════════════════════════════════════════════════════════════
# REST APIs
# ═══════════════════════════════════════════════════════════════════

@app.get("/api/health")
def health():
    return {"status": "ok", "ml_rules": len(ML_RULES), "version": "3.0"}

# ── Products Endpoint (With Search, Filtering, Pagination, Sorting) ─────────
@app.get("/api/products")
def get_products(
    page: int = Query(1, ge=1),
    limit: int = Query(100, ge=1, le=500),
    search: Optional[str] = None,
    category: Optional[str] = None,
    sort_by: Optional[str] = "name",
    sort_order: Optional[str] = "asc"
):
    with SessionLocal() as db:
        query = db.query(Product)
        
        if search:
            query = query.filter(Product.name.ilike(f"%{search}%"))
        if category and category != 'All':
            query = query.filter(Product.category == category)
            
        if hasattr(Product, sort_by):
            col = getattr(Product, sort_by)
            if sort_order == "desc":
                query = query.order_by(desc(col))
            else:
                query = query.order_by(col)
        else:
            query = query.order_by(Product.name)
            
        total = query.count()
        offset = (page - 1) * limit
        products = query.offset(offset).limit(limit).all()
        
        return {
            "total": total,
            "page": page,
            "limit": limit,
            "products": [{
                "id": p.id,
                "name": p.name,
                "category": p.category,
                "price": p.price,
                "quantity": p.quantity,
                "stock": p.quantity,
                "expiry_date": p.expiry_date.isoformat() if p.expiry_date else None,
                "freshness_score": p.freshness_score,
                "health_score": p.health_score,
                "discount": p.discount,
                "supplier": p.supplier,
                "image_emoji": p.image_emoji
            } for p in products]
        }

@app.get("/api/products/expiring")
def get_expiring(days: int = 3):
    cutoff = date.today() + timedelta(days=days)
    with SessionLocal() as db:
        products = db.query(Product).filter(
            Product.expiry_date != None,
            Product.expiry_date <= cutoff
        ).order_by(Product.expiry_date).limit(50).all()
        
        return [{
            "id": p.id,
            "name": p.name,
            "category": p.category,
            "price": p.price,
            "stock": p.quantity,
            "expiry_date": p.expiry_date.isoformat(),
            "days_left": (p.expiry_date - date.today()).days,
            "image_emoji": p.image_emoji
        } for p in products]

@app.post("/api/products")
def add_product(req: AddProductRequest):
    with SessionLocal() as db:
        existing = db.query(Product).filter(Product.name.ilike(req.name)).first()
        if existing:
            raise HTTPException(status_code=400, detail="Product already exists")
            
        exp = date.fromisoformat(req.expiry_date) if (req.expiry_date and req.expiry_date.strip()) else None
        freshness = 90.0 if exp else 100.0
        health = 88.0 if exp else 100.0
        
        new_id = (db.query(Product).count() or 0) + 30000
        p = Product(
            id=new_id,
            name=req.name,
            category=req.category,
            quantity=req.quantity,
            price=req.price,
            expiry_date=exp,
            freshness_score=freshness,
            health_score=health,
            supplier=req.supplier,
            image_emoji=req.image_emoji or get_emoji(req.name, req.category)
        )
        db.add(p)
        db.commit()
        return {"success": True, "id": new_id}

@app.put("/api/products/{product_id}")
def update_product(product_id: int, req: UpdateProductRequest):
    with SessionLocal() as db:
        p = db.query(Product).filter(Product.id == product_id).first()
        if not p:
            raise HTTPException(status_code=404, detail="Product not found")
            
        if req.quantity is not None:
            xai.log_decision(p.name, f"Stock update: {p.quantity} → {req.quantity}", "Manual modification by admin setting", "SQL Database")
            p.quantity = req.quantity
        if req.price is not None:
            p.price = req.price
        if req.expiry_date is not None:
            p.expiry_date = date.fromisoformat(req.expiry_date) if req.expiry_date.strip() else None
        if req.discount is not None:
            p.discount = req.discount
            
        db.commit()
        return {"success": True}

@app.delete("/api/products/{product_id}")
def delete_product(product_id: int):
    with SessionLocal() as db:
        p = db.query(Product).filter(Product.id == product_id).first()
        if not p:
            raise HTTPException(status_code=404, detail="Product not found")
        db.delete(p)
        db.commit()
        return {"success": True}

# ─── Coupon / Deals ───────────────────────────────────────────────────────────
def find_coupon(cart_names: list[str], expiry_override: str = None) -> Optional[dict]:
    with SessionLocal() as db:
        if expiry_override:
            prod = db.query(Product).filter(Product.name.ilike(expiry_override)).first()
            if prod:
                days = (prod.expiry_date - date.today()).days if prod.expiry_date else 999
                discount_pct = min(70, max(20, 70 - days * 10))
                return {
                    "recommendation": prod.name,
                    "trigger_items": ["expiry-push"],
                    "discount_text": f"{discount_pct}% OFF",
                    "discount_price": round(prod.price * (1 - discount_pct / 100), 2),
                    "original_price": prod.price,
                    "confidence": 99,
                    "lift": 9.9,
                    "message": f"Auto-Applied deal: {prod.name} expires in {days} day(s). Save {discount_pct}% automatically!",
                    "expiry_push": True
                }

        if not cart_names: return None
        cart_set = set(n.strip().lower() for n in cart_names)
        for rule in ML_RULES:
            if all(a.lower() in cart_set for a in rule["antecedents"]):
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
                    "message": f"AI automated cross-sell: 65% of shoppers who buy "
                               f"'{' + '.join(rule['antecedents'])}' also buy '{rec}'. Get {discount_pct}% off now!"
                }
    return None

@app.post("/api/coupon")
def get_coupon(req: CouponRequest):
    with SessionLocal() as db:
        tomorrow = date.today() + timedelta(days=2)
        expiring = db.query(Product).filter(
            Product.expiry_date != None,
            Product.expiry_date <= tomorrow,
            Product.quantity > 0
        ).order_by(Product.expiry_date).first()

    if expiring:
        coupon = find_coupon(req.cart, expiry_override=expiring.name)
    else:
        coupon = find_coupon(req.cart)
        
    return {"coupon": coupon}

# ─── Checkout ───────────────────────────────────────────────────────────────
@app.post("/api/checkout")
def checkout(req: CheckoutRequest, background_tasks: BackgroundTasks):
    total = sum(i.get("price", 0) * i.get("qty", 1) for i in req.cart)
    savings = sum(i.get("qty", 1) * 15 for i in req.cart if i.get("isOffer"))
    
    with SessionLocal() as db:
        for item in req.cart:
            p = db.query(Product).filter(Product.id == item["id"]).first()
            if p:
                p.quantity = max(0, p.quantity - item.get("qty", 1))
                
        tx = Transaction(
            session_id=f"s_{datetime.utcnow().timestamp()}",
            cart_items=json.dumps([i["name"] for i in req.cart]),
            coupon_shown=req.coupon_shown,
            coupon_accepted=1 if req.coupon_accepted else 0,
            total=total,
            savings=savings
        )
        db.add(tx)
        db.commit()
        
        background_tasks.add_task(simulate_sensor_tick)
        
        return {"success": True, "transaction_id": tx.id, "total": total}

# ─── KPIs & Analytics ───────────────────────────────────────────────────────
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
        low_stock = db.query(Product).filter(Product.quantity < 20).count()
        
        return {
            "liveRevenue": round(revenue, 2),
            "totalTransactions": len(txns),
            "couponsAccepted": accepted,
            "expiringProducts": expiring,
            "lowStockAlerts": low_stock,
            "occupancyRate": 85,
            "wasteRiskLevel": "High" if expiring > 5 else "Medium" if expiring > 0 else "Low"
        }

@app.get("/api/analytics")
def get_analytics():
    return {
        "salesTrends": [
            {"time": "10:00", "actual": 2000, "predicted": 2200},
            {"time": "11:00", "actual": 3500, "predicted": 3000},
            {"time": "12:00", "actual": 4000, "predicted": 4500},
            {"time": "13:00", "actual": 6000, "predicted": 6500},
            {"time": "14:00", "actual": 5500, "predicted": 5000},
            {"time": "15:00", "actual": 3000, "predicted": 3500},
        ],
        "turnoverByCategory": [
            {"category": "Fruits", "turnover": 4.5},
            {"category": "Vegetables", "turnover": 5.2},
            {"category": "Dairy", "turnover": 6.8},
            {"category": "Meat", "turnover": 3.1},
            {"category": "Frozen Food", "turnover": 2.4},
            {"category": "Drinks", "turnover": 4.8}
        ],
        "wasteMetrics": {
            "totalSaved_INR": 18450,
            "savedWeight_kg": 450,
            "byCategory": [
                {"name": "Dairy", "value": 400},
                {"name": "Fruits", "value": 300},
                {"name": "Vegetables", "value": 200},
                {"name": "Meat", "value": 100}
            ]
        },
        "couponAccuracy": {
            "sent": 140,
            "accepted": 92,
            "rate_pct": 65.7
        }
    }

@app.get("/api/ai-decisions")
def get_ai_decisions():
    with SessionLocal() as db:
        decisions = db.query(AIDecision).order_by(desc(AIDecision.created_at)).limit(30).all()
        return [{
            "id": d.id,
            "trigger": d.trigger,
            "action": d.action,
            "impact": d.impact,
            "status": d.status,
            "product_name": d.product_name,
            "model": d.model,
            "confidence": d.confidence
        } for d in decisions]

@app.post("/api/recommendations/{rec_id}/approve")
def approve(rec_id: int):
    # Auto-applied by agent - return success immediately
    return {"success": True, "message": "Decision already auto-applied by the autonomous agent."}

@app.post("/api/recommendations/{rec_id}/dismiss")
def dismiss(rec_id: int):
    return {"success": True, "message": "Decision dismissed."}

# ─── Live IoT & Sensor Streams ─────────
@app.get("/api/sensor-data")
def get_sensor_data():
    return {
        "temperature": LATEST_SENSOR["temperature"],
        "humidity": LATEST_SENSOR["humidity"],
        "gas_ppm": LATEST_SENSOR["gas_ppm"],
        "ph": LATEST_SENSOR["ph"],
        "timestamp": datetime.now().isoformat()
    }

@app.get("/api/ml-predictions")
def get_ml_predictions():
    with SessionLocal() as db:
        preds = db.query(MLPrediction).order_by(desc(MLPrediction.created_at)).limit(10).all()
    
    feature_importance = [
        {"feature": "Gas Concentration (ppm)", "importance": 42.0},
        {"feature": "Humidity (%)", "importance": 31.0},
        {"feature": "Temperature (°C)", "importance": 18.0},
        {"feature": "pH Level", "importance": 9.0}
    ]
    
    return {
        "model_accuracy": 94.2,
        "active_model": "Random Forest Classifier",
        "TinyML_edge_status": "Connected (ESP32)",
        "feature_importance": feature_importance,
        "recent_predictions": [{
            "id": p.id,
            "product_name": p.product_name,
            "prediction": p.prediction,
            "confidence": p.confidence,
            "model": p.model,
            "timestamp": p.created_at.isoformat()
        } for p in preds]
    }

# ─── Explainable AI (XAI) Endpoints ──────────────────────────────────────────
@app.post("/api/xai/health-score")
def xai_health_score(req: HealthScoreRequest):
    return xai.compute_health_score(
        req.freshness, req.temp_stability,
        req.humidity_control, req.gas_safety, req.ph_quality
    )

@app.post("/api/xai/discount")
def xai_discount(req: DiscountRequest):
    result = xai.compute_discount(
        req.expiry_urgency, req.overstock_score, req.spoilage_risk,
        req.demand_drop, req.low_sales_velocity,
        req.product_name, req.days_to_expiry,
        req.stock_remaining, req.weekly_sales
    )
    return result

@app.post("/api/xai/spoilage")
def xai_spoilage(req: SpoilageRequest):
    return xai.predict_spoilage(
        req.temperature, req.humidity, req.gas_ppm,
        req.ph, req.expiry_days, req.inventory_age_days
    )

@app.post("/api/xai/restock")
def xai_restock(req: RestockRequest):
    return xai.compute_restock(
        req.product_name, req.current_stock,
        req.avg_daily_sales, req.supplier_lead_days, req.safety_stock
    )

@app.post("/api/xai/product-selection")
def xai_product_selection(req: ProductSelectionRequest):
    return xai.evaluate_product_for_action(req.dict())

@app.post("/api/xai/traceability")
def xai_full_traceability(req: TraceabilityRequest):
    return xai.full_traceability_report(
        req.product_name, req.days_to_expiry, req.stock,
        req.weekly_sales, req.spoilage_prob, req.freshness,
        req.temp, req.humidity, req.gas_ppm, req.ph
    )

@app.get("/api/xai/audit-log")
def xai_audit_log(limit: int = 50):
    return {"audit_log": xai.get_audit_log(limit), "total": len(xai._AUDIT_LOG)}

@app.get("/api/xai/demo")
def xai_demo():
    return xai.full_traceability_report(
        product_name="Organic Yogurt",
        days_to_expiry=2,
        stock=340,
        weekly_sales=25,
        spoilage_prob=81.0,
        freshness=42.0,
        temp=9.2,
        humidity=78.0,
        gas_ppm=520.0,
        ph=4.8,
    )

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

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
