"""
VRAM Optimizations

Optimizaciones de memoria extraídas de Fooocus y SD WebUI
para mejor gestión de VRAM y estabilidad.
"""

import torch
import gc
from contextlib import contextmanager

class VRAMOptimizer:
    """Optimizador de VRAM para generación estable"""
    
    def __init__(self):
        self.offload_enabled = True
        self.attention_slicing_enabled = True
        self.vae_slicing_enabled = True
    
    @staticmethod
    def clear_cache():
        """Limpiar cache de CUDA"""
        if torch.cuda.is_available():
            torch.cuda.empty_cache()
            torch.cuda.ipc_collect()
        gc.collect()
    
    @staticmethod
    def enable_attention_slicing(pipe):
        """Enable attention slicing para reducir uso de VRAM"""
        try:
            pipe.enable_attention_slicing(slice_size="auto")
            return True
        except Exception as e:
            print(f"Could not enable attention slicing: {e}")
            return False
    
    @staticmethod
    def enable_vae_slicing(pipe):
        """Enable VAE slicing para imágenes grandes"""
        try:
            pipe.enable_vae_slicing()
            return True
        except Exception as e:
            print(f"Could not enable VAE slicing: {e}")
            return False
    
    @staticmethod
    def enable_model_cpu_offload(pipe):
        """Offload model to CPU when not in use"""
        try:
            pipe.enable_model_cpu_offload()
            return True
        except Exception as e:
            print(f"Could not enable CPU offload: {e}")
            return False
    
    @staticmethod
    def enable_sequential_cpu_offload(pipe):
        """Sequential CPU offload (más agresivo)"""
        try:
            pipe.enable_sequential_cpu_offload()
            return True
        except Exception as e:
            print(f"Could not enable sequential CPU offload: {e}")
            return False
    
    @staticmethod
    def optimize_pipeline(pipe, aggressive: bool = False):
        """Optimizar pipeline completo"""
        optimizations = []
        
        # Attention slicing (siempre)
        if VRAMOptimizer.enable_attention_slicing(pipe):
            optimizations.append("attention_slicing")
        
        # VAE slicing (siempre)
        if VRAMOptimizer.enable_vae_slicing(pipe):
            optimizations.append("vae_slicing")
        
        # CPU offload (solo si es agresivo o VRAM baja)
        if aggressive:
            if VRAMOptimizer.enable_sequential_cpu_offload(pipe):
                optimizations.append("sequential_cpu_offload")
        
        return optimizations
    
    @staticmethod
    @contextmanager
    def temporary_optimization(pipe):
        """Context manager para optimización temporal"""
        # Guardar estado original
        original_state = {}
        
        # Aplicar optimizaciones
        VRAMOptimizer.optimize_pipeline(pipe)
        
        try:
            yield pipe
        finally:
            # Limpiar
            VRAMOptimizer.clear_cache()
    
    @staticmethod
    def get_vram_usage() -> dict:
        """Obtener uso actual de VRAM"""
        if not torch.cuda.is_available():
            return {"available": False}
        
        allocated = torch.cuda.memory_allocated() / 1024**3
        reserved = torch.cuda.memory_reserved() / 1024**3
        total = torch.cuda.get_device_properties(0).total_memory / 1024**3
        
        return {
            "available": True,
            "allocated_gb": round(allocated, 2),
            "reserved_gb": round(reserved, 2),
            "total_gb": round(total, 2),
            "free_gb": round(total - allocated, 2),
            "utilization": round((allocated / total) * 100, 1)
        }
    
    @staticmethod
    def should_use_aggressive_optimization() -> bool:
        """Determinar si usar optimización agresiva"""
        usage = VRAMOptimizer.get_vram_usage()
        if not usage["available"]:
            return False
        
        # Si VRAM total < 12GB o uso > 80%
        return usage["total_gb"] < 12 or usage["utilization"] > 80

# Global optimizer instance
vram_optimizer = VRAMOptimizer()

def optimize_for_generation(pipe, aggressive: bool = None):
    """Optimizar pipeline para generación"""
    if aggressive is None:
        aggressive = vram_optimizer.should_use_aggressive_optimization()
    
    return vram_optimizer.optimize_pipeline(pipe, aggressive)

def clear_vram():
    """Limpiar VRAM"""
    vram_optimizer.clear_cache()
