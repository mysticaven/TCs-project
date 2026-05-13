import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from main import SessionLocal, Product
with SessionLocal() as db:
    products = db.query(Product).limit(5).all()
    for p in products:
        print(f"ID: {p.id}, Name: '{p.name}', Category: '{p.category}', Price: {p.price}")
