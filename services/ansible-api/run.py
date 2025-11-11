#!/usr/bin/env python3
import subprocess
import sys
import os

if __name__ == "__main__":
    # Change directory to script base
    script_dir = os.path.dirname(os.path.abspath(__file__))
    os.chdir(script_dir)

    # Load environment variables from .env file if it exists
    env_path = os.path.join(os.path.dirname(__file__), ".env")
    if os.path.exists(env_path):
        with open(env_path, "r") as f:
            for line in f:
                line = line.strip()
                if line and not line.startswith("#"):
                    if "=" in line:
                        key, value = line.split("=", 1)
                        os.environ[key.strip()] = value.strip()

    # Check if running inside a virtual environment
    if sys.prefix == sys.base_prefix:
        print("Error: Not running in a virtual environment.")
        print(
            "Please activate your virtual environment or run 'python3 create-venv.py' first."
        )
        sys.exit(1)

    command = [sys.executable, "-m", "uvicorn", "app.main:app", "--reload"]
    print(f"Running command: {' '.join(command)}")
    try:
        subprocess.run(command, check=True)
    except subprocess.CalledProcessError as e:
        print(f"Error running uvicorn: {e}")
        sys.exit(e.returncode)
    except FileNotFoundError:
        print(
            "Error: uvicorn or python not found. Make sure uvicorn is installed and python is in your PATH."
        )
        sys.exit(1)
