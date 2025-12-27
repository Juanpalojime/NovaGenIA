"""
GPU Manager for Multi-GPU Support

Manages GPU detection, load balancing, and VRAM monitoring
for distributed image generation across multiple GPUs.
"""

import torch
import threading
from typing import List, Dict, Optional
from dataclasses import dataclass
from datetime import datetime
import logging

logger = logging.getLogger(__name__)


@dataclass
class GPUInfo:
    """Information about a single GPU"""
    id: int
    name: str
    total_vram_gb: float
    allocated_vram_gb: float
    cached_vram_gb: float
    free_vram_gb: float
    utilization: float
    active_jobs: int
    
    def to_dict(self) -> dict:
        return {
            "id": self.id,
            "name": self.name,
            "total_vram_gb": round(self.total_vram_gb, 2),
            "allocated_vram_gb": round(self.allocated_vram_gb, 2),
            "cached_vram_gb": round(self.cached_vram_gb, 2),
            "free_vram_gb": round(self.free_vram_gb, 2),
            "utilization": round(self.utilization, 2),
            "active_jobs": self.active_jobs
        }


class GPUManager:
    """Manages multiple GPUs for load balancing"""
    
    def __init__(self):
        self.num_gpus = 0
        self.gpus: List[GPUInfo] = []
        self.gpu_jobs: Dict[int, int] = {}  # gpu_id -> active job count
        self.lock = threading.Lock()
        self._detect_gpus()
    
    def _detect_gpus(self):
        """Detect available CUDA GPUs"""
        if not torch.cuda.is_available():
            logger.warning("CUDA not available - no GPUs detected")
            return
        
        self.num_gpus = torch.cuda.device_count()
        logger.info(f"Detected {self.num_gpus} GPU(s)")
        
        for i in range(self.num_gpus):
            self.gpu_jobs[i] = 0
            props = torch.cuda.get_device_properties(i)
            logger.info(f"GPU {i}: {props.name} ({props.total_memory / 1024**3:.2f} GB)")
    
    def get_gpu_info(self, gpu_id: int) -> GPUInfo:
        """Get current information for a specific GPU"""
        if gpu_id >= self.num_gpus:
            raise ValueError(f"GPU {gpu_id} not available")
        
        props = torch.cuda.get_device_properties(gpu_id)
        total_vram = props.total_memory / 1024**3
        
        # Get memory stats
        allocated = torch.cuda.memory_allocated(gpu_id) / 1024**3
        cached = torch.cuda.memory_reserved(gpu_id) / 1024**3
        free = total_vram - allocated
        
        # Calculate utilization (based on memory usage)
        utilization = (allocated / total_vram) * 100 if total_vram > 0 else 0
        
        return GPUInfo(
            id=gpu_id,
            name=props.name,
            total_vram_gb=total_vram,
            allocated_vram_gb=allocated,
            cached_vram_gb=cached,
            free_vram_gb=free,
            utilization=utilization,
            active_jobs=self.gpu_jobs.get(gpu_id, 0)
        )
    
    def get_all_gpus_info(self) -> List[GPUInfo]:
        """Get information for all GPUs"""
        return [self.get_gpu_info(i) for i in range(self.num_gpus)]
    
    def get_best_gpu(self) -> int:
        """
        Select the best GPU for a new job using load balancing.
        Strategy: Choose GPU with fewest active jobs, then by free VRAM.
        """
        if self.num_gpus == 0:
            return 0  # Default to GPU 0 if no multi-GPU
        
        if self.num_gpus == 1:
            return 0  # Only one GPU available
        
        with self.lock:
            # Get info for all GPUs
            gpus_info = self.get_all_gpus_info()
            
            # Sort by: 1) fewest active jobs, 2) most free VRAM
            best_gpu = min(
                gpus_info,
                key=lambda g: (g.active_jobs, -g.free_vram_gb)
            )
            
            logger.info(f"Selected GPU {best_gpu.id} (jobs: {best_gpu.active_jobs}, free: {best_gpu.free_vram_gb:.2f}GB)")
            return best_gpu.id
    
    def assign_job(self, gpu_id: int) -> None:
        """Mark a job as assigned to a GPU"""
        with self.lock:
            self.gpu_jobs[gpu_id] = self.gpu_jobs.get(gpu_id, 0) + 1
            logger.debug(f"Job assigned to GPU {gpu_id} (total: {self.gpu_jobs[gpu_id]})")
    
    def release_job(self, gpu_id: int) -> None:
        """Mark a job as completed on a GPU"""
        with self.lock:
            if gpu_id in self.gpu_jobs and self.gpu_jobs[gpu_id] > 0:
                self.gpu_jobs[gpu_id] -= 1
                logger.debug(f"Job released from GPU {gpu_id} (remaining: {self.gpu_jobs[gpu_id]})")
    
    def get_status(self) -> dict:
        """Get overall GPU status"""
        if self.num_gpus == 0:
            return {
                "available": False,
                "count": 0,
                "gpus": []
            }
        
        return {
            "available": True,
            "count": self.num_gpus,
            "gpus": [gpu.to_dict() for gpu in self.get_all_gpus_info()]
        }


# Global GPU manager instance
gpu_manager = GPUManager()


def get_gpu_for_job() -> int:
    """Get the best GPU for a new generation job"""
    return gpu_manager.get_best_gpu()


def mark_job_start(gpu_id: int):
    """Mark job start on GPU"""
    gpu_manager.assign_job(gpu_id)


def mark_job_end(gpu_id: int):
    """Mark job end on GPU"""
    gpu_manager.release_job(gpu_id)
