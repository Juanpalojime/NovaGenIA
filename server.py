import os
import torch
import uvicorn
from fastapi import FastAPI, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from diffusers import StableDiffusionXLPipeline
from pydantic import BaseModel
import base64
from io import BytesIO
import subprocess

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global Pipeline
pipe = None

def load_model():
    global pipe
    if pipe is None:
        print("⏳ Cargando SDXL 1.0 (FP16)...")
        try:
            pipe = StableDiffusionXLPipeline.from_pretrained(
                "stabilityai/stable-diffusion-xl-base-1.0",
                torch_dtype=torch.float16,
                use_safetensors=True,
                variant="fp16"
            )
            pipe.to("cuda")
            # Optimizaciones críticas para T4
            pipe.enable_xformers_memory_efficient_attention()
            # pipe.enable_model_cpu_offload() # Descomentar si falta VRAM
            print("✅ Modelo Cargado con Optimizaciones T4")
        except Exception as e:
            print(f"⚠️ Error cargando modelo: {e}")

class GenerationRequest(BaseModel):
    prompt: str
    negative_prompt: str = ""
    steps: int = 30
    width: int = 1024
    height: int = 1024
    seed: int = -1

class TrainingRequest(BaseModel):
    project_name: str
    steps: int = 500

@app.on_event("startup")
async def startup_event():
    # Load model on startup or lazy load
    load_model()

@app.get("/")
def read_root():
    status = "online" if pipe else "loading"
    gpu_name = torch.cuda.get_device_name(0) if torch.cuda.is_available() else "CPU"
    return {"status": status, "gpu": gpu_name}

@app.post("/generate")
async def generate_image(req: GenerationRequest):
    if pipe is None: load_model()
    
    generator = torch.Generator("cuda").manual_seed(req.seed) if req.seed != -1 else None
    
    image = pipe(
        prompt=req.prompt,
        negative_prompt=req.negative_prompt,
        num_inference_steps=req.steps,
        width=req.width,
        height=req.height,
        generator=generator
    ).images[0]
    
    buffered = BytesIO()
    image.save(buffered, format="PNG")
    img_str = base64.b64encode(buffered.getvalue()).decode("utf-8")
    return {"image": f"data:image/png;base64,{img_str}", "status": "success"}

@app.post("/train")
async def start_training(req: TrainingRequest, background_tasks: BackgroundTasks):
    # Ejecutar script de entrenamiento en background
    def run_train():
        # En un entorno real, asegurar que train_connector.py exista
        subprocess.run(["python", "train_connector.py", "--project_name", req.project_name, "--max_train_steps", str(req.steps)])
    
    background_tasks.add_task(run_train)
    return {"status": "started", "message": f"Training {req.project_name} started on T4 GPU"}

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=7860)
