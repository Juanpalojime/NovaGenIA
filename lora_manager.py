"""
LoRA Manager for Advanced LoRA Management

Manages LoRA models including scanning, indexing, combining multiple LoRAs,
and generating previews.
"""

import os
import json
import torch
from typing import List, Dict, Optional
from pathlib import Path
from dataclasses import dataclass, asdict
import logging

logger = logging.getLogger(__name__)


@dataclass
class LoRAMetadata:
    """Metadata for a LoRA model"""
    id: str
    name: str
    path: str
    description: str = ""
    tags: List[str] = None
    preview_image: Optional[str] = None
    trigger_words: List[str] = None
    base_model: str = "SDXL"
    version: str = "1.0"
    author: str = ""
    created_at: Optional[str] = None
    
    def __post_init__(self):
        if self.tags is None:
            self.tags = []
        if self.trigger_words is None:
            self.trigger_words = []
    
    def to_dict(self) -> dict:
        return asdict(self)


class LoRAManager:
    """Manages LoRA models"""
    
    def __init__(self, lora_dir: str = "models/loras"):
        self.lora_dir = Path(lora_dir)
        self.loras: Dict[str, LoRAMetadata] = {}
        self.lora_dir.mkdir(parents=True, exist_ok=True)
        self._scan_loras()
    
    def _scan_loras(self):
        """Scan directory for LoRA files"""
        logger.info(f"Scanning for LoRAs in {self.lora_dir}")
        
        # Supported extensions
        extensions = ['.safetensors', '.pt', '.ckpt']
        
        for ext in extensions:
            for lora_file in self.lora_dir.glob(f"*{ext}"):
                lora_id = lora_file.stem
                metadata_file = lora_file.with_suffix('.json')
                
                # Load metadata if exists
                if metadata_file.exists():
                    try:
                        with open(metadata_file, 'r') as f:
                            metadata_dict = json.load(f)
                            metadata = LoRAMetadata(
                                id=lora_id,
                                path=str(lora_file),
                                **metadata_dict
                            )
                    except Exception as e:
                        logger.error(f"Error loading metadata for {lora_id}: {e}")
                        metadata = self._create_default_metadata(lora_id, lora_file)
                else:
                    metadata = self._create_default_metadata(lora_id, lora_file)
                
                self.loras[lora_id] = metadata
                logger.info(f"Found LoRA: {metadata.name}")
        
        logger.info(f"Total LoRAs found: {len(self.loras)}")
    
    def _create_default_metadata(self, lora_id: str, lora_file: Path) -> LoRAMetadata:
        """Create default metadata for a LoRA without metadata file"""
        return LoRAMetadata(
            id=lora_id,
            name=lora_id.replace('_', ' ').title(),
            path=str(lora_file),
            description=f"LoRA model: {lora_id}",
            tags=["custom"]
        )
    
    def get_all_loras(self) -> List[Dict]:
        """Get list of all available LoRAs"""
        return [lora.to_dict() for lora in self.loras.values()]
    
    def get_lora(self, lora_id: str) -> Optional[Dict]:
        """Get specific LoRA by ID"""
        if lora_id in self.loras:
            return self.loras[lora_id].to_dict()
        return None
    
    def search_loras(self, query: str = "", tags: List[str] = None) -> List[Dict]:
        """Search LoRAs by query and tags"""
        results = []
        query_lower = query.lower()
        
        for lora in self.loras.values():
            # Check query match
            if query and query_lower not in lora.name.lower() and query_lower not in lora.description.lower():
                continue
            
            # Check tags match
            if tags and not any(tag in lora.tags for tag in tags):
                continue
            
            results.append(lora.to_dict())
        
        return results
    
    def save_metadata(self, lora_id: str, metadata: dict):
        """Save metadata for a LoRA"""
        if lora_id not in self.loras:
            raise ValueError(f"LoRA {lora_id} not found")
        
        lora = self.loras[lora_id]
        metadata_file = Path(lora.path).with_suffix('.json')
        
        # Update metadata
        for key, value in metadata.items():
            if hasattr(lora, key):
                setattr(lora, key, value)
        
        # Save to file
        with open(metadata_file, 'w') as f:
            json.dump({
                'name': lora.name,
                'description': lora.description,
                'tags': lora.tags,
                'trigger_words': lora.trigger_words,
                'author': lora.author,
                'version': lora.version
            }, f, indent=2)
        
        logger.info(f"Metadata saved for LoRA: {lora_id}")
    
    def load_lora_weights(self, lora_id: str) -> Optional[dict]:
        """Load LoRA weights from file"""
        if lora_id not in self.loras:
            return None
        
        lora_path = self.loras[lora_id].path
        try:
            if lora_path.endswith('.safetensors'):
                from safetensors.torch import load_file
                weights = load_file(lora_path)
            else:
                weights = torch.load(lora_path, map_location='cpu')
            
            logger.info(f"Loaded LoRA weights: {lora_id}")
            return weights
        except Exception as e:
            logger.error(f"Error loading LoRA {lora_id}: {e}")
            return None
    
    def combine_loras(self, lora_configs: List[Dict[str, float]]) -> Optional[dict]:
        """
        Combine multiple LoRAs with specified weights.
        
        Args:
            lora_configs: List of dicts with 'id' and 'weight' keys
                         e.g., [{'id': 'lora1', 'weight': 0.8}, {'id': 'lora2', 'weight': 0.5}]
        
        Returns:
            Combined LoRA weights dictionary
        """
        if not lora_configs:
            return None
        
        combined_weights = {}
        
        for config in lora_configs:
            lora_id = config.get('id')
            weight = config.get('weight', 1.0)
            
            weights = self.load_lora_weights(lora_id)
            if weights is None:
                logger.warning(f"Skipping LoRA {lora_id} - failed to load")
                continue
            
            # Combine weights
            for key, value in weights.items():
                if key not in combined_weights:
                    combined_weights[key] = value * weight
                else:
                    combined_weights[key] += value * weight
        
        logger.info(f"Combined {len(lora_configs)} LoRAs")
        return combined_weights if combined_weights else None


# Global LoRA manager instance
lora_manager = LoRAManager()
