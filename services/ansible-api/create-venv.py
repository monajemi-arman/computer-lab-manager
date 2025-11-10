import subprocess
import sys
import os

def create_and_activate_venv():
    venv_name = "venv"
    current_dir = os.path.dirname(os.path.abspath(__file__))
    venv_path = os.path.join(current_dir, venv_name)
    requirements_file = os.path.join(current_dir, "requirements.txt")

    print(f"Script running from: {current_dir}")
    print(f"Target virtual environment path: {venv_path}")
    print(f"Using Python executable: {sys.executable}")

    # 1. Create the virtual environment if it doesn't exist
    if not os.path.exists(venv_path):
        print(f"Virtual environment '{venv_name}' not found. Attempting to create...")
        try:
            # Explicitly redirect stdout and stderr to the console for real-time output
            # Increased timeout to 600 seconds (10 minutes) for venv creation
            print(f"Running command: {sys.executable} -m venv {venv_name}")
            result = subprocess.run(
                [sys.executable, "-m", "venv", venv_name],
                check=True,
                stdout=sys.stdout, # Stream stdout directly
                stderr=sys.stderr, # Stream stderr directly
                timeout=600 # 10 minutes timeout
            )
            print(f"Virtual environment '{venv_name}' creation command finished.")

            # Explicitly check if the directory was created after the command
            if os.path.exists(venv_path):
                print(f"Virtual environment '{venv_name}' successfully created at {venv_path}.")
            else:
                print(f"Error: Virtual environment '{venv_name}' was not found at {venv_path} after creation attempt. This indicates a potential issue with venv creation despite no immediate error.")
                sys.exit(1)
        except subprocess.TimeoutExpired:
            print(f"Error: Virtual environment creation timed out after 600 seconds.")
            print("This usually indicates a problem with your Python installation, system resources, or permissions.")
            print(f"Please try running the command manually in your terminal: '{sys.executable}' -m venv '{venv_name}'")
            sys.exit(1)
        except subprocess.CalledProcessError as e:
            print(f"Error creating virtual environment: {e}")
            print("Please check the output above for specific error messages from the 'venv' command.")
            print(f"Also, try running the command manually in your terminal: '{sys.executable}' -m venv '{venv_name}'")
            sys.exit(1)
        except Exception as e:
            print(f"An unexpected error occurred during venv creation: {e}")
            sys.exit(1)
    else:
        print(f"Virtual environment '{venv_name}' already exists at {venv_path}.")

    # 2. Determine the path to the Python executable inside the venv
    if sys.platform == "win32":
        venv_python_executable = os.path.join(venv_path, "Scripts", "python.exe")
    else:
        venv_python_executable = os.path.join(venv_path, "bin", "python")

    # Ensure the venv python executable exists
    if not os.path.exists(venv_python_executable):
        print(f"Error: Virtual environment Python executable not found at {venv_python_executable}. This might indicate a corrupted venv or an issue during creation.")
        sys.exit(1)

    # 3. Install requirements from requirements.txt
    if os.path.exists(requirements_file):
        print(f"Installing requirements from '{requirements_file}' into '{venv_name}' (showing pip's progress directly)...")
        try:
            # Stream pip install output directly to show its native progress bar
            print(f"Running command: {venv_python_executable} -m pip install -r {requirements_file}")
            result = subprocess.run(
                [venv_python_executable, "-m", "pip", "install", "-r", requirements_file],
                check=True,
                stdout=sys.stdout, # Stream stdout directly
                stderr=sys.stderr, # Stream stderr directly
                timeout=600 # 10 minutes timeout
            )
            print("Requirements installation command finished.")
            print("Requirements installed successfully.")
        except subprocess.TimeoutExpired:
            print(f"Error: Requirements installation timed out after 600 seconds.")
            print("Please check your network connection and the contents of requirements.txt.")
            sys.exit(1)
        except subprocess.CalledProcessError as e:
            print(f"Error installing requirements: {e}")
            print("Please check the output above for specific error messages from the 'pip install' command.")
            sys.exit(1)
    else:
        print(f"Warning: '{requirements_file}' not found. Skipping requirements installation.")

    print(f"\nTo activate the virtual environment, run:")
    if sys.platform == "win32":
        print(f"  .\\{venv_name}\\Scripts\\activate")
    else:
        print(f"  source ./{venv_name}/bin/activate")

if __name__ == "__main__":
    create_and_activate_venv()
