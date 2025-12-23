# Guía de Entrenamiento Real - NovaGen IA

El módulo de entrenamiento de NovaGen está preparado para ejecutar entrenamientos LoRA reales utilizando `accelerate` y `diffusers`.

## Requisitos

El entorno backend (`server.py`) ya está configurado para manejar la subida de datasets y la ejecución del entrenamiento.
Las dependencias necesarias (`accelerate`, `peft`, `bitsandbytes`, `diffusers`) están en `requirements.txt`.

## Habilitar Entrenamiento Real

Por defecto, el sistema ejecutará una **Simulación** si no encuentra el script de entrenamiento oficial. Para habilitar el entrenamiento real:

1.  Descarga el script de entrenamiento SDXL LoRA de HuggingFace Diffusers:
    *   URL: https://raw.githubusercontent.com/huggingface/diffusers/main/examples/dreambooth/train_dreambooth_lora_sdxl.py
2.  Guarda este archivo en la carpeta `scripts/` con el nombre:
    *   `scripts/train_dreambooth_lora_sdxl.py`
3.  Asegúrate de que `accelerate` esté configurado en tu entorno (ejecuta `accelerate config` si es necesario, o usa la configuración por defecto).

## Flujo de Trabajo

1.  En la UI "Training", sube tus imágenes.
2.  Configura los parámetros (Trigger Word, Steps).
3.  Haz clic en "Start Training".
4.  El sistema subirá las imágenes a `datasets/<project_name>`.
5.  Si el script está presente, ejecutará:
    ```bash
    accelerate launch scripts/train_dreambooth_lora_sdxl.py ...
    ```
6.  El modelo final (`.safetensors`) se guardará en `models/loras/<project_name>/`.

## Solución de Problemas

*   **Falta VRAM**: SDXL Training requiere ~24GB VRAM. Para T4 (16GB), asegúrate de usar flags como `--use_8bit_adam`, `--gradient_checkpointing` y `--mixed_precision=fp16` (ya integrados en el conector).
*   **ModuleNotFoundError**: Instala las librerías faltantes: `pip install -r requirements.txt`.
