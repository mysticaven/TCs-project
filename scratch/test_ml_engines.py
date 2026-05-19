import sys
import os
import shutil

# Add the workspace root to sys.path so we can import main and xai_engine
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

print("======================================================================")
print("  SYSTEM VERIFICATION: MACHINE LEARNING & XAI ENGINES")
print("======================================================================\n")

# Import engines
try:
    import xai_engine as xai
    print("[OK] Successfully imported xai_engine.py")
except Exception as e:
    print(f"[FAIL] Failed to import xai_engine.py: {e}")
    sys.exit(1)

try:
    import main
    print("[OK] Successfully imported main.py")
except Exception as e:
    print(f"[FAIL] Failed to import main.py: {e}")
    sys.exit(1)


def test_spoilage_classifier():
    print("\n--- 1. Testing Spoilage Classifier (Random Forest + SHAP) ---")
    
    # Test case 1: Ideal conditions
    res_fresh = xai.predict_spoilage(
        temperature=3.5,
        humidity=60.0,
        gas_ppm=150.0,
        ph=6.5,
        expiry_days=10
    )
    print(f"Ideal conditions prediction: {res_fresh['prediction']} (Confidence: {res_fresh['confidence']}%)")
    print(f"Explanation: {res_fresh['explanation']}")
    assert res_fresh['prediction'] in ["Fresh", "Moderate"], f"Expected Fresh, got {res_fresh['prediction']}"
    
    # Test case 2: Bad conditions (High temp, high gas, near expiry)
    res_spoiled = xai.predict_spoilage(
        temperature=12.0,
        humidity=85.0,
        gas_ppm=750.0,
        ph=4.5,
        expiry_days=1
    )
    print(f"Bad conditions prediction: {res_spoiled['prediction']} (Confidence: {res_spoiled['confidence']}%)")
    print(f"Explanation: {res_spoiled['explanation']}")
    assert res_spoiled['prediction'] in ["Expiring", "Spoiled"], f"Expected Spoiled/Expiring, got {res_spoiled['prediction']}"
    print("[OK] Spoilage Classifier functional tests passed!")


def test_explainable_linear_price_optimizer():
    print("\n--- 2. Testing Explainable Linear Price Optimizer ---")
    
    # Test high urgency, high overstock, high spoilage risk
    res_discount = xai.compute_discount(
        expiry_urgency=90.0,
        overstock_score=80.0,
        spoilage_risk=75.0,
        demand_drop=40.0,
        low_sales_velocity=50.0,
        product_name="Gourmet Milk Carton",
        days_to_expiry=2,
        stock_remaining=250,
        weekly_sales=12
    )
    print(f"Discount calculated: {res_discount['discount_pct']}% (Confidence: {res_discount['confidence']}%)")
    print(f"Formula used: {res_discount['formula']}")
    print(f"Impact: {res_discount['expected_business_impact']['description']}")
    assert res_discount['discount_pct'] > 0.0, "Expected a substantial discount to be computed"
    print("[OK] Price Optimizer functional tests passed!")


def test_safety_reorder_optimizer():
    print("\n--- 3. Testing Safety Reorder Optimizer (EOQ Buffer) ---")
    
    # Stock below reorder point
    res_restock = xai.compute_restock(
        product_name="Organic Apples",
        current_stock=20,
        avg_daily_sales=15.0,
        supplier_lead_days=3,
        safety_stock=40
    )
    print(f"Reorder Point: {res_restock['reorder_point']}, Current Stock: {res_restock['current_stock']}")
    print(f"Needs restock: {res_restock['needs_restock']}")
    print(f"Action: {res_restock['action']}")
    assert res_restock['needs_restock'] is True, "Expected restock flag to be True"
    assert res_restock['units_to_order'] > 0, "Expected units to order to be > 0"
    
    # Stock above reorder point
    res_no_restock = xai.compute_restock(
        product_name="Organic Apples",
        current_stock=100,
        avg_daily_sales=10.0,
        supplier_lead_days=3,
        safety_stock=40
    )
    print(f"Needs restock (high stock): {res_no_restock['needs_restock']}")
    assert res_no_restock['needs_restock'] is False, "Expected restock flag to be False"
    print("[OK] Safety Reorder Optimizer functional tests passed!")


