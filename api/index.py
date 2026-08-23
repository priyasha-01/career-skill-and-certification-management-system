import sys
import os

# Add root folder to sys.path so Python can find the backend module
sys.path.append(os.path.join(os.path.dirname(__file__), ".."))

from backend.app.main import app
