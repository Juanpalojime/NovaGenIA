import torch
import os
from diffusers import StableDiffusionUpscalePipeline
from .core import vram_optimizer

upscale_pipe = None

def load_upscaler_model():
    global upscale_pipe
    if upscale_pipe is None:
        print("⏳ Loading x4 Upscaler...")
        try:
            upscale_pipe = StableDiffusionUpscalePipeline.from_pretrained(
                "stabilityai/stable-diffusion-x4-upscaler",
                torch_dtype=torch.float16
            ).to("cuda")
            upscale_pipe.enable_xformers_memory_efficient_attention()
            print("✅ x4 Upscaler loaded")
            return True
        except Exception as e:
            print(f"❌ Error loading Upscaler: {e}")
            return False
    return True

def get_upscaler_pipe():
    global upscale_pipe
    return upscale_pipe

def offload_upscaler():
    global upscale_pipe
    if upscale_pipe is not None:
        upscale_pipe.to("cpu")
        vram_optimizer.clear_cache()
