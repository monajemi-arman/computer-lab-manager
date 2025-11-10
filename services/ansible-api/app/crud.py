from sqlmodel import select, Session
from .models import Job
import json
import io


def create_job(session: Session) -> Job:
    job = Job(status="queued")
    session.add(job)
    session.commit()
    session.refresh(job)
    return job


def get_job(session: Session, job_id: str) -> Job | None:
    result = session.exec(select(Job).where(Job.id == job_id))
    return result.first()


def update_job_status(session: Session, job: Job, status: str):
    job.status = status
    session.commit()


def update_job_result(session: Session, job: Job, rc: int, stats: dict):
    job.rc = rc
    job.stats = json.dumps(stats)
    session.commit()


def append_job_log(session: Session, job: Job, log_line: str):
    if isinstance(log_line, io.TextIOWrapper):
        log_line = log_line.read()
    job.logs += log_line + "\n"
    session.commit()
