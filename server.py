import os
import torch
import uvicorn
import base64
import time
import asyncio
from io import BytesIO
from glob import glob
from enum import Enum
from typing import Optional, Dict, List
from dataclasses import dataclass

from fastapi import FastAPI, BackgroundTasks, HTTPException, WebSocket, WebSocketDisconnect
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import uuid

from diffusers import (
    StableDiffusionXLPipeline,
    StableDiffusionXLImg2ImgPipeline,
    DPMSolverMultistepScheduler,
    DPMSolverSinglestepScheduler,
    EulerAncestralDiscreteScheduler,
    EulerDiscreteScheduler,
    DDIMScheduler,
    UniPCMultistepScheduler,
    LCMScheduler,
    StableDiffusionXLControlNetPipeline,
    ControlNetModel,
    StableDiffusionUpscalePipeline
)
from transformers import (
    BlipProcessor,
    BlipForConditionalGeneration,
    AutoTokenizer, 
    AutoModelForCausalLM
)
import cv2
import numpy as np
from PIL import Image
try:
    import insightface
    from insightface.app import FaceAnalysis
except ImportError:
    insightface = None
    FaceAnalysis = None
    print("Warning: InsightFace not installed. Face Swap will be unavailable.")

try:
    from controlnet_aux import CannyDetector, ContentShuffleDetector
except ImportError:
    CannyDetector = None
    ContentShuffleDetector = None
    print("Warning: ControlNet Aux not installed. Preprocessors will be unavailable.")

# Import WebSocket manager
from websocket_manager import manager as ws_manager, get_progress_callback

# Import Advanced Features (Fooocus/SD WebUI)
from advanced_samplers import get_all_samplers, get_sampler_config, SAMPLER_MAPPING
from quality_presets import get_all_presets, apply_preset
from sdxl_styles import get_all_styles, apply_style, get_categories
from wildcards import process_wildcards, get_available_wildcards
from vram_optimizer import optimize_for_generation, clear_vram

# ==================== FastAPI Setup ====================

app = FastAPI(title="NovaGen AI Backend", version="2.1")

os.makedirs("outputs", exist_ok=True)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

app.mount("/outputs", StaticFiles(directory="outputs"), name="outputs")

# ==================== Global Pipelines ====================

pipe = None
img2img_pipe = None
controlnet_pipe = None
upscale_pipe = None
phi3_pipe = None
phi3_tokenizer = None
blip_processor = None
blip_model = None
face_app = None
face_swapper = None
preprocessors = {}
controlnet_models = {}

# ==================== Generation Modes ====================

class GenerationMode(str, Enum):
    EXTREME_SPEED = "extreme_speed"
    SPEED = "speed"
    QUALITY = "quality"

MODE_CONFIGS: Dict[GenerationMode, dict] = {
    GenerationMode.EXTREME_SPEED: {
        "steps": 15,
        "sampler": "euler_a",
        "cfg_scale": 5.0,
        "description": "Iteración rápida - Prototipado"
    },
    GenerationMode.SPEED: {
        "steps": 25,
        "sampler": "dpm_2m_karras",
        "cfg_scale": 6.5,
        "description": "Balance velocidad/calidad"
    },
    GenerationMode.QUALITY: {
        "steps": 40,
        "sampler": "dpm_2m_karras",
        "cfg_scale": 7.5,
        "description": "Máxima calidad - Producción"
    }
}

# ==================== Aspect Ratios ====================

@dataclass
class AspectRatioConfig:
    name: str
    ratio: str
    width: int
    height: int
    category: str
    recommended_steps: int

ASPECT_RATIOS = {
    "1:1": AspectRatioConfig("Square", "1:1", 1024, 1024, "square", 30),
    "16:9": AspectRatioConfig("Widescreen", "16:9", 1344, 768, "horizontal", 32),
    "3:2": AspectRatioConfig("Photo", "3:2", 1216, 832, "horizontal", 30),
    "4:3": AspectRatioConfig("Classic", "4:3", 1152, 896, "horizontal", 30),
    "9:16": AspectRatioConfig("Portrait", "9:16", 768, 1344, "vertical", 32),
    "2:3": AspectRatioConfig("Photo Portrait", "2:3", 832, 1216, "vertical", 30),
    "3:4": AspectRatioConfig("Classic Portrait", "3:4", 896, 1152, "vertical", 30),
    "21:9": AspectRatioConfig("Cinematic", "21:9", 1536, 640, "cinematic", 35),
    "4:5": AspectRatioConfig("Instagram", "4:5", 896, 1088, "social", 28),
    "1:2": AspectRatioConfig("Story", "1:2", 640, 1280, "social", 32),
}

