# Entrypoint shim allowing `uvicorn main:app` directly from root directory
import sys
from pathlib import Path

backend_dir = str(Path(__file__).parent / "backend")
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

from backend.main import app
