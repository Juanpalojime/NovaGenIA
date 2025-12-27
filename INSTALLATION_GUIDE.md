# NovaGenIA - Guía de Instalación de Nuevas Funcionalidades

## 📦 Dependencias Adicionales

Agregar al `requirements.txt`:

```txt
# Existing dependencies...

# New dependencies for roadmap features
huggingface_hub>=0.20.0
safetensors>=0.4.0
websockets>=12.0
```

Instalar:
```bash
pip install huggingface_hub safetensors websockets
```

## 🔧 Configuración del Backend

### 1. Integrar Nuevos Endpoints

Abrir `server.py` y agregar antes de `# ==================== Main ====================`:

```python
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

# ==================== Model Hub ====================
from model_hub import model_hub

class ModelSearchRequest(BaseModel):
    query: str = ""
    model_type: str = "all"
    limit: int = 20

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
```

### 2. Crear Directorios

```bash
mkdir -p models/loras
mkdir -p models/hub_cache
mkdir -p models/controlnet
mkdir -p models/vae
```

## 🎨 Configuración del Frontend

### 1. Actualizar index.html

Agregar en `app/index.html` dentro de `<head>`:

```html
<!-- PWA Support -->
<link rel="manifest" href="/manifest.json">
<meta name="theme-color" content="#3b82f6">
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-status-bar-style" content="default">
<meta name="apple-mobile-web-app-title" content="NovaGenIA">
```

### 2. Registrar Service Worker

Agregar en `app/src/main.tsx` o `app/src/index.tsx`:

```typescript
import { pwaManager } from './lib/pwa'

// Register PWA
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    // PWA manager handles registration automatically
    console.log('PWA initialized')
  })
}
```

### 3. Crear Iconos PWA

Crear iconos en `app/public/`:
- `icon-192.png` (192x192)
- `icon-512.png` (512x512)

Puedes usar el logo de NovaGenIA o generar iconos con:
```bash
# Usando ImageMagick
convert logo.png -resize 192x192 icon-192.png
convert logo.png -resize 512x512 icon-512.png
```

## 🚀 Uso de Nuevas Funcionalidades

### Real-time Progress

El progreso en tiempo real se activa automáticamente en generaciones. Para usarlo manualmente:

```typescript
import { useGenerationProgress } from '@/hooks/useGenerationProgress'
import { ProgressIndicator } from '@/components/ProgressIndicator'

function MyComponent() {
  const [jobId, setJobId] = useState<string | null>(null)
  const { progress } = useGenerationProgress(jobId)
  
  return <ProgressIndicator progress={progress} />
}
```

### Multi-GPU

El sistema selecciona automáticamente la mejor GPU. Para ver el estado:

```bash
curl http://localhost:7860/gpu/status
```

### LoRA Management

Colocar archivos LoRA en `models/loras/`. Opcionalmente crear metadata:

```json
// models/loras/my_lora.json
{
  "name": "Mi LoRA Personalizado",
  "description": "Estilo artístico único",
  "tags": ["artistic", "custom"],
  "trigger_words": ["artlora", "unique style"],
  "author": "Tu Nombre",
  "version": "1.0"
}
```

Listar LoRAs:
```bash
curl http://localhost:7860/loras
```

### Model Hub

Buscar modelos:
```bash
curl -X POST http://localhost:7860/hub/search \
  -H "Content-Type: application/json" \
  -d '{"query": "stable diffusion", "model_type": "checkpoint", "limit": 10}'
```

Descargar modelo:
```bash
curl -X POST http://localhost:7860/hub/download \
  -H "Content-Type: application/json" \
  -d '{"model_id": "stabilityai/stable-diffusion-xl-base-1.0", "model_type": "checkpoint"}'
```

### PWA

Para instalar la app:
1. Abrir en navegador compatible (Chrome, Edge, Safari)
2. Buscar el botón "Instalar" en la barra de direcciones
3. O usar el menú → "Instalar NovaGenIA"

## 🧪 Verificación

### Backend
```bash
# Verificar WebSocket
python -c "from websocket_manager import manager; print('✅ WebSocket OK')"

# Verificar GPU Manager
python -c "from gpu_manager import gpu_manager; print(gpu_manager.get_status())"

# Verificar LoRA Manager
python -c "from lora_manager import lora_manager; print(f'✅ {len(lora_manager.loras)} LoRAs found')"

# Verificar Model Hub
python -c "from model_hub import model_hub; print('✅ Model Hub OK')"
```

### Frontend
```bash
cd app
npm run build  # Debe compilar sin errores
```

## 📝 Notas Importantes

1. **WebSocket**: Requiere que el servidor soporte WebSockets (uvicorn lo soporta por defecto)
2. **Multi-GPU**: Solo funciona si tienes múltiples GPUs CUDA
3. **LoRAs**: Deben ser compatibles con SDXL
4. **Model Hub**: Requiere conexión a internet para búsqueda y descarga
5. **PWA**: Requiere HTTPS en producción (excepto localhost)

## 🐛 Troubleshooting

### Error: "Module websocket_manager not found"
```bash
# Asegúrate de estar en el directorio correcto
cd NovaGenIA
python server.py
```

### Error: "huggingface_hub not installed"
```bash
pip install huggingface_hub
```

### PWA no se instala
- Verifica que estés en HTTPS o localhost
- Revisa que `manifest.json` esté accesible
- Abre DevTools → Application → Manifest

### WebSocket no conecta
- Verifica que el servidor esté corriendo
- Revisa la URL del WebSocket (ws:// o wss://)
- Chequea CORS settings

## ✅ Checklist de Instalación

- [ ] Instalar dependencias Python
- [ ] Crear directorios de modelos
- [ ] Integrar endpoints en server.py
- [ ] Actualizar index.html con PWA tags
- [ ] Crear iconos PWA
- [ ] Registrar service worker
- [ ] Verificar backend
- [ ] Verificar frontend build
- [ ] Probar WebSocket connection
- [ ] Probar GPU status endpoint
- [ ] Probar LoRA listing
- [ ] Probar Model Hub search

---

**¡Listo!** Todas las nuevas funcionalidades están instaladas y listas para usar.