def validate_aspect_ratio(width: int, height: int) -> bool:
    return width % 64 == 0 and height % 64 == 0

def get_aspect_ratio_config(ratio: str) -> AspectRatioConfig:
    if ratio not in ASPECT_RATIOS:
        return ASPECT_RATIOS["1:1"]
    return ASPECT_RATIOS[ratio]

# ==================== Model Loading ====================

def load_model():
    global pipe
    if pipe is None:
        print("⏳ Cargando Juggernaut-XL v9 RunDiffusion Photo v2 (FP16)...")
        try:
            model_path = "models/checkpoints/Juggernaut-XL_v9_RunDiffusionPhoto_v2.safetensors"
            if not os.path.exists(model_path):
                print(f"⚠️ Modelo no encontrado en {model_path}, descargando...")
                pipe = StableDiffusionXLPipeline.from_pretrained(
                    "stabilityai/stable-diffusion-xl-base-1.0",
                    torch_dtype=torch.float16,
                    use_safetensors=True,
                    variant="fp16"
                )
            else:
                pipe = StableDiffusionXLPipeline.from_single_file(
                    model_path,
                    torch_dtype=torch.float16,
                    use_safetensors=True
                )
            pipe.to("cuda")
            pipe.enable_xformers_memory_efficient_attention()
            pipe.enable_vae_slicing()
            pipe.enable_vae_tiling()
            print("✅ Modelo Base Cargado")
        except Exception as e:
            print(f"⚠️ Error cargando modelo base: {e}")

def load_img2img_model():
    global img2img_pipe
    if img2img_pipe is None and pipe is not None:
        print("⏳ Configurando Img2Img pipeline...")
        img2img_pipe = StableDiffusionXLImg2ImgPipeline(
            vae=pipe.vae,
            text_encoder=pipe.text_encoder,
            text_encoder_2=pipe.text_encoder_2,
            tokenizer=pipe.tokenizer,
            tokenizer_2=pipe.tokenizer_2,
            unet=pipe.unet,
            scheduler=pipe.scheduler,
        )
        img2img_pipe.to("cuda")
        print("✅ Img2Img pipeline listo")

def load_controlnet_model(control_type: str):
    global controlnet_models, pipe, controlnet_pipe, preprocessors
    
    models = {
        "canny": "diffusers/controlnet-canny-sdxl-1.0",
        "depth": "diffusers/controlnet-depth-sdxl-1.0",
        # Mapping advanced types to available models
        "pyracanny": "diffusers/controlnet-canny-sdxl-1.0", 
        "cpds": "diffusers/controlnet-depth-sdxl-1.0"
    }
    
    model_key = control_type
    if control_type == "pyracanny": model_key = "canny"
    if control_type == "cpds": model_key = "depth"

    if model_key not in models:
        raise ValueError(f"Unknown control type: {control_type}")
        
    if model_key not in controlnet_models:
        print(f"⏳ Loading ControlNet {model_key}...")
        try:
            controlnet = ControlNetModel.from_pretrained(
                models[model_key],
                torch_dtype=torch.float16
            ).to("cuda")
            controlnet_models[model_key] = controlnet
            print(f"✅ ControlNet {model_key} loaded")
        except Exception as e:
            print(f"❌ Error loading ControlNet {model_key}: {e}")
            return None
            
    # Load Preprocessors from controlnet_aux
    if control_type == "pyracanny" and "pyracanny" not in preprocessors:
        print("⏳ Loading PyraCanny (CannyDetector)...")
        preprocessors["pyracanny"] = CannyDetector()
    
    # CPDS in Fooocus is often Contrast Preserving, but we'll map to Depth/Shuffle or specific
    # For now, we'll map CPDS to a high-quality Midas/Zoe depth or similar if available, 
    # or just use standard Depth. Let's use ContentShuffle as placeholder if referencing structure,
    # but CPDS is usually geometry. Let's stick to standard Depth but assume advanced preprocessing elsewhere.
    # Actually, let's just use standard processing for now or add a custom processor if libs allow.

    if pipe is not None:
        controlnet_pipe = StableDiffusionXLControlNetPipeline.from_pretrained(
            "stabilityai/stable-diffusion-xl-base-1.0",
            vae=pipe.vae,
            text_encoder=pipe.text_encoder,
            text_encoder_2=pipe.text_encoder_2,
            tokenizer=pipe.tokenizer,
            tokenizer_2=pipe.tokenizer_2,
            unet=pipe.unet,
            scheduler=pipe.scheduler,
            controlnet=controlnet_models[model_key],
            torch_dtype=torch.float16
        ).to("cuda")
        controlnet_pipe.enable_xformers_memory_efficient_attention()