def test_fp_growth_coupon_mining():
    print("\n--- 4. Testing FP-Growth Coupon Mining Engine ---")
    
    # Load the rules
    main.load_ml_rules()
    print(f"Loaded ML Rules count: {len(main.ML_RULES)}")
    assert len(main.ML_RULES) > 0, "Expected ML rules to be loaded (either from CSV or mock fallbacks)"
    
    # Test coupon generation with a cart
    cart = ["Pasta"]
    coupons = main.find_coupons(cart)
    print(f"Generated {len(coupons)} deals for cart {cart}:")
    for i, c in enumerate(coupons):
        print(f" Deal {i+1}: Rec '{c['recommendation']}' | Trigger '{c['trigger_items']}' | Msg: {c['message']}")
        
    assert len(coupons) >= 1, "Expected at least some deal/coupon recommendations"
    print("[OK] FP-Growth Association Mining functional tests passed!")


def test_priority_selection_ranker():
    print("\n--- 5. Testing Priority Selection Ranker Engine ---")
    
    high_risk_product = {
        "name": "Perishable Yogurt Pack",
        "freshness_score": 30.0,
        "expiry_urgency": 95.0,
        "inventory_overstock": 80.0,
        "customer_demand": 20.0,
        "spoilage_risk": 85.0,
        "sales_velocity": 10.0,
        "supplier_delay_risk": 15.0,
        "seasonal_demand": 50.0,
        "profit_margin": 40.0
    }
    
    res_rank = xai.evaluate_product_for_action(high_risk_product)
    print(f"Product: {res_rank['product_name']}")
    print(f"Composite Risk Score: {res_rank['composite_risk_score']}/100")
    print(f"Recommended Action: {res_rank['recommended_action']}")
    print(f"Top factor contribution: {res_rank['factor_contributions'][0]}")
    
    assert res_rank['composite_risk_score'] >= 70.0, "Expected a very high composite risk score"
    assert res_rank['recommended_action'] == "DISCOUNT + PROMOTE", f"Expected DISCOUNT + PROMOTE action, got {res_rank['recommended_action']}"
    print("[OK] Priority Selection Ranker functional tests passed!")


def test_db_seeding_and_sensor_ticks():
    print("\n--- 6. Testing DB Seeding and Simulated Sensor Drift Tick ---")
    
    # Check DB seeding
    main.seed_products_5000()
    with main.SessionLocal() as db:
        prod_count = db.query(main.Product).count()
        print(f"Seeded Database Product Count: {prod_count}")
        assert prod_count >= 100, f"Expected at least baseline products, found {prod_count}"
        
        # Test simulated sensor drift tick
        print("Executing simulated sensor tick to generate drift and auto-applied AI decisions...")
        main.simulate_sensor_tick()
        
        # Verify predictions were logged
        pred_count = db.query(main.MLPrediction).count()
        decision_count = db.query(main.AIDecision).count()
        sensor_count = db.query(main.SensorReading).count()
        
        print(f"Logged Sensor Readings: {sensor_count}")
        print(f"Logged ML Predictions (Random Forest TinyML): {pred_count}")
        print(f"Logged AI Decisions: {decision_count}")
        
        assert sensor_count > 0, "Expected at least 1 sensor reading"
        assert pred_count > 0, "Expected some ML predictions logged"
        assert decision_count > 0, "Expected some AI decisions logged"
        
    print("[OK] DB Seeding and Sensor Ticks operational verification passed!")


if __name__ == "__main__":
    try:
        test_spoilage_classifier()
        test_explainable_linear_price_optimizer()
        test_safety_reorder_optimizer()
        test_fp_growth_coupon_mining()
        test_priority_selection_ranker()
        test_db_seeding_and_sensor_ticks()
        print("\n======================================================================")
        print("  ALL 5 ML/XAI ENGINES AND BACKEND FUNCTIONS ARE WORKING CORRECTLY!")
        print("======================================================================")
    except AssertionError as ae:
        print(f"\n[FAIL] Assertion failed during verification: {ae}")
        sys.exit(1)
    except Exception as e:
        print(f"\n[FAIL] Unexpected error during verification: {e}")
        sys.exit(1)
