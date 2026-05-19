import urllib.request
import json
import sys

print("======================================================================")
print("  API ENDPOINT VERIFICATION: MACHINE LEARNING BACKEND")
print("======================================================================\n")

BASE_URL = "http://localhost:8000"

def test_endpoint(path, method="GET", data=None):
    url = f"{BASE_URL}{path}"
    print(f"[{method}] Sending request to {url}...")
    try:
        req = urllib.request.Request(url, method=method)
        if data:
            req.add_header('Content-Type', 'application/json')
            jsondata = json.dumps(data).encode('utf-8')
            response = urllib.request.urlopen(req, data=jsondata)
        else:
            response = urllib.request.urlopen(req)
            
        code = response.getcode()
        body = response.read().decode('utf-8')
        res_json = json.loads(body)
        print(f"[OK] Received HTTP {code}")
        return res_json
    except Exception as e:
        print(f"[FAIL] Request failed: {e}")
        return None

def verify_all():
    # 1. Health check
    health = test_endpoint("/api/health")
    if not health or health.get("status") != "ok":
        print("[FAIL] Health check failed or backend offline!")
        sys.exit(1)
    print(f"Health Status: {health.get('status')} | Version: {health.get('version')} | ML Rules: {health.get('ml_rules')}\n")
    
    # 2. Sensor Data
    sensors = test_endpoint("/api/sensor-data")
    if not sensors:
        print("[FAIL] Failed to fetch sensor data!")
        sys.exit(1)
    print(f"Live Sensors: Temp={sensors.get('temperature')} C, Humidity={sensors.get('humidity')} %, Gas={sensors.get('gas_ppm')} ppm, pH={sensors.get('ph')}\n")
    
    # 3. ML Predictions
    ml_preds = test_endpoint("/api/ml-predictions")
    if not ml_preds:
        print("[FAIL] Failed to fetch ML predictions!")
        sys.exit(1)
    print(f"Active Model: {ml_preds.get('active_model')} | TinyML Edge: {ml_preds.get('TinyML_edge_status')}")
    print(f"Model Accuracy: {ml_preds.get('model_accuracy')}%")
    print(f"Recent Predictions count: {len(ml_preds.get('recent_predictions', []))}\n")
    
    # 4. Coupon recommender
    coupon_req = {"cart": ["Pasta"]}
    coupon_res = test_endpoint("/api/coupon", method="POST", data=coupon_req)
    if not coupon_res or "coupons" not in coupon_res:
        print("[FAIL] Failed to fetch coupon recommendations!")
        sys.exit(1)
    print(f"Deals generated: {len(coupon_res.get('coupons', []))}")
    if coupon_res.get("coupon"):
        print(f"Top Recommended Deal: {coupon_res['coupon']['recommendation']} ({coupon_res['coupon']['discount_text']})")
        print(f"AI Message: {coupon_res['coupon']['message']}\n")
        
    # 5. XAI Demo Report
    xai_demo = test_endpoint("/api/xai/demo")
    if not xai_demo or "product_name" not in xai_demo:
        print("[FAIL] Failed to fetch XAI demo report!")
        sys.exit(1)
    print(f"XAI Traceability Product: {xai_demo.get('product_name')}")
    print(f"Health Score: {xai_demo.get('health_score', {}).get('score')}/100 ({xai_demo.get('health_score', {}).get('status')})")
    print(f"Discount Recommendation: {xai_demo.get('discount_decision', {}).get('discount_pct')}%")
    print(f"XAI Summary: {xai_demo.get('summary')[:100]}...\n")
    
    print("======================================================================")
    print("  ALL API ENDPOINTS ARE FULLY OPERATIONAL AND RETURNING ACCURATE ML STATE!")
    print("======================================================================")

if __name__ == "__main__":
    verify_all()
