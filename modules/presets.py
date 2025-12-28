"""
Quality Presets Configuration

Presets de calidad extraídos de Fooocus para simplificar
la experiencia del usuario.
"""

QUALITY_PRESETS = {
    "speed": {
        "name": "Speed",
        "description": "Generación rápida con buena calidad",
        "steps": 20,
        "cfg_scale": 7.0,
        "sampler": "euler",
        "width": 1024,
        "height": 1024,
        "performance_mode": "speed",
        "icon": "⚡"
    },
    "quality": {
        "name": "Quality",
        "description": "Balance óptimo entre calidad y velocidad",
        "steps": 30,
        "cfg_scale": 7.5,
        "sampler": "dpm_2m_karras",
        "width": 1024,
        "height": 1024,
        "performance_mode": "balanced",
        "icon": "✨"
    },
    "extreme_speed": {
        "name": "Extreme Speed",
        "description": "Ultra rápido (8 steps)",
        "steps": 8,
        "cfg_scale": 2.0,
        "sampler": "lcm",
        "width": 1024,
        "height": 1024,
        "performance_mode": "extreme_speed",
        "icon": "🚀"
    },
    "lightning": {
        "name": "Lightning",
        "description": "Súper rápido (4 steps) - requiere modelo Lightning",
        "steps": 4,
        "cfg_scale": 1.0,
        "sampler": "euler",
        "width": 1024,
        "height": 1024,
        "performance_mode": "lightning",
        "icon": "⚡⚡"
    },
    "anime": {
        "name": "Anime",
        "description": "Optimizado para estilo anime",
        "steps": 28,
        "cfg_scale": 7.0,
        "sampler": "euler_a",
        "width": 832,
        "height": 1216,
        "performance_mode": "quality",
        "icon": "🎨"
    },
    "realistic": {
        "name": "Realistic",
        "description": "Optimizado para fotorealismo",
        "steps": 35,
        "cfg_scale": 8.0,
        "sampler": "dpm_2m_sde_karras",
        "width": 1024,
        "height": 1024,
        "performance_mode": "quality",
        "icon": "📷"
    }
}

def get_preset(preset_name: str) -> dict:
    """Get configuration for a specific preset"""
    return QUALITY_PRESETS.get(preset_name, QUALITY_PRESETS["quality"])

def get_all_presets() -> list:
    """Get list of all available presets"""
    return [
        {
            "id": key,
            **value
        }
        for key, value in QUALITY_PRESETS.items()
    ]

def apply_preset(preset_name: str, base_config: dict) -> dict:
    """Apply preset to base configuration"""
    preset = get_preset(preset_name)
    return {
        **base_config,
        "steps": preset["steps"],
        "guidance_scale": preset["cfg_scale"],
        "sampler": preset["sampler"],
        "width": preset.get("width", base_config.get("width", 1024)),
        "height": preset.get("height", base_config.get("height", 1024)),
    }