def load_faceswap_models():
    global face_app, face_swapper
    if face_app is None:
        print("⏳ Loading Face Analysis (InsightFace)...")
        # Ensure models are downloaded. InsightFace auto-downloads to ~/.insightface/
        face_app = FaceAnalysis(name='buffalo_l')
        face_app.prepare(ctx_id=0, det_size=(640, 640))
        
        print("⏳ Loading Face Swapper (inswapper_128)...")
        # We need the inswapper_128.onnx file. It's often required to be downloaded manually.
        # Check if exists in models/insightface/
        swap_model_path = "models/insightface/inswapper_128.onnx"
        if os.path.exists(swap_model_path):
             face_swapper = insightface.model_zoo.get_model(swap_model_path, download=False, download_zip=False)
        else:
             print(f"⚠️ FaceSwap model not found at {swap_model_path}. Please download inswapper_128.onnx.")

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
        except Exception as e:
            print(f"❌ Error loading Upscaler: {e}")

def load_phi3_model():
    global phi3_pipe, phi3_tokenizer
    if phi3_pipe is None:
        print("⏳ Cargando Phi-3 Mini...")
        try:
            model_name = "microsoft/Phi-3-mini-4k-instruct"
            phi3_tokenizer = AutoTokenizer.from_pretrained(model_name, trust_remote_code=True)
            phi3_pipe = AutoModelForCausalLM.from_pretrained(
                model_name,
                torch_dtype=torch.float16 if torch.cuda.is_available() else torch.float32,
                device_map="auto",
                trust_remote_code=True
            )
            print("✅ Phi-3 Mini Cargado")
        except Exception as e:
            print(f"⚠️ Error cargando Phi-3 Mini: {e}")

def load_blip_model():
    global blip_processor, blip_model
    if blip_model is None:
        print("⏳ Cargando BLIP...")
        try:
            blip_processor = BlipProcessor.from_pretrained("Salesforce/blip-image-captioning-base")
            blip_model = BlipForConditionalGeneration.from_pretrained(
                "Salesforce/blip-image-captioning-base",
                torch_dtype=torch.float16 if torch.cuda.is_available() else torch.float32
            ).to("cuda" if torch.cuda.is_available() else "cpu")
            print("✅ BLIP Cargado")
        except Exception as e:
            print(f"⚠️ Error cargando BLIP: {e}")

def set_scheduler(sampler: str):
    if not pipe: return
    config = pipe.scheduler.config
    
    if sampler == "euler_a":
        pipe.scheduler = EulerAncestralDiscreteScheduler.from_config(config)
    elif sampler == "euler":
        pipe.scheduler = EulerDiscreteScheduler.from_config(config)
    elif sampler == "dpm_2m_karras":
        pipe.scheduler = DPMSolverMultistepScheduler.from_config(config, use_karras_sigmas=True)
    elif sampler == "dpm_2m_sde_karras":
        pipe.scheduler = DPMSolverMultistepScheduler.from_config(config, use_karras_sigmas=True, algorithm_type="sde-dpmsolver++")
    elif sampler == "dpm_sde_karras":
        pipe.scheduler = DPMSolverSinglestepScheduler.from_config(config, use_karras_sigmas=True)
    elif sampler == "ddim":
        pipe.scheduler = DDIMScheduler.from_config(config)
    elif sampler == "unipc":
        pipe.scheduler = UniPCMultistepScheduler.from_config(config)
    elif sampler == "lcm":
        pipe.scheduler = LCMScheduler.from_config(config)

def preprocess_control_image(image: Image.Image, type: str):
    image_np = np.array(image)
    
    if type == "pyracanny":
        # PyraCanny simulation or using controlnet_aux
        if "pyracanny" in preprocessors:
            processed = preprocessors["pyracanny"](image)
            return processed
        else:
            # Fallback simple Canny
            image_np = cv2.Canny(image_np, 100, 200)
            image_np = image_np[:, :, None]
            image_np = np.concatenate([image_np, image_np, image_np], axis=2)
            return Image.fromarray(image_np)
            
    if type == "canny":
        image_np = cv2.Canny(image_np, 100, 200)
        image_np = image_np[:, :, None]
        image_np = np.concatenate([image_np, image_np, image_np], axis=2)
        return Image.fromarray(image_np)
    
    # CPDS / Depth
    return Image.fromarray(image_np)

