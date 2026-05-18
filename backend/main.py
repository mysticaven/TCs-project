import os
import sys
import uvicorn

# Change active directory to root so that relative files (.db, CSV, dist) work perfectly
root_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
os.chdir(root_dir)
if root_dir not in sys.path:
    sys.path.insert(0, root_dir)

print("\n🚀 [SmartAI] Auto-forwarding 'backend/main.py' to root 'main.py'...")
print(f"   📂 Set Working Directory: {root_dir}")
print("   🌐 Starting FastAPI Backend on http://localhost:8000...\n")

if __name__ == "__main__":
    port = int(os.getenv("PORT", 8000))
    uvicorn.run("main:app", host="0.0.0.0", port=port, reload=True)