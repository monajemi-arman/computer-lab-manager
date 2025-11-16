import asyncio
import ansible_runner
import logging
from .crud import get_job, update_job_status, update_job_result, append_job_log
from .database import get_session
from .websockets import broadcast_log

# === ENABLE ANSIBLE LOGGING ===
logging.getLogger("ansible_runner").setLevel(logging.DEBUG)
logging.getLogger("ansible").setLevel(logging.DEBUG)
handler = logging.StreamHandler()
formatter = logging.Formatter("%(asctime)s - %(name)s - %(levelname)s - %(message)s")
handler.setFormatter(formatter)
logging.getLogger("ansible_runner").addHandler(handler)
logging.getLogger("ansible").addHandler(handler)


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
            if event.get("stdout", "").strip():
                log_line = event["stdout"]
            elif (
                "event_data" in event
                and "res" in event["event_data"]
                and event["event_data"]["res"].get("stdout", "").strip()
            ):
                log_line = event["event_data"]["res"]["stdout"]

            if log_line:
                loop.call_soon_threadsafe(
                    lambda: loop.create_task(_handle_event(task_id, log_line))
                )

        inventory = {"all": {"hosts": hosts}}

        r = ansible_runner.run(
            private_data_dir=".",
            playbook=playbook,
            inventory=inventory,
            event_handler=event_handler,
            quiet=False,
        )

        # === FINAL LOGGING ===
        session = next(get_session())
        try:
            job = get_job(session, task_id)
            rc = r.rc if r.rc is not None else -1
            update_job_result(session, job, rc, r.stats)
            update_job_status(session, job, r.status)

            status_msg = f"[DONE] Status: {r.status}, RC: {rc}"
            append_job_log(session, job, status_msg)
            await broadcast_log(job.id, status_msg)

            if r.stdout:
                for line in r.stdout.read().splitlines():
                    if line.strip():
                        append_job_log(session, job, line)
                        await broadcast_log(job.id, line)

            if r.stderr:
                for line in r.stderr.read().splitlines():
                    if line.strip():
                        append_job_log(session, job, f"ERROR: {line}")
                        await broadcast_log(job.id, f"ERROR: {line}")

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

    try:
        loop.run_until_complete(_run())
    finally:
        loop.close()