# ==================== Request Models ====================

class GenerationRequest(BaseModel):
    prompt: str
    negative_prompt: str = ""
    mode: GenerationMode = GenerationMode.SPEED
    aspect_ratio: str = "1:1"
    seed: int = -1
    num_images: int = 1
    output_format: str = "png" # png, jpeg, webp
    steps: Optional[int] = None
    cfg_scale: Optional[float] = None
    guidance_scale: Optional[float] = None
    sampler: Optional[str] = None
    preset_id: Optional[str] = None
    style_id: Optional[str] = None
    use_wildcards: bool = False

class Img2ImgRequest(BaseModel):
    prompt: str
    negative_prompt: str = ""
    image: str
    strength: float = 0.75
    mode: GenerationMode = GenerationMode.SPEED
    seed: int = -1
    num_images: int = 1
    output_format: str = "png"

class ControlNetRequest(BaseModel):
    prompt: str
    negative_prompt: str = ""
    image: str
    control_type: str = "canny"
    control_weight: float = 0.5
    mode: GenerationMode = GenerationMode.SPEED
    seed: int = -1
    num_images: int = 1
    output_format: str = "png"

class FaceSwapRequest(BaseModel):
    source_image: str # The face to copy
    target_image: str # The destination body/scene
    output_format: str = "png"

class UpscaleRequest(BaseModel):
    image: str 
    prompt: str = "high quality"
    output_format: str = "png"

class DatasetUploadRequest(BaseModel):
    image: str
    project_name: str
    filename: str

class TrainingRequest(BaseModel):
    project_name: str
    steps: int = 1000

class PromptEnhanceRequest(BaseModel):
    prompt: str

class InterrogateRequest(BaseModel):
    image: str

# ==================== Startup ====================

@app.on_event("startup")
async def startup_event():
    load_model()
    # load_faceswap_models() # Auto-load on startup or lazy load to save VRAM

# ==================== Helpers ====================

def save_image(image, output_format="png"):
    timestamp = int(time.time() * 1000)
    ext = output_format.lower()
    if ext == "jpg": ext = "jpeg"
    filename = f"gen_{timestamp}.{ext}"
    filepath = os.path.join("outputs", filename)
    image.save(filepath, format=output_format.upper())
    return filename, filepath

# ==================== Endpoints ====================
# ... (Continuing endpoints below) ...

@app.get("/")
def read_root():
    status = "online" if pipe else "loading"
    return {"status": status, "model": "Juggernaut-XL v9", "version": "NovaGen Backend v2.1"}

@app.get("/health")
def health_check():
    """Detailed health check with model status and system info"""
    models_status = {
        "base_model": pipe is not None,
        "img2img": img2img_pipe is not None,
        "controlnet": controlnet_pipe is not None,
        "upscaler": upscale_pipe is not None,
        "phi3": phi3_pipe is not None,
        "blip": blip_model is not None,
        "face_swap": face_swapper is not None
    }
    
    cuda_available = torch.cuda.is_available()
    vram_info = {}
    if cuda_available:
        vram_info = {
            "total_vram_gb": round(torch.cuda.get_device_properties(0).total_memory / 1024**3, 2),
            "allocated_vram_gb": round(torch.cuda.memory_allocated(0) / 1024**3, 2),
            "cached_vram_gb": round(torch.cuda.memory_reserved(0) / 1024**3, 2)
        }
    
    return {
        "status": "online",
        "version": "NovaGen Backend v2.1",
        "gpu": {
            "available": cuda_available,
            "name": torch.cuda.get_device_name(0) if cuda_available else None,
            "vram_total": vram_info.get("total_vram_gb"),
            "vram_used": vram_info.get("allocated_vram_gb")
        },
        "models": models_status,
        "cuda_available": cuda_available, # Keep for legacy/debug
        "vram": vram_info # Keep for legacy/debug
    }

@app.get("/modes")
def get_modes():
    """Get available generation modes with configurations"""
    modes = {}
    for mode, config in MODE_CONFIGS.items():
        modes[mode.value] = {
            "steps": config["steps"],
            "sampler": config["sampler"],
            "cfg_scale": config["cfg_scale"],
            "description": config["description"]
        }
    return modes

