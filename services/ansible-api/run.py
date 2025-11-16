#!/usr/bin/env python3
import subprocess
import sys
import os

def load_env_file(env_file_path):
    """Load environment variables from a .env file."""
    if os.path.exists(env_file_path):
        with open(env_file_path) as f:
            for line in f:
                line = line.strip()
                if line and not line.startswith("#") and "=" in line:
                    key, value = line.split("=", 1)
                    os.environ[key.strip()] = value.strip()

def ensure_venv():
    """Ensure we are running inside a virtual environment. If not, try to load one."""
    if sys.prefix != sys.base_prefix:
        # Already in a venv
        return sys.executable

    # Try to find a local 'venv' folder
    venv_path = os.path.join(os.path.dirname(__file__), "venv")
    if not os.path.isdir(venv_path):
        print("Error: Virtual environment not found. Run 'python3 create-venv.py' first.")
        sys.exit(1)

    # Construct paths to venv's Python and bin
    bin_path = os.path.join(venv_path, "bin")
    python_executable = os.path.join(bin_path, "python")
    if not os.path.exists(python_executable):
        print(f"Error: Python not found in virtual environment at {python_executable}")
        sys.exit(1)

    # Prepend venv bin to PATH for subprocesses
    os.environ["PATH"] = f"{bin_path}:{os.environ.get('PATH','')}"
    print(f"Activated virtual environment from {venv_path}")
    return python_executable

if __name__ == "__main__":
    # Change to script directory
    script_dir = os.path.dirname(os.path.abspath(__file__))
    os.chdir(script_dir)

    # Load .env
    load_env_file(os.path.join(script_dir, ".env"))

    # Ensure virtual environment is loaded
    python = ensure_venv()

    # Run uvicorn using the venv Python
    command = [python, "-m", "uvicorn", "app.main:app", "--reload"]
    print(f"Running command: {' '.join(command)}")
    try:
        subprocess.run(command, check=True)
    except subprocess.CalledProcessError as e:
        print(f"Error running uvicorn: {e}")
        sys.exit(e.returncode)
    except FileNotFoundError:
        print("Error: uvicorn or python not found. Make sure uvicorn is installed and python is in your PATH.")
        sys.exit(1)
