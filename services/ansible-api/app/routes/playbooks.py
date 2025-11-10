from fastapi import APIRouter, UploadFile, File, HTTPException, status
import os
import shutil

router = APIRouter()

PLAYBOOK_DIR = "./playbooks"

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

    return {"filename": file.filename, "content_type": file.content_type, "message": "Playbook uploaded successfully."}