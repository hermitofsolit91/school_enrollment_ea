import sys
import os

# Add the project root directory to the Python path
# This allows us to import the backend module
sys.path.append(os.path.dirname(os.path.dirname(__file__)))

from backend.main import app
