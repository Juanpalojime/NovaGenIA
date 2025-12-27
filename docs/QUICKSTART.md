# NovaGenIA - Quick Start Guide

## Welcome to NovaGenIA! 🎨

This guide will help you get started with NovaGenIA AI image generation in minutes.

## What is NovaGenIA?

NovaGenIA is a professional AI image generation platform powered by Stable Diffusion XL. It offers:
- **Text-to-Image**: Create images from descriptions
- **Image-to-Image**: Transform existing images
- **ControlNet**: Guide generation with structure
- **Face Swap**: Replace faces in images
- **Upscaling**: Enhance image resolution
- **Magic Prompt**: AI-powered prompt enhancement

## Quick Start Options

### Option 1: Google Colab (Recommended for Beginners)

**No installation required! Use Google's free GPU.**

1. **Open the Colab Notebook**
   - Go to: [NovaGen_Colab_Server.ipynb](https://colab.research.google.com/github/Juanpalojime/NovaGenIA/blob/main/NovaGen_Colab_Server.ipynb)

2. **Run All Cells**
   - Click `Runtime` → `Run all`
   - Wait 3-5 minutes for setup

3. **Get Your API URL**
   - Look for the Ngrok URL in the output (e.g., `https://abc123.ngrok.io`)
   - Copy this URL

4. **Access the Frontend**
   - Open the provided frontend URL
   - Or go to Settings and paste your Ngrok URL

5. **Start Creating!**
   - Navigate to Creative Dashboard
   - Enter a prompt
   - Click Generate

### Option 2: Local Installation

**For users with NVIDIA GPU (16GB+ VRAM recommended)**

1. **Clone Repository**
```bash
git clone https://github.com/Juanpalojime/NovaGenIA.git
cd NovaGenIA
```

2. **Install Backend**
```bash
pip install -r requirements.txt
python setup_novagen.py  # Downloads models
```

3. **Install Frontend**
```bash
cd app
npm install
```

4. **Start Backend**
```bash
python server.py
```

5. **Start Frontend** (new terminal)
```bash
cd app
npm run dev
```

6. **Open Browser**
   - Go to `http://localhost:5173`

## Your First Generation

### 1. Navigate to Creative Dashboard

Click "Creative" in the sidebar.

### 2. Write a Prompt

**Good prompts are descriptive:**

❌ Bad: "a cat"
✅ Good: "a majestic orange tabby cat sitting on a velvet cushion, professional photography, soft lighting, detailed fur texture"

**Use the Magic Prompt button** ✨ to enhance simple prompts automatically!

### 3. Choose Settings

- **Mode**: 
  - Extreme Speed (15 steps) - Quick previews
  - Speed (25 steps) - Balanced
  - Quality (40 steps) - Best results

- **Aspect Ratio**:
  - Square (1:1) - Social media
  - Widescreen (16:9) - Desktop wallpapers
  - Portrait (9:16) - Phone wallpapers

### 4. Generate!

Click the "Generate" button and wait 5-10 seconds.

### 5. Save Your Image

- Click the download icon on the generated image
- Or right-click → Save image

## Features Guide

### Text-to-Image

**What it does**: Creates images from text descriptions

**How to use**:
1. Go to Creative Dashboard
2. Enter prompt
3. Adjust settings
4. Generate

**Tips**:
- Be specific about style, lighting, composition
- Use quality keywords: "highly detailed", "professional", "4k"
- Mention art style: "digital art", "oil painting", "photograph"

### Image-to-Image

**What it does**: Transforms existing images

**How to use**:
1. Go to Pro Studio
2. Upload an image
3. Enter transformation prompt
4. Adjust strength (0.5-0.8 recommended)
5. Generate

**Tips**:
- Lower strength = closer to original
- Higher strength = more creative freedom
- Use for style transfer, variations, enhancements

### ControlNet

**What it does**: Guides generation with image structure

**How to use**:
1. Go to Pro Studio → ControlNet tab
2. Upload reference image
3. Choose control type (Canny for edges)
4. Enter prompt
5. Generate

**Tips**:
- Canny: Preserves edges and composition
- Use for pose control, composition matching
- Combine with detailed prompts

### Face Swap

**What it does**: Replaces faces in images

**How to use**:
1. Go to Pro Studio → Face Swap tab
2. Upload source image (face to copy)
3. Upload target image (body/scene)
4. Generate

**Tips**:
- Use clear, front-facing photos
- Ensure good lighting in both images
- Works best with similar angles

### Upscaling

**What it does**: Increases image resolution 4x

**How to use**:
1. Go to Pro Studio → Upscale tab
2. Upload image
3. Enter quality prompt (e.g., "high quality, detailed")
4. Generate

**Tips**:
- Use on final images only
- Takes longer than regular generation
- Best for images you want to print

### Magic Prompt

**What it does**: Enhances simple prompts with AI

**How to use**:
1. Enter basic prompt
2. Click ✨ Magic Prompt button
3. Review enhanced prompt
4. Generate

**Example**:
- Input: "a sunset"
- Output: "A breathtaking sunset over the ocean, vibrant orange and pink hues painting the sky, golden hour lighting, dramatic clouds, professional landscape photography, highly detailed, 8k resolution"

## Asset Library

### Organizing Your Images

1. **View Generated Images**
   - Go to Library
   - See all your creations

2. **Search and Filter**
   - Use search bar
   - Filter by tags
   - Sort by date

3. **Favorites**
   - Click ⭐ to favorite
   - Filter by favorites

4. **Download**
   - Single image: Click download icon
   - Multiple: Select → Download selected

## Training Custom Models

### Creating a LoRA

1. **Prepare Dataset**
   - 10-20 images of your subject
   - Consistent lighting and angles
   - High quality (1024x1024+)

2. **Upload Dataset**
   - Go to Training Center
   - Create new project
   - Upload images

3. **Configure Training**
   - Set project name
   - Choose steps (1000-2000)
   - Enable Magic Mode for auto-tuning

4. **Start Training**
   - Click "Start Training"
   - Wait 10-30 minutes
   - Monitor progress

5. **Use Your Model**
   - Model appears in Creative Dashboard
   - Select from model dropdown
   - Generate with your custom style!

## Tips for Best Results

### Prompt Engineering

**Structure**: `[subject] [doing what] [style] [quality keywords]`

**Example**: 
```
A cyberpunk warrior standing in neon-lit street, 
digital art, highly detailed, dramatic lighting, 
cinematic composition, 8k, trending on artstation
```

**Quality Keywords**:
- highly detailed
- professional photography
- 8k resolution
- masterpiece
- trending on artstation
- award winning

**Style Keywords**:
- digital art
- oil painting
- watercolor
- photograph
- 3D render
- anime style

### Negative Prompts

**Use to avoid**:
- blurry
- low quality
- distorted
- ugly
- bad anatomy
- watermark
- text

### Seed Control

**What it does**: Reproducible generations

**How to use**:
1. Generate an image you like
2. Note the seed number
3. Use same seed + similar prompt = similar results
4. Lock seed for variations

## Troubleshooting

### "Connection Failed"

**Solution**:
1. Check backend is running
2. Verify API URL in Settings
3. For Colab: Check Ngrok URL is active

### "Generation Taking Too Long"

**Solution**:
1. Use "Extreme Speed" mode
2. Reduce image size
3. Lower step count
4. Check GPU is being used

### "Out of Memory"

**Solution**:
1. Generate 1 image at a time
2. Use smaller resolution
3. Restart backend
4. For Colab: Restart runtime

### "Poor Quality Results"

**Solution**:
1. Use "Quality" mode
2. Increase steps to 40+
3. Add quality keywords to prompt
4. Use Magic Prompt
5. Try different seeds

## Keyboard Shortcuts

- `Ctrl/Cmd + Enter` - Generate
- `Ctrl/Cmd + S` - Save current image
- `Ctrl/Cmd + K` - Focus prompt input
- `Esc` - Close dialogs

## Next Steps

1. **Explore Examples**
   - Check the gallery for inspiration
   - Try recreating styles you like

2. **Join Community**
   - Share your creations
   - Get feedback
   - Learn from others

3. **Advanced Features**
   - Experiment with ControlNet
   - Train custom models
   - Combine multiple techniques

## Getting Help

- **Documentation**: Check README.md and API docs
- **Issues**: Report bugs on GitHub
- **Questions**: Open a discussion

---

**Happy Creating! 🎨✨**

For more detailed information, see:
- [Full Documentation](../README.md)
- [API Reference](../modulos/README.md)
- [Contributing Guide](../CONTRIBUTING.md)
