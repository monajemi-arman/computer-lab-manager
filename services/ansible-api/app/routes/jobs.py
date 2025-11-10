import os
from typing import Any, Dict
from fastapi import APIRouter, BackgroundTasks, Depends
from pydantic import BaseModel
from sqlmodel import Session
from ..database import get_session
from ..crud import create_job, get_job
from ..ansible_runner_service import run_ansible_job_sync
import json

router = APIRouter(prefix="/jobs", tags=["jobs"])

DEFAULT_SSH_USER = os.getenv("SSH_USER", "computer-lab-manager")

class JobRequest(BaseModel):
    playbook: str
    hosts: Dict[str, Dict[str, Any]]  # hostname -> ansible variables


@router.post("/run")
async def run_playbook(
    payload: JobRequest, background_tasks: BackgroundTasks, session: Session = Depends(get_session)
):
    job = create_job(session)

    # Add default SSH key to each host if not provided
    for host, options in payload.hosts.items():
        options.setdefault("ansible_ssh_private_key_file", "./.ssh/id_rsa")
        options.setdefault("ansible_user", DEFAULT_SSH_USER)

    background_tasks.add_task(
        run_ansible_job_sync, job.id, payload.playbook, payload.hosts
    )

    session.close()
    return {"task_id": job.id}


@router.get("/{task_id}")
async def get_results(task_id: str, session: Session = Depends(get_session)):
        job = get_job(session, task_id)
        if not job:
            return {"error": "Invalid task_id"}
        return {
            "task_id": job.id,
            "status": job.status,
            "rc": job.rc,
            "stats": json.loads(job.stats or "{}"),
            "logs": job.logs,
        }
