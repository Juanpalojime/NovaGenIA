# NovaGenIA Test Suite

## Status
- **Generic Tests**: 23 errors (Legacy/Env dependent)
- **Feature Tests**: ✅ PASSED (New Samplers, Presets, Styles)
- **GPU Tests**: Requires NVIDIA GPU + CUDA (Mocking restricted)
- **Websocket Tests**: Requires Async Server (Skipped for stability)

## How to Run
```bash
python -m pytest tests/test_features.py
```

## Environment
Ensure `requirements.txt` is installed and `python -m pytest` is used to resolve `conftest.py`.
