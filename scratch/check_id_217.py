import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from main import SessionLocal, Product
with SessionLocal() as db:
    p = db.query(Product).filter(Product.id == 217).first()
    if p:
        print(f"ID: {p.id}, Name: '{p.name}', Category: '{p.category}', Price: {p.price}")
    else:
        print("Product 217 not found")
