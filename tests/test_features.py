import pytest
from advanced_samplers import get_all_samplers
from quality_presets import QUALITY_PRESETS
from sdxl_styles import SDXL_STYLES, get_categories

def test_samplers_structure():
    samplers = get_all_samplers()
    assert isinstance(samplers, list)
    assert len(samplers) > 0
    for sampler in samplers:
        assert 'name' in sampler
        assert 'id' in sampler

def test_presets_validity():
    assert len(QUALITY_PRESETS) > 0
    for preset in QUALITY_PRESETS.values():
        assert preset['steps'] > 0
        assert preset['cfg_scale'] > 0

def test_styles_categories():
    assert len(SDXL_STYLES) > 0
    categories = get_categories()
    assert len(categories) > 0
    assert 'All' not in categories # All is usually added by frontend
    
    # Check if styles have valid categories
    for style in SDXL_STYLES:
        if style.get('category'):
             assert style['category'] in categories