@app.get("/aspect-ratios")
def get_aspect_ratios():
    """Get available aspect ratios with configurations"""
    ratios = {}
    for ratio_key, config in ASPECT_RATIOS.items():
        ratios[ratio_key] = {
            "name": config.name,
            "ratio": config.ratio,
            "width": config.width,
            "height": config.height,
            "category": config.category,
            "recommended_steps": config.recommended_steps
        }
    return ratios


@app.websocket("/ws/progress/{job_id}")
async def websocket_progress(websocket: WebSocket, job_id: str):
    """WebSocket endpoint for real-time generation progress"""
    await ws_manager.connect(websocket, job_id)
    try:
        while True:
            # Keep connection alive and wait for messages
            data = await websocket.receive_text()
            # Client can send ping to keep alive
            if data == "ping":
                await websocket.send_text("pong")
    except WebSocketDisconnect:
        await ws_manager.disconnect(websocket, job_id)


@app.post("/generate")
async def generate_image(req: GenerationRequest):
    if pipe is None: load_model()
    
    # 1. Apply Preset (overrides mode if present)
    current_steps = req.steps
    current_cfg = req.guidance_scale or req.cfg_scale
    current_sampler = req.sampler
    
    if req.preset_id:
        req_dict = req.dict()
        req_dict = apply_preset(req.preset_id, req_dict)
        if not current_steps: current_steps = req_dict["steps"]
        if not current_cfg: current_cfg = req_dict["guidance_scale"]
        if not current_sampler: current_sampler = req_dict["sampler"]

    # If no preset/manual, fall back to mode defaults
    if not current_steps or not current_cfg or not current_sampler:
        mode_config = MODE_CONFIGS[req.mode]
        if not current_steps: current_steps = mode_config["steps"]
        if not current_cfg: current_cfg = mode_config["cfg_scale"]
        if not current_sampler: current_sampler = mode_config["sampler"]

    # 2. Process Wildcards
    final_prompt = req.prompt
    if req.use_wildcards:
        final_prompt = process_wildcards(final_prompt)

    # 3. Apply Style
    final_negative = req.negative_prompt
    if req.style_id:
        final_prompt, final_negative = apply_style(final_prompt, final_negative, req.style_id)

    # 4. Configure Scheduler/Sampler
    if current_sampler:
        # Check if it's an advanced sampler from mapping
        if current_sampler in SAMPLER_MAPPING:
             # Basic mapping for common ones supported by set_scheduler helper
             # For advanced ones not in helper, we might need more logic
             # But set_scheduler currently handles euler_a/dpm_2m_karras
             # We should update set_scheduler to handle more or map here
             pass
        set_scheduler(current_sampler)

    # 5. VRAM Optimization
    optimize_for_generation(pipe)

    ar_config = get_aspect_ratio_config(req.aspect_ratio)
    
    generator = torch.Generator("cuda").manual_seed(req.seed) if req.seed != -1 else torch.Generator("cuda")
    used_seed = req.seed if req.seed != -1 else generator.initial_seed()

    # Create job ID for progress tracking
    job_id = str(uuid.uuid4())
    progress_cb = get_progress_callback(job_id, steps)
    
    # Notify start
    await progress_cb.set_stage("initializing", "Loading model and preparing generation")

    # Generate Batch
    result_images = []
    for i in range(req.num_images):
        await progress_cb.set_stage("generating", f"Generating image {i+1}/{req.num_images}")
        
        image = pipe(
            prompt=final_prompt,
            negative_prompt=final_negative,
            num_inference_steps=current_steps,
            guidance_scale=current_cfg,
            width=ar_config.width,
            height=ar_config.height,
            generator=generator,
            callback=lambda step, ts, latents: asyncio.create_task(progress_cb(step, ts, latents)),
            callback_steps=1
        ).images[0]
        
        await progress_cb.set_stage("saving", f"Saving image {i+1}/{req.num_images}")
        filename, filepath = save_image(image, req.output_format)
        result_images.append({
            "url": f"/outputs/{filename}",
            "path": filepath,
            "seed": used_seed,
            "width": ar_config.width,
            "height": ar_config.height
        })
    
    await progress_cb.complete(success=True, message="Generation complete", images=len(result_images))
    
    return {
        "job_id": job_id,
        "images": result_images,
        "model": "Juggernaut-XL v9",
        "status": "success"
    }

