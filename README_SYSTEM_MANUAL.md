# QWIC Smart AI Supermarket Operating System (AI-OS)
### 🌐 End-to-End Autonomous Store Operations, Telemetry, and Explainable AI (XAI)
---

Welcome to the **QWIC Smart AI Supermarket OS**—a state-of-the-art retail management platform that turns traditional catalog databases into dynamic, algorithmic, and self-replenishing inventory centers. 

This platform completely eliminates manual supermarket overhead by utilizing a team of concurrent **Machine Learning Models** and **Explainable AI (XAI) Engines** to automate shelf discounts, manage supply chains, optimize basket conversions, and predict biomass decay based on IoT sensors.

---

## 🛠️ The 5-Engine AI/ML Architecture

The core of the supermarket operations runs on **5 distinct artificial intelligence and algorithmic decision pipelines**, each optimized for a specific operational vertical:

### 1. Spoilage Classifier (Random Forest)
* **Vertical**: Refrigerator Telemetry & Freshness Evaluation.
* **Algorithm**: Random Forest Classifier + SHAP (SHapley Additive exPlanations).
* **Location in Code**: `simulate_sensor_tick()` in [main.py](file:///c:/Users/gowsh/OneDrive/Desktop/gOWSHIK%20DashBoard/main.py) & [xai_engine.py](file:///c:/Users/gowsh/OneDrive/Desktop/gOWSHIK%20DashBoard/xai_engine.py).
* **How it works**: Continuously samples live analog IoT metrics:
  - **Temperature** ($T$ in °C)
  - **Humidity** ($H$ in %)
  - **Gas Concentration** (Ethylene/Ammonia in ppm)
  - **pH Quality** ($pH$ level of food surface)
  It processes these metrics through an ensemble of decision boundaries to determine if a perishable catalog batch is `Fresh`, `Moderate`, or `Risky`.
* **Why this choice**: 
  - Outstanding resilience against noisy, drifting analog signals.
  - Extremely lightweight footprint, allowing it to be compiled into a **TinyML** C++ header and flashed directly onto low-cost local ESP32 edge microcontroller boards.

---

### 2. Explainable Linear Price Optimizer
* **Vertical**: Shelf Dynamic Discount Allocation.
* **Algorithm**: Multi-factor Weighted Linear Pricing.
* **Location in Code**: `xai_discount()` in [main.py](file:///c:/Users/gowsh/OneDrive/Desktop/gOWSHIK%20DashBoard/main.py) & `compute_discount()` in [xai_engine.py](file:///c:/Users/gowsh/OneDrive/Desktop/gOWSHIK%20DashBoard/xai_engine.py).
* **How it works**: Computes real-time dynamic discounts using a standardized weighted attribution formula:
  $$\text{Discount} = 0.40(\text{Expiry}) + 0.25(\text{Stock}) + 0.20(\text{Spoilage}) + 0.10(\text{Demand}) + 0.05(\text{Velocity})$$
* **Why this choice**: 
  - **Explainability (XAI)**: Investors and accountants dislike "black-box" models when it comes to financial transactions. 
  - By using a linear weighted attribution model, the system can generate a precise, audited breakdown of *why* a particular item received a discount (e.g. *Organic Milk received 35% off because of Expiry Urgency (15%) + Overstock buffer (20%)*).

---

### 3. Safety Reorder Optimizer
* **Vertical**: Automated Shelf Replenishment (PO Generator).
* **Algorithm**: Deterministic Economic Order Quantity (EOQ) buffer safety calculations.
* **Location in Code**: `simulate_sensor_tick()` and `xai_restock()` in [main.py](file:///c:/Users/gowsh/OneDrive/Desktop/gOWSHIK%20DashBoard/main.py).
* **How it works**: Uses average daily velocity and supplier transit times to continuously predict stockouts:
  $$\text{Reorder Point (RP)} = (\text{Avg Daily Sales} \times \text{Lead Time}) + \text{Safety Stock}$$
  The moment current stock levels fall below $\text{RP}$, the system automatically issues a supplier purchase order.
* **Why this choice**: Ensures that stockouts are prevented without human supervision, maintaining high store occupancy rates.

---

### 4. FP-Growth Coupon Mining Engine
* **Vertical**: Real-time POS Cross-selling & Kiosk Deals.
* **Algorithm**: FP-Growth (Frequent Pattern growth) association mining.
* **Location in Code**: `load_ml_rules()` and `find_coupon()` in [main.py](file:///c:/Users/gowsh/OneDrive/Desktop/gOWSHIK%20DashBoard/main.py).
* **How it works**: Evaluates a shopper's current basket items against a pre-compiled set of association rules to identify high-probability companion products:
  $$\text{Lift} = \frac{\text{Support}(A \cup B)}{\text{Support}(A) \times \text{Support}(B)}$$
  If the lift factor is greater than $1.5$, the customer checkout kiosk dynamically prompts them with a customized combo discount.
* **Why this choice**: 
  - FP-Growth is far more scalable than Apriori because it compresses databases into a compact FP-tree structure, enabling sub-millisecond mining over millions of transaction records.

---

### 5. Priority Selection Ranker Engine
* **Vertical**: Administrator Alerts Feed & Critical Priority.
* **Algorithm**: Normalized compound priority rating.
* **Location in Code**: [xai_engine.py](file:///c:/Users/gowsh/OneDrive/Desktop/gOWSHIK%20DashBoard/xai_engine.py).
* **How it works**: Compiles profit margins, transit delays, and perishability risks into an active alert score.
* **Why this choice**: Minimizes dashboard clutter, focusing manager attention on critical batches with high financial risk.

---

## 📊 Training Data & Sources

The ML models are trained on three distinct, high-fidelity datasets available in this project:

| Model | Training Dataset Source | Location in Workspace | Description |
| --- | --- | --- | --- |
| **FP-Growth (Internet Model)** | Public Groceries Database (UCI / Kaggle) | `temp_groceries.csv` (automated download) | Real-world customer supermarket purchase logs containing 9,835 unique transaction sets. |
| **FP-Growth (Big Data Model)** | Synthetic Massive Shopping Dataset | [massive_sales_data.csv](file:///c:/Users/gowsh/OneDrive/Desktop/gOWSHIK%20DashBoard/ml_models/massive_sales_data.csv) (410 MB) | 2,000,000 generated transactions modeling complex market basket patterns. |
| **Spoilage Classifier** | Simulated Refrigerator Sensors | [smartai.db](file:///c:/Users/gowsh/OneDrive/Desktop/gOWSHIK%20DashBoard/smartai.db) | A high-frequency SQL stream capturing temperature, humidity, pH, and ethylene gas parameters. |

---

## 🏃 Setup & Operation Guide

Follow these commands to interact, train, and run the complete ecosystem.

### Step 1: Retrain the Machine Learning Models
You can run the training scripts to recalculate the basket association rules.

* **To train on custom category patterns (Fast & Lightweight)**:
  ```bash
  python ml_models/train_model.py
  ```
* **To train on the real public groceries dataset downloaded from the internet**:
  ```bash
  python ml_models/train_model.py --internet
  ```
* **To train on the massive 410 MB transaction log database**:
  ```bash
  python ml_models/train_on_massive.py
  ```

---

### Step 2: Spin Up the FastAPI Server
The backend automates database seeding, runs the IoT drift drift tick simulation, and hosts the XAI endpoints:
```bash
python main.py
```
* **Health Check**: Verify the backend health by visiting: `http://localhost:8000/api/health`
* **XAI Demo**: Request a detailed explanation trace of Yogurt: `http://localhost:8000/api/xai/demo`

---

### Step 3: Launch the React Dashboard & Kiosk
Start the Vite developer environment:
```bash
npm run dev
```
Open `http://localhost:3000/` in your browser. You can:
1. Inspect the **IoT Sensor Stream** and live **Automatically Executed Decisions**.
2. Click the **"User Checkout Kiosk"** tab to simulate customer purchases.
3. Click on any product card to view a slide-out **Explainable AI (XAI)** decision trace detailing exactly why the discount was calculated!

---

## 🛡️ Financial Transparency & Explainability (XAI)
The system **never** behaves like a black-box. If an investor or supervisor requests a compliance check, the platform provides:
1. **Exact Feature Contributions**: Breaks down the percentage contribution of every variable (e.g. Expiry, Overstock, Spoilage).
2. **Formula Auditability**: Displays the exact mathematical equation used to execute the discount or safety restock order.
3. **Database Audit Logs**: Persists every automated action under `ml_predictions` and `ai_decisions` tables in SQLite, ensuring zero database drift.
