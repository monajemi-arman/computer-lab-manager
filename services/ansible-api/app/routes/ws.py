import asyncio
from fastapi import APIRouter, WebSocket
from ..database import get_session
from ..crud import get_job
from ..websockets import clients

router = APIRouter(prefix="/ws", tags=["websocket"])


@router.websocket("/{task_id}")
async def stream_logs(websocket: WebSocket, task_id: str):
    await websocket.accept()
    clients.setdefault(task_id, []).append(websocket)

    # Send existing logs if available
    session = next(get_session())
    try:
        job = get_job(session, task_id)
        if job and job.logs:
            for line in job.logs.splitlines():
                await websocket.send_text(line)
    finally:
        session.close()

    try:
        while True:
            await asyncio.wait_for(websocket.receive_text(), timeout=30.0)  # keep alive
    except Exception:
        pass
    finally:
        clients[task_id].remove(websocket)
