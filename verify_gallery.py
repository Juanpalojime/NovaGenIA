import sys
from unittest.mock import MagicMock

# Mock module dictionary
modules_to_mock = [
    "torch",
    "diffusers",
    "uvicorn",
    "cv2"
]

for module in modules_to_mock:
    sys.modules[module] = MagicMock()

import os
import io
import json
import base64
from fastapi.testclient import TestClient

# Must mock imports inside server.py before importing it
# But since we already mocked via sys.modules, normal imports in server.py should get the mocks.

# We need to ensure 'server' can be imported.
# server.py imports: 
# import os
# import torch (MOCKED)
# import uvicorn (MOCKED)
# from fastapi import FastAPI, BackgroundTasks (REAL)
# from fastapi.staticfiles import StaticFiles (REAL)
# from fastapi.middleware.cors import CORSMiddleware (REAL)
# from diffusers import StableDiffusionXLPipeline (MOCKED)
# from pydantic import BaseModel (REAL)
# import base64
# from io import BytesIO
# import subprocess
# import time
# from glob import glob

try:
    from server import app
except ImportError as e:
    print(f"Failed to import server: {e}")
    # If pydantic or fastapi are missing, we can't test.
    sys.exit(1)

client = TestClient(app)

def test_gallery():
    # Setup
    os.makedirs("outputs", exist_ok=True)
    # Create dummy file with timestamp current
    import time
    timestamp = int(time.time() * 1000)
    filename = f"gen_test_{timestamp}.png"
    filepath = os.path.join("outputs", filename)
    with open(filepath, "w") as f:
        f.write("dummy content")
    
    print(f"Created dummy file: {filepath}")

    # Test endpoint
    try:
        response = client.get("/gallery")
        print(f"Status Code: {response.status_code}")
        
        if response.status_code != 200:
             print(f"Error Content: {response.content}")
        
        assert response.status_code == 200
        data = response.json()
        
        print("Gallery response:", json.dumps(data, indent=2))
        
        assert len(data) > 0
        found = False
        for item in data:
            if item["id"] == filename:
                found = True
                assert item["url"] == f"http://localhost:7860/outputs/{filename}"
                break
        
        assert found, f"File {filename} not found in gallery response"
        print("✅ Verification Succeeded!")
        
    finally:
        # Cleanup
        if os.path.exists(filepath):
            os.remove(filepath)

if __name__ == "__main__":
    test_gallery()
