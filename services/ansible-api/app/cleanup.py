import threading
import time
from datetime import timedelta
import datetime
from sqlmodel import select
from .database import get_session
from .models import Job

def cleanup_old_logs(days: int = 7):
    """Periodically remove logs from completed jobs older than X days."""
    while True:
        try:
            cutoff = datetime.datetime.now(datetime.timezone.utc) - timedelta(days=days)
            with next(get_session()) as session:
                jobs = session.exec(select(Job)).all()
                for job in jobs:
                    if job.status == "finished" and job.created_at < cutoff:
                        job.logs = ""
                        session.add(job)
                session.commit()
        except Exception as e:
            print(f"[Cleanup] Error: {e}")
        time.sleep(7200)  # run every two hours
