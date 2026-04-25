import os
import sys
from pathlib import Path

ROOT = Path(__file__).parent
# Makes 'import backend' work (backend is a package relative to project root)
sys.path.insert(0, str(ROOT))
# Makes 'from analyzer import ...' work inside main.py when imported as backend.main
sys.path.insert(0, str(ROOT / "backend"))

os.environ.setdefault("OPENAI_API_KEY", "test-key-for-pytest")
