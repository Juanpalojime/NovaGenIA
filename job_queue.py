"""
Job Queue System for Multi-GPU Generation

Manages a queue of generation jobs and distributes them across
available GPUs for optimal performance.
"""

import uuid
import asyncio
from typing import Dict, Optional, Callable, Any
from dataclasses import dataclass, field
from datetime import datetime
from enum import Enum
import logging

logger = logging.getLogger(__name__)


class JobStatus(str, Enum):
    QUEUED = "queued"
    RUNNING = "running"
    COMPLETED = "completed"
    FAILED = "failed"
    CANCELLED = "cancelled"


@dataclass
class Job:
    """Represents a generation job"""
    id: str
    type: str  # 'generate', 'img2img', 'controlnet', etc.
    params: dict
    status: JobStatus = JobStatus.QUEUED
    gpu_id: Optional[int] = None
    created_at: datetime = field(default_factory=datetime.now)
    started_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None
    result: Optional[Any] = None
    error: Optional[str] = None
    priority: int = 0  # Higher = more priority
    
    def to_dict(self) -> dict:
        return {
            "id": self.id,
            "type": self.type,
            "status": self.status.value,
            "gpu_id": self.gpu_id,
            "created_at": self.created_at.isoformat(),
            "started_at": self.started_at.isoformat() if self.started_at else None,
            "completed_at": self.completed_at.isoformat() if self.completed_at else None,
            "priority": self.priority,
            "error": self.error
        }


class JobQueue:
    """Queue manager for generation jobs"""
    
    def __init__(self, max_concurrent_jobs: int = 4):
        self.jobs: Dict[str, Job] = {}
        self.queue: asyncio.PriorityQueue = asyncio.PriorityQueue()
        self.max_concurrent_jobs = max_concurrent_jobs
        self.running_jobs: Dict[str, Job] = {}
        self.lock = asyncio.Lock()
    
    async def add_job(
        self,
        job_type: str,
        params: dict,
        priority: int = 0
    ) -> str:
        """Add a new job to the queue"""
        job_id = str(uuid.uuid4())
        job = Job(
            id=job_id,
            type=job_type,
            params=params,
            priority=priority
        )
        
        async with self.lock:
            self.jobs[job_id] = job
            # Priority queue uses negative priority for max-heap behavior
            await self.queue.put((-priority, job_id))
        
        logger.info(f"Job {job_id} added to queue (type: {job_type}, priority: {priority})")
        return job_id
    
    async def get_next_job(self) -> Optional[Job]:
        """Get the next job from the queue"""
        try:
            _, job_id = await asyncio.wait_for(self.queue.get(), timeout=0.1)
            async with self.lock:
                if job_id in self.jobs:
                    return self.jobs[job_id]
        except asyncio.TimeoutError:
            return None
        return None
    
    async def start_job(self, job_id: str, gpu_id: int):
        """Mark a job as started"""
        async with self.lock:
            if job_id in self.jobs:
                job = self.jobs[job_id]
                job.status = JobStatus.RUNNING
                job.gpu_id = gpu_id
                job.started_at = datetime.now()
                self.running_jobs[job_id] = job
                logger.info(f"Job {job_id} started on GPU {gpu_id}")
    
    async def complete_job(self, job_id: str, result: Any = None):
        """Mark a job as completed"""
        async with self.lock:
            if job_id in self.jobs:
                job = self.jobs[job_id]
                job.status = JobStatus.COMPLETED
                job.completed_at = datetime.now()
                job.result = result
                if job_id in self.running_jobs:
                    del self.running_jobs[job_id]
                logger.info(f"Job {job_id} completed")
    
    async def fail_job(self, job_id: str, error: str):
        """Mark a job as failed"""
        async with self.lock:
            if job_id in self.jobs:
                job = self.jobs[job_id]
                job.status = JobStatus.FAILED
                job.completed_at = datetime.now()
                job.error = error
                if job_id in self.running_jobs:
                    del self.running_jobs[job_id]
                logger.error(f"Job {job_id} failed: {error}")
    
    async def cancel_job(self, job_id: str):
        """Cancel a queued or running job"""
        async with self.lock:
            if job_id in self.jobs:
                job = self.jobs[job_id]
                job.status = JobStatus.CANCELLED
                job.completed_at = datetime.now()
                if job_id in self.running_jobs:
                    del self.running_jobs[job_id]
                logger.info(f"Job {job_id} cancelled")
    
    async def get_job_status(self, job_id: str) -> Optional[dict]:
        """Get status of a specific job"""
        async with self.lock:
            if job_id in self.jobs:
                return self.jobs[job_id].to_dict()
        return None
    
    async def get_queue_status(self) -> dict:
        """Get overall queue status"""
        async with self.lock:
            return {
                "total_jobs": len(self.jobs),
                "queued": sum(1 for j in self.jobs.values() if j.status == JobStatus.QUEUED),
                "running": len(self.running_jobs),
                "completed": sum(1 for j in self.jobs.values() if j.status == JobStatus.COMPLETED),
                "failed": sum(1 for j in self.jobs.values() if j.status == JobStatus.FAILED),
                "max_concurrent": self.max_concurrent_jobs
            }
    
    def can_accept_job(self) -> bool:
        """Check if queue can accept more running jobs"""
        return len(self.running_jobs) < self.max_concurrent_jobs


# Global job queue instance
job_queue = JobQueue()
