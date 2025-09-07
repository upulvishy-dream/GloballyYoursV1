# backend/api/index.py
import os
import sys

# Add backend/src to sys.path so we can import main.py
backend_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
src_dir = os.path.join(backend_dir, "src")
sys.path.insert(0, src_dir)

# Import the FastAPI app exported by backend/src/main.py
from main import app
