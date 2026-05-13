import sqlite3
import os

db_path = "smartai.db"
if not os.path.exists(db_path):
    print("DB not found")
else:
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM products LIMIT 5")
    rows = cursor.fetchall()
    print("Products:", rows)
    conn.close()