@app.post("/img2img")
async def image_to_image(req: Img2ImgRequest):
    """Image-to-Image with Batch Support"""
    if pipe is None: load_model()
    if img2img_pipe is None: load_img2img_model()
    
    try:
        image_data = base64.b64decode(req.image.split(',')[1] if ',' in req.image else req.image)
        init_image = Image.open(BytesIO(image_data)).convert("RGB")
    except:
        raise HTTPException(400, "Invalid Image")
    
    mode_config = MODE_CONFIGS[req.mode]
    set_scheduler(mode_config["sampler"])
    generator = torch.Generator("cuda").manual_seed(req.seed) if req.seed != -1 else torch.Generator("cuda")
    used_seed = req.seed if req.seed != -1 else generator.initial_seed()

    result_images = []
    for i in range(req.num_images):
        # We might want to vary seed slightly per image if batch > 1? 
        # Or keep same prompt/seed but maybe scheduler noise differs? 
        # Typically same seed = same output. We should increment seed for batch > 1 if user didn't lock it?
        # For strict control, generator handles randomness if created once? 
        # Actually diffusers pipeline handles num_images_per_prompt but usually for 1 prompt -> N images.
        # Here we loop manually to save VRAM peak.
        
        current_generator = generator
        if req.num_images > 1 and req.seed == -1:
             # Randomize each if no fixed seed
             current_generator = torch.Generator("cuda")
             
        res = img2img_pipe(
            prompt=req.prompt,
            negative_prompt=req.negative_prompt,
            image=init_image,
            strength=req.strength,
            num_inference_steps=mode_config["steps"],
            guidance_scale=mode_config["cfg_scale"],
            generator=current_generator
        ).images[0]
        
        filename, filepath = save_image(res, req.output_format)
        result_images.append({
            "url": f"/outputs/{filename}",
            "seed": used_seed # Note: might vary per image if randomized
        })

    # Return structure adaptation
    return {
        "images": result_images,
        "image": result_images[0], # Legacy compat
        "status": "success"
    }

@app.post("/controlnet")
async def controlnet_generate(req: ControlNetRequest):
    if pipe is None: load_model()
    load_controlnet_model(req.control_type)
    
    try:
        image_data = base64.b64decode(req.image.split(',')[1] if ',' in req.image else req.image)
        init_image = Image.open(BytesIO(image_data)).convert("RGB")
        processed_image = preprocess_control_image(init_image, req.control_type)
    except:
         raise HTTPException(400, "Invalid Image")

    mode_config = MODE_CONFIGS[req.mode]
    set_scheduler(mode_config["sampler"])
    generator = torch.Generator("cuda").manual_seed(req.seed) if req.seed != -1 else torch.Generator("cuda")
    used_seed = req.seed if req.seed != -1 else generator.initial_seed()
    
    controlnet_pipe.scheduler = pipe.scheduler
    
    result_images = []
    for i in range(req.num_images):
         res = controlnet_pipe(
            prompt=req.prompt,
            negative_prompt=req.negative_prompt,
            image=processed_image,
            controlnet_conditioning_scale=req.control_weight,
            num_inference_steps=mode_config["steps"],
            guidance_scale=mode_config["cfg_scale"],
            generator=generator
        ).images[0]
         
         filename, filepath = save_image(res, req.output_format)
         result_images.append({
            "url": f"/outputs/{filename}",
            "seed": used_seed
        })

    return {
        "images": result_images,
        "image": result_images[0],
        "status": "success"
    }

@app.post("/faceswap")
async def face_swap(req: FaceSwapRequest):
    """Swap face from source to target using InsightFace"""
    load_faceswap_models()
    if face_swapper is None:
        raise HTTPException(500, "FaceSwap model not available (inswapper_128.onnx missing?)")
        
    try:
        # Decode images
        source_data = base64.b64decode(req.source_image.split(',')[1] if ',' in req.source_image else req.source_image)
        target_data = base64.b64decode(req.target_image.split(',')[1] if ',' in req.target_image else req.target_image)
        
        source_img = cv2.cvtColor(np.array(Image.open(BytesIO(source_data))), cv2.COLOR_RGB2BGR)
        target_img = cv2.cvtColor(np.array(Image.open(BytesIO(target_data))), cv2.COLOR_RGB2BGR)
        
        # Detect faces
        source_faces = face_app.get(source_img)
        target_faces = face_app.get(target_img)
        
        if not source_faces:
             raise HTTPException(400, "No face detected in source image")
        if not target_faces:
             raise HTTPException(400, "No face detected in target image")
             
        # Swap (using first detected face for now)
        source_face = source_faces[0]
        res_img = target_img.copy()
        
        for target_face in target_faces:
            res_img = face_swapper.get(res_img, target_face, source_face, paste_back=True)
            
        # Save output
        final_image = Image.fromarray(cv2.cvtColor(res_img, cv2.COLOR_BGR2RGB))
        filename, filepath = save_image(final_image, req.output_format)
        
        return {
            "image": {
                "url": f"/outputs/{filename}",
                "seed": 0
            },
            "status": "success"
        }
        
    except Exception as e:
        print(f"FaceSwap error: {e}")
        raise HTTPException(500, f"FaceSwap failed: {str(e)}")


