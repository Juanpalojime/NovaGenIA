"""
Model Hub Integration

Integrates with Hugging Face Hub for discovering, downloading,
and managing community models.
"""

import os
import asyncio
from typing import List, Dict, Optional
from pathlib import Path
import logging

logger = logging.getLogger(__name__)

try:
    from huggingface_hub import HfApi, hf_hub_download, scan_cache_dir
    HF_AVAILABLE = True
except ImportError:
    HF_AVAILABLE = False
    logger.warning("huggingface_hub not installed - Model Hub features unavailable")


class ModelHub:
    """Manages Hugging Face model discovery and downloads"""
    
    def __init__(self, cache_dir: str = "models/hub_cache"):
        self.cache_dir = Path(cache_dir)
        self.cache_dir.mkdir(parents=True, exist_ok=True)
        self.api = HfApi() if HF_AVAILABLE else None
        self.active_downloads: Dict[str, float] = {}  # download_id -> progress
    
    def search_models(
        self,
        query: str = "",
        model_type: str = "all",
        limit: int = 20
    ) -> List[Dict]:
        """
        Search for models on Hugging Face Hub
        
        Args:
            query: Search query
            model_type: Type filter (checkpoint, lora, vae, controlnet, all)
            limit: Maximum results
        
        Returns:
            List of model information dictionaries
        """
        if not HF_AVAILABLE:
            return []
        
        try:
            # Map model types to HF tags
            tag_mapping = {
                "checkpoint": "stable-diffusion-xl",
                "lora": "lora",
                "vae": "vae",
                "controlnet": "controlnet",
                "all": None
            }
            
            tag = tag_mapping.get(model_type)
            
            # Search models
            models = self.api.list_models(
                search=query,
                tags=[tag] if tag else None,
                library="diffusers",
                limit=limit,
                sort="downloads",
                direction=-1
            )
            
            results = []
            for model in models:
                results.append({
                    "id": model.modelId,
                    "name": model.modelId.split('/')[-1],
                    "author": model.author or model.modelId.split('/')[0],
                    "downloads": getattr(model, 'downloads', 0),
                    "likes": getattr(model, 'likes', 0),
                    "tags": model.tags or [],
                    "created_at": str(model.created_at) if hasattr(model, 'created_at') else None,
                    "last_modified": str(model.lastModified) if hasattr(model, 'lastModified') else None,
                })
            
            logger.info(f"Found {len(results)} models for query: {query}")
            return results
            
        except Exception as e:
            logger.error(f"Error searching models: {e}")
            return []
    
    async def download_model(
        self,
        model_id: str,
        model_type: str = "checkpoint",
        progress_callback: Optional[callable] = None
    ) -> Dict:
        """
        Download a model from Hugging Face Hub
        
        Args:
            model_id: HuggingFace model ID (e.g., "stabilityai/stable-diffusion-xl-base-1.0")
            model_type: Type of model
            progress_callback: Optional callback for progress updates
        
        Returns:
            Dictionary with download status and path
        """
        if not HF_AVAILABLE:
            return {"success": False, "error": "Hugging Face Hub not available"}
        
        download_id = f"{model_id}_{model_type}"
        self.active_downloads[download_id] = 0.0
        
        try:
            # Determine target directory
            type_dirs = {
                "checkpoint": "models/checkpoints",
                "lora": "models/loras",
                "vae": "models/vae",
                "controlnet": "models/controlnet"
            }
            target_dir = Path(type_dirs.get(model_type, "models/hub"))
            target_dir.mkdir(parents=True, exist_ok=True)
            
            # Download model files
            # For simplicity, we'll download the main model file
            # In production, you'd want to download all necessary files
            
            logger.info(f"Starting real download: {model_id}")
            
            # Determine filename - in a real scenario we might need to search for the best file
            # For this implementation, we'll try to find common SDXL model filenames
            filename = "model.safetensors"
            
            # Use hf_hub_download with progress monitoring
            def hf_callback(progress_info):
                # Simple progress calculation if available from HF
                if progress_callback and 'total' in progress_info and progress_info['total'] > 0:
                    prog = (progress_info['current'] / progress_info['total']) * 100
                    self.active_downloads[download_id] = prog
                    asyncio.run_coroutine_threadsafe(
                        progress_callback(download_id, prog),
                        asyncio.get_event_loop()
                    )

            # Note: hf_hub_download is synchronous, so we run it in a thread for real use
            # but for this async method we can use loop.run_in_executor
            loop = asyncio.get_event_loop()
            file_path = await loop.run_in_executor(
                None,
                lambda: hf_hub_download(
                    repo_id=model_id,
                    filename=filename,
                    cache_dir=str(self.cache_dir),
                    resume_download=True
                )
            )
            
            # Move/Symlink to target directory
            model_name = model_id.split('/')[-1]
            final_path = target_dir / f"{model_name}.safetensors"
            
            import shutil
            shutil.copy2(file_path, final_path)
            
            logger.info(f"Download completed: {final_path}")
            self.active_downloads[download_id] = 100.0
            if progress_callback:
                await progress_callback(download_id, 100.0)
            
            del self.active_downloads[download_id]
            
            return {
                "success": True,
                "model_id": model_id,
                "path": str(target_dir / f"{model_id.split('/')[-1]}.safetensors"),
                "message": "Download completed"
            }
            
        except Exception as e:
            logger.error(f"Error downloading model {model_id}: {e}")
            if download_id in self.active_downloads:
                del self.active_downloads[download_id]
            return {
                "success": False,
                "error": str(e)
            }
    
    def get_download_progress(self, download_id: str) -> Optional[float]:
        """Get progress of an active download"""
        return self.active_downloads.get(download_id)
    
    def get_installed_models(self) -> List[Dict]:
        """Get list of installed models from cache"""
        installed = []
        
        # Scan model directories
        model_dirs = [
            ("checkpoints", "models/checkpoints"),
            ("loras", "models/loras"),
            ("vae", "models/vae"),
            ("controlnet", "models/controlnet")
        ]
        
        for model_type, dir_path in model_dirs:
            dir_path = Path(dir_path)
            if not dir_path.exists():
                continue
            
            for model_file in dir_path.glob("*.safetensors"):
                installed.append({
                    "id": model_file.stem,
                    "name": model_file.stem,
                    "type": model_type,
                    "path": str(model_file),
                    "size_mb": model_file.stat().st_size / (1024 * 1024)
                })
        
        return installed
    
    def delete_model(self, model_path: str) -> bool:
        """Delete an installed model"""
        try:
            path = Path(model_path)
            if path.exists():
                path.unlink()
                logger.info(f"Deleted model: {model_path}")
                return True
        except Exception as e:
            logger.error(f"Error deleting model {model_path}: {e}")
        return False


# Global model hub instance
model_hub = ModelHub()
