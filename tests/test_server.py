import pytest
from unittest.mock import MagicMock, patch
import os

def test_read_root(client):
    response = client.get("/")
    assert response.status_code == 200
    assert response.json()["model"] == "Juggernaut-XL v9"

def test_generate_image(client, mock_pipe, mock_load_model):
    # Setup mock return
    mock_pipe.return_value.images = [MagicMock()]
    
    payload = {
        "prompt": "A futuristic city",
        "steps": 20,
        "num_images": 1,
        "output_format": "png"
    }
    
    response = client.post("/generate", json=payload)
    
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "success"
    assert len(data["images"]) == 1
    assert "url" in data["images"][0]

def test_generate_multiple_images(client, mock_pipe, mock_load_model):
    """Test generating multiple images in one request"""
    mock_pipe.return_value.images = [MagicMock()]
    
    payload = {
        "prompt": "A beautiful landscape",
        "num_images": 4,
        "output_format": "png"
    }
    
    response = client.post("/generate", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert len(data["images"]) == 4

def test_img2img_endpoint(client, mock_img2img, mock_load_model, mocker, sample_base64_image):
    # Mock Image.open to return a valid PIL Image
    mocker.patch("server.Image.open", return_value=MagicMock())
    
    payload = {
        "prompt": "Cyberpunk version",
        "image": sample_base64_image,
        "strength": 0.75,
        "num_images": 1
    }
    
    response = client.post("/img2img", json=payload)
    
    assert response.status_code == 200
    assert len(response.json()["images"]) == 1

def test_img2img_invalid_image(client, mock_img2img, mock_load_model):
    """Test img2img with invalid base64 image"""
    payload = {
        "prompt": "Test",
        "image": "invalid_base64",
        "strength": 0.75,
        "num_images": 1
    }
    
    response = client.post("/img2img", json=payload)
    assert response.status_code == 400

def test_controlnet_endpoint(client, mock_controlnet, mock_load_model, mocker, sample_base64_image):
    """Test ControlNet generation"""
    mocker.patch("server.Image.open", return_value=MagicMock())
    mocker.patch("server.preprocess_control_image", return_value=MagicMock())
    
    payload = {
        "prompt": "A detailed portrait",
        "image": sample_base64_image,
        "control_type": "canny",
        "control_weight": 0.5,
        "num_images": 1
    }
    
    response = client.post("/controlnet", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "success"
    assert len(data["images"]) == 1

def test_controlnet_pyracanny(client, mock_controlnet, mock_load_model, mocker, sample_base64_image):
    """Test ControlNet with PyraCanny preprocessor"""
    mocker.patch("server.Image.open", return_value=MagicMock())
    mocker.patch("server.preprocess_control_image", return_value=MagicMock())
    
    payload = {
        "prompt": "High quality portrait",
        "image": sample_base64_image,
        "control_type": "pyracanny",
        "control_weight": 0.8,
        "num_images": 1
    }
    
    response = client.post("/controlnet", json=payload)
    assert response.status_code == 200

def test_faceswap_endpoint(client, mock_face_swap, mocker, sample_base64_image):
    """Test Face Swap functionality"""
    mocker.patch("server.Image.open", return_value=MagicMock())
    mocker.patch("server.cv2.cvtColor", return_value=MagicMock())
    
    payload = {
        "source_image": sample_base64_image,
        "target_image": sample_base64_image,
        "output_format": "png"
    }
    
    response = client.post("/faceswap", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "success"
    assert "image" in data

def test_faceswap_no_face_detected(client, mocker, sample_base64_image):
    """Test Face Swap when no face is detected"""
    mock_app = MagicMock()
    mock_app.get.return_value = []  # No faces detected
    
    mocker.patch("server.face_app", mock_app)
    mocker.patch("server.face_swapper", MagicMock())
    mocker.patch("server.load_faceswap_models")
    mocker.patch("server.Image.open", return_value=MagicMock())
    mocker.patch("server.cv2.cvtColor", return_value=MagicMock())
    
    payload = {
        "source_image": sample_base64_image,
        "target_image": sample_base64_image
    }
    
    response = client.post("/faceswap", json=payload)
    assert response.status_code == 400

def test_enhance_prompt(client, mock_phi3):
    """Test prompt enhancement with Phi-3"""
    payload = {
        "prompt": "a cat"
    }
    
    response = client.post("/enhance-prompt", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert "enhanced_prompt" in data
    assert data["status"] == "success"

def test_enhance_prompt_model_unavailable(client, mocker):
    """Test prompt enhancement when model is not available"""
    mocker.patch("server.phi3_pipe", None)
    mocker.patch("server.load_phi3_model")
    
    payload = {
        "prompt": "a cat"
    }
    
    response = client.post("/enhance-prompt", json=payload)
    assert response.status_code == 200
    data = response.json()
    # Should return original prompt when model unavailable
    assert data["enhanced_prompt"] == "a cat"

def test_gallery_endpoint(client, mock_glob, mocker):
    """Test gallery endpoint returns generated images"""
    # Mock glob to return fake file paths
    mock_glob.return_value = ["outputs/gen_1.png", "outputs/gen_2.png"]
    
    # Mock os.stat
    mock_stat = MagicMock()
    mock_stat.st_mtime = 1234567890
    mocker.patch("os.stat", return_value=mock_stat)
    
    response = client.get("/gallery")
    assert response.status_code == 200
    data = response.json()
    assert len(data) == 2
    assert data[0]["url"] == "/outputs/gen_1.png"

def test_upscale_endpoint(client, mocker, sample_base64_image):
    """Test upscale endpoint"""
    mock_upscale = MagicMock()
    mock_result = MagicMock()
    mock_result.images = [MagicMock()]
    mock_upscale.return_value = mock_result
    mocker.patch("server.upscale_pipe", mock_upscale)
    mocker.patch("server.load_upscaler_model")
    mocker.patch("server.Image.open", return_value=MagicMock())

    payload = {
        "image": sample_base64_image,
        "prompt": "4k, highres",
        "output_format": "png"
    }

    response = client.post("/upscale", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "success"
    assert "image" in data

def test_dataset_upload(client, mocker, sample_base64_image, mock_os_makedirs):
    """Test dataset upload for training"""
    mock_image = MagicMock()
    mocker.patch("server.Image.open", return_value=mock_image)
    
    payload = {
        "image": sample_base64_image,
        "project_name": "test_project",
        "filename": "test_image.png"
    }
    
    response = client.post("/dataset/upload", json=payload)
    assert response.status_code == 200
    assert response.json()["status"] == "success"

def test_training_start(client, mocker):
    """Test starting a training job"""
    payload = {
        "project_name": "test_project",
        "steps": 1000
    }
    
    response = client.post("/train", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "started"

def test_health_endpoint(client):
    """Test detailed health check endpoint"""
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert "models" in data
    assert "cuda_available" in data
    assert "pytorch_version" in data
    assert "vram" in data

def test_modes_endpoint(client):
    """Test modes configuration endpoint"""
    response = client.get("/modes")
    assert response.status_code == 200
    data = response.json()
    assert "extreme_speed" in data
    assert "speed" in data
    assert "quality" in data
    assert data["speed"]["steps"] == 25
    assert "description" in data["speed"]

def test_aspect_ratios_endpoint(client):
    """Test aspect ratios configuration endpoint"""
    response = client.get("/aspect-ratios")
    assert response.status_code == 200
    data = response.json()
    assert "1:1" in data
    assert "16:9" in data
    assert data["1:1"]["width"] == 1024
    assert data["1:1"]["height"] == 1024
    assert "category" in data["1:1"]

def test_interrogate_endpoint(client, mocker, sample_base64_image):
    """Test BLIP image interrogation endpoint"""
    mock_blip = MagicMock()
    mock_processor = MagicMock()
    mock_processor.return_value = {"pixel_values": MagicMock()}
    mock_blip.generate.return_value = [[1, 2, 3]]
    mock_processor.decode.return_value = "a beautiful landscape"
    
    mocker.patch("server.blip_model", mock_blip)
    mocker.patch("server.blip_processor", mock_processor)
    mocker.patch("server.load_blip_model")
    mocker.patch("server.Image.open", return_value=MagicMock())
    
    payload = {
        "image": sample_base64_image
    }
    
    response = client.post("/interrogate", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert "caption" in data
    assert data["status"] == "success"

def test_interrogate_model_unavailable(client, mocker, sample_base64_image):
    """Test interrogate when BLIP model is not available"""
    mocker.patch("server.blip_model", None)
    mocker.patch("server.load_blip_model")
    
    payload = {
        "image": sample_base64_image
    }
    
    response = client.post("/interrogate", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["caption"] == ""
    assert "error" in data

