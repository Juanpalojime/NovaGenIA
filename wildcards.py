"""
Wildcards System

Sistema de reemplazo dinámico en prompts para mayor variedad.
Inspirado en Fooocus wildcards.
"""

import random
from pathlib import Path
import json

# Wildcards predefinidos
DEFAULT_WILDCARDS = {
    "color": ["red", "blue", "green", "yellow", "purple", "orange", "pink", "black", "white", "gold", "silver", "bronze"],
    "mood": ["happy", "sad", "angry", "peaceful", "energetic", "calm", "mysterious", "dramatic", "serene", "intense"],
    "style": ["realistic", "anime", "cartoon", "oil painting", "watercolor", "digital art", "3d render", "pixel art"],
    "lighting": ["soft lighting", "dramatic lighting", "golden hour", "blue hour", "studio lighting", "natural light", "neon lights", "candlelight"],
    "weather": ["sunny", "cloudy", "rainy", "snowy", "foggy", "stormy", "clear sky", "overcast"],
    "time": ["dawn", "morning", "noon", "afternoon", "dusk", "evening", "night", "midnight"],
    "season": ["spring", "summer", "autumn", "winter"],
    "camera": ["wide angle", "telephoto", "macro", "fisheye", "portrait lens", "50mm", "35mm", "85mm"],
    "quality": ["masterpiece", "best quality", "high quality", "ultra detailed", "8k", "4k", "hd"],
}

class WildcardManager:
    def __init__(self, wildcards_dir: str = "wildcards"):
        self.wildcards_dir = Path(wildcards_dir)
        self.wildcards = DEFAULT_WILDCARDS.copy()
        self._load_custom_wildcards()
    
    def _load_custom_wildcards(self):
        """Load custom wildcards from files"""
        if not self.wildcards_dir.exists():
            self.wildcards_dir.mkdir(parents=True, exist_ok=True)
            return
        
        for file in self.wildcards_dir.glob("*.txt"):
            name = file.stem
            with open(file, 'r', encoding='utf-8') as f:
                options = [line.strip() for line in f if line.strip()]
                if options:
                    self.wildcards[name] = options
    
    def process_prompt(self, prompt: str) -> str:
        """Process prompt replacing wildcards with random choices"""
        import re
        
        # Find all wildcards in format {wildcard}
        pattern = r'\{([^}]+)\}'
        matches = re.findall(pattern, prompt)
        
        result = prompt
        for match in matches:
            if match in self.wildcards:
                replacement = random.choice(self.wildcards[match])
                result = result.replace(f'{{{match}}}', replacement, 1)
        
        return result
    
    def add_wildcard(self, name: str, options: list):
        """Add or update a wildcard"""
        self.wildcards[name] = options
        
        # Save to file
        file_path = self.wildcards_dir / f"{name}.txt"
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write('\n'.join(options))
    
    def get_wildcard(self, name: str) -> list:
        """Get wildcard options"""
        return self.wildcards.get(name, [])
    
    def get_all_wildcards(self) -> dict:
        """Get all available wildcards"""
        return self.wildcards.copy()

# Global instance
wildcard_manager = WildcardManager()

def process_wildcards(prompt: str) -> str:
    """Process wildcards in prompt"""
    return wildcard_manager.process_prompt(prompt)

def get_available_wildcards() -> list:
    """Get list of available wildcard names"""
    return list(wildcard_manager.get_all_wildcards().keys())
