"""
Advanced Samplers Configuration

Samplers adicionales extraídos de Fooocus y SD WebUI
para mejorar calidad y opciones de generación.
"""

ADVANCED_SAMPLERS = {
    # K-Diffusion Samplers (de SD WebUI)
    "dpm_2m_karras": {
        "name": "DPM++ 2M Karras",
        "steps_recommended": 20,
        "cfg_recommended": 7.0,
        "quality": "high",
        "speed": "medium",
        "description": "Excelente balance calidad/velocidad"
    },
    "dpm_2m_sde_karras": {
        "name": "DPM++ 2M SDE Karras",
        "steps_recommended": 20,
        "cfg_recommended": 7.0,
        "quality": "very_high",
        "speed": "slow",
        "description": "Máxima calidad, más lento"
    },
    "dpm_sde_karras": {
        "name": "DPM++ SDE Karras",
        "steps_recommended": 20,
        "cfg_recommended": 7.0,
        "quality": "high",
        "speed": "medium",
        "description": "Alta calidad con detalles finos"
    },
    "euler_a": {
        "name": "Euler Ancestral",
        "steps_recommended": 25,
        "cfg_recommended": 7.5,
        "quality": "high",
        "speed": "fast",
        "description": "Rápido y creativo"
    },
    "euler": {
        "name": "Euler",
        "steps_recommended": 20,
        "cfg_recommended": 7.0,
        "quality": "medium",
        "speed": "very_fast",
        "description": "Muy rápido, buena calidad"
    },
    "ddim": {
        "name": "DDIM",
        "steps_recommended": 30,
        "cfg_recommended": 7.0,
        "quality": "high",
        "speed": "medium",
        "description": "Clásico, resultados consistentes"
    },
    "unipc": {
        "name": "UniPC",
        "steps_recommended": 15,
        "cfg_recommended": 7.0,
        "quality": "high",
        "speed": "very_fast",
        "description": "Muy rápido con buena calidad"
    },
    "lcm": {
        "name": "LCM",
        "steps_recommended": 4,
        "cfg_recommended": 1.5,
        "quality": "medium",
        "speed": "ultra_fast",
        "description": "Ultra rápido (4-8 steps)"
    },
}

# Mapeo para diffusers
SAMPLER_MAPPING = {
    "dpm_2m_karras": "DPMSolverMultistepScheduler",
    "dpm_2m_sde_karras": "DPMSolverMultistepScheduler",
    "dpm_sde_karras": "DPMSolverSinglestepScheduler",
    "euler_a": "EulerAncestralDiscreteScheduler",
    "euler": "EulerDiscreteScheduler",
    "ddim": "DDIMScheduler",
    "unipc": "UniPCMultistepScheduler",
    "lcm": "LCMScheduler",
}

def get_sampler_config(sampler_name: str) -> dict:
    """Get configuration for a specific sampler"""
    return ADVANCED_SAMPLERS.get(sampler_name, ADVANCED_SAMPLERS["dpm_2m_karras"])

def get_all_samplers() -> list:
    """Get list of all available samplers"""
    return [
        {
            "id": key,
            "name": value["name"],
            "steps": value["steps_recommended"],
            "cfg": value["cfg_recommended"],
            "quality": value["quality"],
            "speed": value["speed"],
            "description": value["description"]
        }
        for key, value in ADVANCED_SAMPLERS.items()
    ]