@app.post("/upscale")
async def upscale_image(req: UpscaleRequest):
    """Upscale image using Stable Diffusion x4 Upscaler"""
    if upscale_pipe is None:
        load_upscaler_model()
    
    if upscale_pipe is None:
        raise HTTPException(500, "Upscaler model not available")
    
    try:
        # Decode image
        image_data = base64.b64decode(req.image.split(',')[1] if ',' in req.image else req.image)
        init_image = Image.open(BytesIO(image_data)).convert("RGB")
        
        # Upscale
        upscaled = upscale_pipe(
            prompt=req.prompt,
            image=init_image,
            num_inference_steps=25
        ).images[0]
        
        # Save
        filename, filepath = save_image(upscaled, req.output_format)
        
        return {
            "image": {
                "url": f"/outputs/{filename}",
                "seed": 0
            },
            "status": "success"
        }
    except Exception as e:
        print(f"Upscale error: {e}")
        raise HTTPException(500, f"Upscale failed: {str(e)}")

@app.post("/interrogate")
async def interrogate_image(req: InterrogateRequest):
    """Generate caption for image using BLIP"""
    if blip_model is None:
        load_blip_model()
    
    if blip_model is None:
        return {"caption": "", "error": "BLIP model not available"}
    
    try:
        # Decode image
        image_data = base64.b64decode(req.image.split(',')[1] if ',' in req.image else req.image)
        image = Image.open(BytesIO(image_data)).convert("RGB")
        
        # Generate caption
        inputs = blip_processor(image, return_tensors="pt").to(blip_model.device)
        out = blip_model.generate(**inputs, max_length=50)
        caption = blip_processor.decode(out[0], skip_special_tokens=True)
        
        return {
            "caption": caption,
            "status": "success"
        }
    except Exception as e:
        print(f"Interrogate error: {e}")
        return {
            "caption": "",
            "error": str(e),
            "status": "error"
        }

@app.post("/dataset/upload")
async def upload_dataset(req: DatasetUploadRequest):
    """Save training image to project folder"""
    try:
        # Create dataset dir
        dataset_dir = os.path.join("datasets", req.project_name)
        os.makedirs(dataset_dir, exist_ok=True)
        
        # Decode and save
        image_data = base64.b64decode(req.image.split(',')[1] if ',' in req.image else req.image)
        image = Image.open(BytesIO(image_data)).convert("RGB")
        
        filepath = os.path.join(dataset_dir, req.filename)
        image.save(filepath, format="PNG")
        
        return {"status": "success", "path": filepath}
    except Exception as e:
        print(f"Dataset upload error: {e}")
        raise HTTPException(500, f"Upload failed: {str(e)}")


@app.get("/gallery")
def get_gallery():
    """Get all generated images from outputs directory"""
    files = sorted(glob("outputs/*.png"), key=os.path.getmtime, reverse=True)
    assets = []
    for f in files:
        filename = os.path.basename(f)
        stat = os.stat(f)
        assets.append({
            "id": filename,
            "url": f"/outputs/{filename}",
            "prompt": "Generated Image",
            "width": 1024,
            "height": 1024,
            "createdAt": int(stat.st_mtime * 1000),
            "tags": ["generated"],
            "model": "Juggernaut-XL v9",
            "isFavorite": False,
            "seed": 0
        })
    return assets

