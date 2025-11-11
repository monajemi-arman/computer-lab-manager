from fastapi import APIRouter, UploadFile, File, HTTPException, status
import os
import shutil

router = APIRouter()

PLAYBOOK_DIR = "./playbooks"

os.makedirs(PLAYBOOK_DIR, exist_ok=True)

@router.post("/playbooks/")
async def upload_playbook(file: UploadFile = File(...)):
    if not file.filename.endswith(('.yml', '.yaml')):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid file type. Only .yml or .yaml files are allowed."
        )
    
    file_path = os.path.join(PLAYBOOK_DIR, file.filename)
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    return {
        "filename": file.filename,
        "content_type": file.content_type,
        "message": "Playbook uploaded successfully."
    }

@router.get("/playbooks/")
async def list_playbooks():
    try:
        files = [
            f for f in os.listdir(PLAYBOOK_DIR)
            if f.endswith(('.yml', '.yaml'))
        ]
        return {"playbooks": files}
    except FileNotFoundError:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Playbook directory not found."
        )

@router.delete("/playbooks/{filename}")
async def delete_playbook(filename: str):
    if not filename.endswith(('.yml', '.yaml')):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid file type. Only .yml or .yaml files can be deleted."
        )

    file_path = os.path.join(PLAYBOOK_DIR, filename)

    if not os.path.exists(file_path):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Playbook '{filename}' not found."
        )

    try:
        os.remove(file_path)
        return {"message": f"Playbook '{filename}' deleted successfully."}
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to delete playbook: {str(e)}"
        )
