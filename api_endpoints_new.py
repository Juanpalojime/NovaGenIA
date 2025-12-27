"""
Additional API Endpoints for NovaGenIA

GPU Management, LoRA Management, and Model Hub endpoints.
Add these to server.py before the main block.
"""

# ==================== GPU Management ====================

from gpu_manager import gpu_manager

@app.get("/gpu/status")
def get_gpu_status():
    """Get GPU status and information"""
    return gpu_manager.get_status()

# ==================== LoRA Management ====================

from lora_manager import lora_manager
from pydantic import BaseModel
from typing import List, Dict

class LoRACombineRequest(BaseModel):
    loras: List[Dict[str, float]]  # [{"id": "lora1", "weight": 0.8}, ...]
    prompt: str
    negative_prompt: str = ""
    mode: str = "speed"
    aspect_ratio: str = "1:1"
    seed: int = -1

@app.get("/loras")
def get_loras():
    """Get all available LoRAs"""
    return lora_manager.get_all_loras()

@app.get("/loras/{lora_id}")
def get_lora_details(lora_id: str):
    """Get details for a specific LoRA"""
    lora = lora_manager.get_lora(lora_id)
    if not lora:
        raise HTTPException(404, f"LoRA {lora_id} not found")
    return lora

@app.post("/loras/search")
def search_loras(query: str = "", tags: List[str] = None):
    """Search LoRAs by query and tags"""
    return lora_manager.search_loras(query, tags or [])

# ==================== Model Hub ====================

from model_hub import model_hub

class ModelSearchRequest(BaseModel):
    query: str = ""
    model_type: str = "all"
    limit: int = 20

class ModelDownloadRequest(BaseModel):
    model_id: str
    model_type: str = "checkpoint"

@app.post("/hub/search")
def search_models(req: ModelSearchRequest):
    """Search models on Hugging Face Hub"""
    return model_hub.search_models(req.query, req.model_type, req.limit)

@app.post("/hub/download")
async def download_model(req: ModelDownloadRequest):
    """Download a model from Hugging Face Hub"""
    result = await model_hub.download_model(req.model_id, req.model_type)
    return result

@app.get("/hub/installed")
def get_installed_models():
    """Get list of installed models"""
    return model_hub.get_installed_models()

@app.delete("/hub/models/{model_path:path}")
def delete_model(model_path: str):
    """Delete an installed model"""
    success = model_hub.delete_model(model_path)
    if success:
        return {"status": "success", "message": "Model deleted"}
    raise HTTPException(500, "Failed to delete model")