@app.post("/enhance-prompt")
async def enhance_prompt(req: PromptEnhanceRequest):
    """Enhance user prompt using Phi-3 Mini LLM"""
    if phi3_pipe is None:
        load_phi3_model()
    
    if phi3_pipe is None:
        return {"enhanced_prompt": req.prompt, "error": "Phi-3 model not available"}
    
    try:
        system_prompt = """You are an expert AI image generation prompt engineer. Enhance the user's simple prompt into a detailed, vivid description optimized for Stable Diffusion XL. Add artistic details, lighting, composition, and style elements while preserving the core intent. Keep it under 150 words. Return ONLY the enhanced prompt, no explanations."""
        
        messages = [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": f"Enhance this prompt: {req.prompt}"}
        ]
        
        inputs = phi3_tokenizer.apply_chat_template(
            messages,
            add_generation_prompt=True,
            return_tensors="pt"
        ).to(phi3_pipe.device)
        
        outputs = phi3_pipe.generate(
            inputs,
            max_new_tokens=200,
            temperature=0.7,
            top_p=0.9,
            do_sample=True,
            pad_token_id=phi3_tokenizer.eos_token_id
        )
        
        response = phi3_tokenizer.decode(outputs[0][inputs.shape[1]:], skip_special_tokens=True)
        enhanced = response.strip()
        
        return {
            "enhanced_prompt": enhanced,
            "original_prompt": req.prompt,
            "status": "success"
        }
    except Exception as e:
        print(f"⚠️ Error enhancing prompt: {e}")
        return {
            "enhanced_prompt": req.prompt,
            "error": str(e),
            "status": "error"
        }

@app.post("/train")
async def start_training(req: TrainingRequest, background_tasks: BackgroundTasks):
    """Start training job"""
    def run_train():
        import subprocess
        subprocess.run([
            "python", "train_connector.py",
            "--project_name", req.project_name,
            "--max_train_steps", str(req.steps)
        ])
    
    background_tasks.add_task(run_train)
    return {
        "status": "started",
        "message": f"Training {req.project_name} started on T4 GPU"
    }

# ==================== GPU Management ====================

from gpu_manager import gpu_manager

@app.get("/gpu/status")
def get_gpu_status():
    """Get GPU status and information"""
    return gpu_manager.get_status()

# ==================== LoRA Management ====================

from lora_manager import lora_manager

@app.get("/loras")
def get_loras():
    """Get all available LoRAs"""
    return lora_manager.get_all_loras()

@app.get("/loras/{lora_id}")
def get_lora_details(lora_id: str):
    """Get details for a specific LoRA"""
    lora = lora_manager.get_lora(lora_id)
    if not lora:
        raise HTTPException(404, f"LoRA {lora_id} not found")
    return lora

class LoRASearchRequest(BaseModel):
    query: str = ""
    tags: List[str] = []

@app.post("/loras/search")
def search_loras(req: LoRASearchRequest):
    """Search LoRAs by query and tags"""
    return lora_manager.search_loras(req.query, req.tags)

# ==================== Model Hub ====================

from model_hub import model_hub

class ModelSearchRequest(BaseModel):
    query: str = ""
    model_type: str = "all"
    limit: int = 20

class ModelDownloadRequest(BaseModel):
    model_id: str
    model_type: str = "checkpoint"

@app.post("/hub/search")
def search_models(req: ModelSearchRequest):
    """Search models on Hugging Face Hub"""
    return model_hub.search_models(req.query, req.model_type, req.limit)

@app.post("/hub/download")
async def download_model(req: ModelDownloadRequest):
    """Download a model from Hugging Face Hub"""
    result = await model_hub.download_model(req.model_id, req.model_type)
    return result

@app.get("/hub/installed")
def get_installed_models():
    """Get list of installed models"""
    return model_hub.get_installed_models()

@app.delete("/hub/models/{model_path:path}")
def delete_model(model_path: str):
    """Delete an installed model"""
    success = model_hub.delete_model(model_path)
    if success:
        return {"status": "success", "message": "Model deleted"}
    raise HTTPException(500, "Failed to delete model")

# ==================== Advanced Features Endpoints ====================

@app.get("/features/samplers")
def get_samplers():
    """Get all available samplers including advanced ones"""
    return get_all_samplers()

@app.get("/features/presets")
def get_presets():
    """Get all quality presets"""
    return get_all_presets()

@app.get("/features/styles")
def get_styles():
    """Get all SDXL styles"""
    return get_all_styles()

@app.get("/features/styles/categories")
def get_style_categories():
    """Get style categories"""
    return get_categories()

@app.get("/features/wildcards")
def get_wildcards():
    """Get available wildcards"""
    return get_available_wildcards()

@app.post("/system/vram-optimize")
def trigger_vram_optimize():
    """Trigger manual VRAM optimization"""
    clear_vram()
    return {"status": "success", "message": "VRAM optimized and cache cleared"}

# ==================== Main ====================

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=7860)
