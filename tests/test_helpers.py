import pytest
from unittest.mock import MagicMock, patch
from PIL import Image
import numpy as np

# Import functions from server
from server import (
    validate_aspect_ratio,
    get_aspect_ratio_config,
    MODE_CONFIGS,
    ASPECT_RATIOS,
    GenerationMode
)


class TestAspectRatioValidation:
    """Test aspect ratio validation and configuration"""
    
    def test_validate_aspect_ratio_valid(self):
        """Test valid aspect ratios (multiples of 64)"""
        assert validate_aspect_ratio(1024, 1024) == True
        assert validate_aspect_ratio(1344, 768) == True
        assert validate_aspect_ratio(512, 512) == True
    
    def test_validate_aspect_ratio_invalid(self):
        """Test invalid aspect ratios (not multiples of 64)"""
        assert validate_aspect_ratio(1000, 1000) == False
        assert validate_aspect_ratio(1023, 768) == False
        assert validate_aspect_ratio(500, 500) == False
    
    def test_get_aspect_ratio_config_valid(self):
        """Test getting valid aspect ratio config"""
        config = get_aspect_ratio_config("1:1")
        assert config.name == "Square"
        assert config.width == 1024
        assert config.height == 1024
        
        config_16_9 = get_aspect_ratio_config("16:9")
        assert config_16_9.name == "Widescreen"
        assert config_16_9.width == 1344
        assert config_16_9.height == 768
    
    def test_get_aspect_ratio_config_invalid(self):
        """Test getting invalid aspect ratio returns default"""
        config = get_aspect_ratio_config("invalid_ratio")
        assert config.name == "Square"  # Should return default 1:1
        assert config.width == 1024


class TestModeConfigurations:
    """Test generation mode configurations"""
    
    def test_mode_configs_exist(self):
        """Test that all mode configs are defined"""
        assert GenerationMode.EXTREME_SPEED in MODE_CONFIGS
        assert GenerationMode.SPEED in MODE_CONFIGS
        assert GenerationMode.QUALITY in MODE_CONFIGS
    
    def test_extreme_speed_config(self):
        """Test extreme speed mode configuration"""
        config = MODE_CONFIGS[GenerationMode.EXTREME_SPEED]
        assert config["steps"] == 15
        assert config["sampler"] == "euler_a"
        assert config["cfg_scale"] == 5.0
    
    def test_speed_config(self):
        """Test speed mode configuration"""
        config = MODE_CONFIGS[GenerationMode.SPEED]
        assert config["steps"] == 25
        assert config["sampler"] == "dpm_2m_karras"
        assert config["cfg_scale"] == 6.5
    
    def test_quality_config(self):
        """Test quality mode configuration"""
        config = MODE_CONFIGS[GenerationMode.QUALITY]
        assert config["steps"] == 40
        assert config["sampler"] == "dpm_2m_karras"
        assert config["cfg_scale"] == 7.5


class TestAspectRatioConstants:
    """Test aspect ratio constants"""
    
    def test_all_aspect_ratios_defined(self):
        """Test that all expected aspect ratios are defined"""
        expected_ratios = ["1:1", "16:9", "3:2", "4:3", "9:16", "2:3", "3:4", "21:9", "4:5", "1:2"]
        for ratio in expected_ratios:
            assert ratio in ASPECT_RATIOS
    
    def test_aspect_ratio_names(self):
        """Test aspect ratio names are correct"""
        assert ASPECT_RATIOS["1:1"] == "Square"
        assert ASPECT_RATIOS["16:9"] == "Widescreen"
        assert ASPECT_RATIOS["9:16"] == "Portrait"


class TestSaveImage:
    """Test image saving functionality"""
    
    def test_save_image_png(self, mocker):
        """Test saving image as PNG"""
        from server import save_image
        
        mock_image = MagicMock()
        mocker.patch("os.path.join", return_value="outputs/test.png")
        
        filename, filepath = save_image(mock_image, "png")
        
        assert filename.endswith(".png")
        assert filepath == "outputs/test.png"
        mock_image.save.assert_called_once()
    
    def test_save_image_jpeg(self, mocker):
        """Test saving image as JPEG"""
        from server import save_image
        
        mock_image = MagicMock()
        mocker.patch("os.path.join", return_value="outputs/test.jpeg")
        
        filename, filepath = save_image(mock_image, "jpeg")
        
        assert filename.endswith(".jpeg")
        mock_image.save.assert_called_once()
    
    def test_save_image_jpg_conversion(self, mocker):
        """Test that 'jpg' is converted to 'jpeg'"""
        from server import save_image
        
        mock_image = MagicMock()
        mocker.patch("os.path.join", return_value="outputs/test.jpeg")
        
        filename, filepath = save_image(mock_image, "jpg")
        
        # Should convert jpg to jpeg
        assert filename.endswith(".jpeg")

