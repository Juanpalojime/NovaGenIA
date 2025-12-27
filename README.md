# NovaGenIA - AI Image Generation System

<div align="center">

![NovaGenIA](https://img.shields.io/badge/NovaGenIA-v2.1-blue)
![Python](https://img.shields.io/badge/Python-3.10+-green)
![React](https://img.shields.io/badge/React-18+-61DAFB)
![License](https://img.shields.io/badge/license-MIT-blue)

**Professional AI Image Generation Platform powered by Stable Diffusion XL**

[Features](#features) • [Installation](#installation) • [Usage](#usage) • [Documentation](#documentation)

</div>

---

## 🎨 Overview

NovaGenIA is a comprehensive AI image generation system featuring a modern React frontend and powerful Python backend. Built on Stable Diffusion XL (Juggernaut-XL v9), it offers professional-grade image generation with advanced features like ControlNet, Face Swap, and intelligent prompt enhancement.

## ✨ Features

### Core Generation
- **Text-to-Image**: Generate high-quality images from text prompts
- **Image-to-Image**: Transform existing images with AI
- **Batch Generation**: Create multiple variations in one request
- **Smart Aspect Ratios**: 10+ optimized presets (Square, Widescreen, Portrait, Cinematic, etc.)

### Advanced AI Features
- **ControlNet Integration**: Canny, PyraCanny, and CPDS preprocessors
- **Face Swap**: InsightFace-powered face replacement
- **Intelligent Upscaling**: x4 upscaling with Stable Diffusion
- **Image Interrogation**: BLIP-based reverse prompt engineering
- **Magic Prompt**: Phi-3 Mini LLM for prompt enhancement

### Generation Modes
- **Extreme Speed** (15 steps): Rapid prototyping
- **Speed** (25 steps): Balanced quality/speed
- **Quality** (40 steps): Maximum quality for production

### Professional Tools
- **Asset Library**: Organize and manage generated images
- **Training Center**: Custom model training (LoRA)
- **Pro Studio**: Advanced generation controls
- **Settings**: Customizable themes and preferences

## 🚀 Quick Start

### Prerequisites
- **Python 3.10+** with CUDA support
- **Node.js 18+** and npm
- **NVIDIA GPU** with 16GB+ VRAM (or use Google Colab)

### Installation

#### 1. Clone Repository
```bash
git clone https://github.com/Juanpalojime/NovaGenIA.git
cd NovaGenIA
```

#### 2. Backend Setup
```bash
# Install Python dependencies
pip install -r requirements.txt

# Download models (see modulos/README.md for details)
python setup_novagen.py
```

#### 3. Frontend Setup
```bash
cd app
npm install
```

### Running Locally

#### Start Backend (Port 7860)
```bash
python server.py
```

#### Start Frontend (Port 5173)
```bash
cd app
npm run dev
```

Visit `http://localhost:5173` to access the application.

## 🌐 Google Colab Deployment

For users without a local GPU, use the included Colab notebook:

1. Open `NovaGen_Colab_Server.ipynb` in Google Colab
2. Run all cells to install dependencies and start the server
3. Copy the Ngrok URL
4. Configure the frontend with the Ngrok URL in Settings

## 📚 Documentation

- **[API Documentation](modulos/README.md)** - Backend endpoints and architecture
- **[Frontend Guide](app/README.md)** - Component structure and state management
- **[Training Guide](scripts/README_TRAINING.md)** - Custom model training
- **[Testing Guide](#testing)** - Running automated tests

## 🧪 Testing

### Backend Tests
```bash
# Run all tests
python -m pytest tests/ -v

# With coverage
python -m pytest tests/ --cov=server --cov-report=html
```

### Frontend Tests
```bash
cd app

# Run tests
npm test

# Watch mode
npm run test:watch

# Coverage
npm run test:coverage
```

**Test Coverage:**
- Backend: 29 tests covering all major endpoints
- Frontend: 88 tests covering stores and utilities
- **Total: 117 automated tests**

## 🏗️ Architecture

### Backend (`server.py`)
- **FastAPI** REST API
- **PyTorch + Diffusers** for AI models
- **Juggernaut-XL v9** base model
- **Phi-3 Mini** for prompt enhancement
- **BLIP** for image captioning
- **InsightFace** for face swapping

### Frontend (`app/src`)
- **React 18** with TypeScript
- **Vite** for fast development
- **Zustand** for state management
- **TailwindCSS** for styling
- **Modular architecture** with feature-based organization

## 📁 Project Structure

```
NovaGenIA/
├── server.py                 # FastAPI backend
├── requirements.txt          # Python dependencies
├── setup_novagen.py         # Model setup script
├── NovaGen_Colab_Server.ipynb  # Colab notebook
├── tests/                   # Backend tests
│   ├── test_server.py
│   ├── test_helpers.py
│   └── conftest.py
├── modulos/                 # AI models directory
├── outputs/                 # Generated images
├── datasets/                # Training datasets
└── app/                     # Frontend application
    ├── src/
    │   ├── modules/         # Feature modules
    │   │   ├── creative/    # Text-to-Image
    │   │   ├── studio/      # Advanced controls
    │   │   ├── estudio/     # Asset library
    │   │   ├── training/    # Model training
    │   │   └── settings/    # Configuration
    │   ├── store/           # Global state
    │   ├── lib/             # Utilities
    │   └── components/      # Shared components
    └── package.json
```

## 🔌 API Endpoints

### Generation
- `POST /generate` - Text-to-Image generation
- `POST /img2img` - Image-to-Image transformation
- `POST /controlnet` - ControlNet-guided generation
- `POST /faceswap` - Face swapping
- `POST /upscale` - Image upscaling

### AI Tools
- `POST /enhance-prompt` - Phi-3 prompt enhancement
- `POST /interrogate` - BLIP image captioning

### Configuration
- `GET /health` - System health check
- `GET /modes` - Available generation modes
- `GET /aspect-ratios` - Aspect ratio presets

### Assets & Training
- `GET /gallery` - List generated images
- `POST /dataset/upload` - Upload training images
- `POST /train` - Start training job

## ⚙️ Configuration

### Backend Configuration
Edit `server.py` to customize:
- Model paths
- Generation parameters
- VRAM optimization settings

### Frontend Configuration
Edit `app/src/store/useGlobalStore.ts` for:
- API endpoint URL
- Theme preferences
- UI settings

## 🎯 Roadmap

- [x] Real-time generation progress ✅
- [x] Multi-GPU support ✅
- [x] Advanced LoRA management ✅
- [x] Community model hub ✅
- [x] Mobile app (PWA) ✅

## 🤝 Contributing

Contributions are welcome! Please read our [Contributing Guide](CONTRIBUTING.md) for details.

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Stable Diffusion XL** by Stability AI
- **Juggernaut-XL v9** by RunDiffusion
- **Phi-3 Mini** by Microsoft
- **BLIP** by Salesforce
- **InsightFace** for face analysis
- **Diffusers** by Hugging Face

## 📧 Contact

**Juan Pablo** - [@Juanpalojime](https://github.com/Juanpalojime)

Project Link: [https://github.com/Juanpalojime/NovaGenIA](https://github.com/Juanpalojime/NovaGenIA)

---

<div align="center">

**Made with ❤️ by the NovaGenIA Team**

</div>
