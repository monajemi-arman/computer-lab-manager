import asyncio
import ansible_runner
import os
import sys
from .crud import get_job, update_job_status, update_job_result, append_job_log
from .database import get_session
from .websockets import broadcast_log


def run_ansible_job_sync(task_id: str, playbook: str, hosts: dict):
    """Run Ansible with dynamic hosts."""
    loop = asyncio.new_event_loop()
    asyncio.set_event_loop(loop)

    async def _run():
        session = next(get_session())
        try:
            job = get_job(session, task_id)  
            update_job_status(session, job, "running")  
            append_job_log(session, job, f"Starting playbook: {playbook}")  
        finally:
            session.close()

        def event_handler(event):
            log_line = None
            if "stdout" in event and event["stdout"].strip():
                log_line = event["stdout"]
            elif "event_data" in event and \
                    "res" in event["event_data"] and \
                    "stdout" in event["event_data"]["res"] and \
                    event["event_data"]["res"]["stdout"].strip():
                log_line = event["event_data"]["res"]["stdout"]

            if log_line:
                # Schedule _handle_event on the existing event loop
                loop.call_soon_threadsafe(loop.create_task, _handle_event(task_id, log_line))

        inventory = {"all": {"hosts": hosts}}

        # Ensure the private_data_dir exists
        private_data_dir = "."
        os.makedirs(private_data_dir, exist_ok=True)

        r = ansible_runner.run(
            private_data_dir=private_data_dir,
            playbook=playbook,
            inventory=inventory,
            event_handler=event_handler,
        )

        session = next(get_session())
        try:
            job = get_job(session, task_id)  
            update_job_result(session, job, r.rc, r.stats)  
            update_job_status(session, job, r.status)  
            append_job_log(session, job, f"[DONE] {r.status}")  
            if r.stdout:
                append_job_log(session, job, r.stdout)
            if r.stderr:
                append_job_log(session, job, r.stderr)
            await broadcast_log(job.id, f"[DONE] {r.status}")
        finally:
            session.close()

    async def _handle_event(task_id: str, log_line: str):
        session = next(get_session())
        try:
            job = get_job(session, task_id)  
            append_job_log(session, job, log_line)  
            await broadcast_log(task_id, log_line)
        finally:
            session.close()

    loop.run_until_complete(_run())
