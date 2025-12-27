"""
WebSocket Manager for Real-time Generation Progress

Handles WebSocket connections and broadcasts progress updates
to connected clients during image generation.
"""

from fastapi import WebSocket, WebSocketDisconnect
from typing import Dict, Set, Optional, Any
import asyncio
import json
import logging
from datetime import datetime

logger = logging.getLogger(__name__)


class ConnectionManager:
    """Manages WebSocket connections for progress updates"""
    
    def __init__(self):
        # job_id -> set of websockets
        self.active_connections: Dict[str, Set[WebSocket]] = {}
        self._lock = asyncio.Lock()
    
    async def connect(self, websocket: WebSocket, job_id: str):
        """Accept and register a new WebSocket connection"""
        await websocket.accept()
        async with self._lock:
            if job_id not in self.active_connections:
                self.active_connections[job_id] = set()
            self.active_connections[job_id].add(websocket)
        logger.info(f"Client connected to job {job_id}")
    
    async def disconnect(self, websocket: WebSocket, job_id: str):
        """Remove a WebSocket connection"""
        async with self._lock:
            if job_id in self.active_connections:
                self.active_connections[job_id].discard(websocket)
                if not self.active_connections[job_id]:
                    del self.active_connections[job_id]
        logger.info(f"Client disconnected from job {job_id}")
    
    async def send_progress(self, job_id: str, data: dict):
        """Send progress update to all clients subscribed to a job"""
        if job_id not in self.active_connections:
            return
        
        # Add timestamp
        data["timestamp"] = datetime.now().isoformat()
        message = json.dumps(data)
        
        # Send to all connected clients
        disconnected = set()
        for websocket in self.active_connections[job_id]:
            try:
                await websocket.send_text(message)
            except WebSocketDisconnect:
                disconnected.add(websocket)
            except Exception as e:
                logger.error(f"Error sending to websocket: {e}")
                disconnected.add(websocket)
        
        # Clean up disconnected clients
        if disconnected:
            async with self._lock:
                self.active_connections[job_id] -= disconnected
    
    async def broadcast_event(self, job_id: str, event_type: str, **kwargs):
        """Broadcast a specific event type"""
        data = {
            "event": event_type,
            "job_id": job_id,
            **kwargs
        }
        await self.send_progress(job_id, data)


class ProgressCallback:
    """Callback handler for diffusion pipeline progress"""
    
    def __init__(self, manager: ConnectionManager, job_id: str, total_steps: int):
        self.manager = manager
        self.job_id = job_id
        self.total_steps = total_steps
        self.current_step = 0
        self.start_time = datetime.now()
    
    async def __call__(self, step: int, timestep: int, latents: Any):
        """Called by the diffusion pipeline at each step"""
        self.current_step = step
        
        # Calculate progress
        progress = (step / self.total_steps) * 100
        elapsed = (datetime.now() - self.start_time).total_seconds()
        
        # Estimate remaining time
        if step > 0:
            time_per_step = elapsed / step
            remaining_steps = self.total_steps - step
            eta = time_per_step * remaining_steps
        else:
            eta = 0
        
        # Send progress update
        await self.manager.broadcast_event(
            self.job_id,
            "step_complete",
            step=step,
            total_steps=self.total_steps,
            progress=round(progress, 2),
            elapsed=round(elapsed, 2),
            eta=round(eta, 2)
        )
    
    async def set_stage(self, stage: str, message: str = ""):
        """Update the current generation stage"""
        await self.manager.broadcast_event(
            self.job_id,
            "stage_change",
            stage=stage,
            message=message
        )
    
    async def complete(self, success: bool = True, message: str = "", **kwargs):
        """Mark generation as complete"""
        elapsed = (datetime.now() - self.start_time).total_seconds()
        await self.manager.broadcast_event(
            self.job_id,
            "generation_complete",
            success=success,
            message=message,
            elapsed=round(elapsed, 2),
            **kwargs
        )
    
    async def error(self, error_message: str):
        """Report an error"""
        await self.manager.broadcast_event(
            self.job_id,
            "error",
            message=error_message
        )


# Global connection manager instance
manager = ConnectionManager()


def get_progress_callback(job_id: str, total_steps: int) -> ProgressCallback:
    """Create a progress callback for a generation job"""
    return ProgressCallback(manager, job_id, total_steps)
