# NovaGenIA - Guías de Uso de Nuevas Funcionalidades

## 📚 Tabla de Contenidos

1. [Real-time Generation Progress](#1-real-time-generation-progress)
2. [Multi-GPU Support](#2-multi-gpu-support)
3. [Advanced LoRA Management](#3-advanced-lora-management)
4. [Community Model Hub](#4-community-model-hub)
5. [PWA / Mobile App](#5-pwa--mobile-app)

---

## 1. Real-time Generation Progress

### ¿Qué es?
Sistema de progreso en tiempo real que muestra el avance de la generación de imágenes step-by-step con WebSockets.

### Características
- ✅ Progreso en tiempo real (0-100%)
- ✅ Número de step actual y total
- ✅ Tiempo transcurrido
- ✅ Tiempo estimado restante (ETA)
- ✅ Indicador de stage (initializing, generating, saving)
- ✅ Reconexión automática

### Cómo Usar

#### Desde el Frontend
El progreso se muestra automáticamente al generar imágenes en Creative Dashboard o Pro Studio.

#### API WebSocket
```javascript
// Conectar al WebSocket
const ws = new WebSocket('ws://localhost:7860/ws/progress/JOB_ID')

// Escuchar eventos
ws.onmessage = (event) => {
  const data = JSON.parse(event.data)
  console.log(data)
  // {
  //   type: 'step_complete',
  //   step: 15,
  //   total_steps: 30,
  //   progress: 50,
  //   elapsed: 12.5,
  //   eta: 12.5
  // }
}
```

#### Eventos Disponibles
- `stage_change`: Cambio de etapa (initializing → generating → saving)
- `step_complete`: Completado un step del pipeline
- `generation_complete`: Generación finalizada
- `error`: Error durante la generación

---

## 2. Multi-GPU Support

### ¿Qué es?
Sistema de balanceo de carga que distribuye trabajos de generación entre múltiples GPUs automáticamente.

### Características
- ✅ Detección automática de GPUs
- ✅ Balanceo de carga inteligente
- ✅ Monitoreo de VRAM en tiempo real
- ✅ Cola de trabajos con prioridades
- ✅ Estadísticas por GPU

### Cómo Usar

#### Ver Estado de GPUs
1. Ir a **Settings** → **GPU Status**
2. Ver información de cada GPU:
   - Nombre y ID
   - VRAM total, usado, libre
   - Utilización (%)
   - Jobs activos

#### API
```bash
# Ver estado de todas las GPUs
curl http://localhost:7860/gpu/status
```

Respuesta:
```json
{
  "available": true,
  "count": 2,
  "gpus": [
    {
      "id": 0,
      "name": "NVIDIA RTX 4090",
      "total_vram_gb": 24.0,
      "allocated_vram_gb": 8.5,
      "free_vram_gb": 15.5,
      "utilization": 35.4,
      "active_jobs": 1
    }
  ]
}
```

### Cómo Funciona
1. El sistema detecta todas las GPUs CUDA disponibles
2. Al recibir un trabajo, selecciona la GPU con:
   - Menos jobs activos
   - Mayor VRAM disponible
3. Asigna el trabajo y actualiza estadísticas
4. Al completar, libera la GPU

---

## 3. Advanced LoRA Management

### ¿Qué es?
Sistema avanzado para gestionar, combinar y aplicar múltiples LoRAs con pesos configurables.

### Características
- ✅ Escaneo automático de LoRAs
- ✅ Metadata con tags y trigger words
- ✅ Búsqueda y filtrado
- ✅ Combinación de múltiples LoRAs
- ✅ Pesos configurables (0.0 - 2.0)
- ✅ Preview de LoRAs

### Cómo Usar

#### Agregar LoRAs
1. Colocar archivos `.safetensors`, `.pt` o `.ckpt` en `models/loras/`
2. (Opcional) Crear archivo de metadata `nombre_lora.json`:

```json
{
  "name": "Mi LoRA Personalizado",
  "description": "Estilo artístico único",
  "tags": ["artistic", "anime", "custom"],
  "trigger_words": ["artlora", "unique style"],
  "author": "Tu Nombre",
  "version": "1.0"
}
```

#### Usar en Pro Studio
1. Ir a **Pro Studio** → **LoRA Studio** tab
2. **Browse LoRAs**: Ver todos los LoRAs disponibles
   - Buscar por nombre
   - Filtrar por tags
   - Click en `+` para agregar
3. **Mix LoRAs**: Combinar múltiples LoRAs
   - Ajustar peso con slider (0.0 - 2.0)
   - Ver peso total combinado
   - Remover LoRAs individuales

#### API
```bash
# Listar todos los LoRAs
curl http://localhost:7860/loras

# Buscar LoRAs
curl -X POST http://localhost:7860/loras/search \
  -H "Content-Type: application/json" \
  -d '{"query": "anime", "tags": ["artistic"]}'
```

### Tips de Uso
- **Peso 1.0**: Fuerza completa del LoRA
- **Peso 0.5-0.8**: Influencia sutil
- **Peso >1.0**: Efecto exagerado
- **Combinar 2-3 LoRAs**: Mejores resultados
- **Usar trigger words**: En el prompt para activar el LoRA

---

## 4. Community Model Hub

### ¿Qué es?
Integración con Hugging Face Hub para buscar, descargar y gestionar modelos de la comunidad.

### Características
- ✅ Búsqueda en Hugging Face Hub
- ✅ Filtros por tipo (checkpoint, LoRA, VAE, ControlNet)
- ✅ Descarga con progreso
- ✅ Gestión de modelos instalados
- ✅ Información de downloads y likes

### Cómo Usar

#### Buscar Modelos
1. Ir a **Model Hub** (ruta `/hub`)
2. Seleccionar tipo de modelo
3. Escribir búsqueda
4. Click en **Search**

#### Descargar Modelos
1. En resultados de búsqueda, click en **Download**
2. Ver progreso de descarga
3. Modelo aparece en tab **Installed**

#### Gestionar Instalados
1. Tab **Installed**
2. Ver todos los modelos descargados
3. Click en 🗑️ para eliminar

#### API
```bash
# Buscar modelos
curl -X POST http://localhost:7860/hub/search \
  -H "Content-Type: application/json" \
  -d '{
    "query": "stable diffusion xl",
    "model_type": "checkpoint",
    "limit": 20
  }'

# Descargar modelo
curl -X POST http://localhost:7860/hub/download \
  -H "Content-Type: application/json" \
  -d '{
    "model_id": "stabilityai/stable-diffusion-xl-base-1.0",
    "model_type": "checkpoint"
  }'

# Ver instalados
curl http://localhost:7860/hub/installed
```

### Tipos de Modelos
- **Checkpoints**: Modelos base completos
- **LoRAs**: Adaptadores de estilo
- **VAEs**: Variational Autoencoders
- **ControlNets**: Control de composición

---

## 5. PWA / Mobile App

### ¿Qué es?
Progressive Web App que permite instalar NovaGenIA como aplicación nativa en dispositivos móviles y desktop.

### Características
- ✅ Instalable como app nativa
- ✅ Soporte offline básico
- ✅ Icono en home screen
- ✅ Splash screen
- ✅ Funciona sin conexión (recursos cacheados)

### Cómo Instalar

#### En Chrome/Edge (Desktop)
1. Abrir NovaGenIA en navegador
2. Click en icono de instalación en barra de direcciones
3. Click en **Instalar**

#### En Chrome (Android)
1. Abrir NovaGenIA en Chrome
2. Menú → **Agregar a pantalla de inicio**
3. Confirmar instalación

#### En Safari (iOS)
1. Abrir NovaGenIA en Safari
2. Botón compartir → **Agregar a pantalla de inicio**
3. Confirmar

### Funcionalidades Offline
- ✅ Interfaz completa disponible
- ✅ Recursos estáticos cacheados
- ⚠️ Generación requiere conexión (backend)

### Verificar PWA
```javascript
// En DevTools Console
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.getRegistrations()
    .then(regs => console.log('Service Workers:', regs))
}
```

---

## 🔧 Troubleshooting

### WebSocket no conecta
- Verificar que el servidor esté corriendo
- Revisar URL del WebSocket (ws:// o wss://)
- Verificar CORS settings

### GPU no detectada
- Verificar instalación de CUDA
- Ejecutar: `python -c "import torch; print(torch.cuda.is_available())"`
- Revisar drivers de GPU

### LoRAs no aparecen
- Verificar que estén en `models/loras/`
- Extensiones soportadas: `.safetensors`, `.pt`, `.ckpt`
- Reiniciar servidor para re-escanear

### Model Hub no busca
- Verificar conexión a internet
- Instalar: `pip install huggingface_hub`
- Verificar que HuggingFace esté accesible

### PWA no se instala
- Usar HTTPS (o localhost)
- Verificar que `manifest.json` esté accesible
- Revisar DevTools → Application → Manifest

---

## 📞 Soporte

Para más ayuda:
- Ver `INSTALLATION_GUIDE.md` para setup
- Ver `COMPLETION_SUMMARY.md` para resumen técnico
- Revisar logs del servidor para errores
- Abrir issue en GitHub

---

**Versión**: 2.0.0  
**Última actualización**: Diciembre 2025
