import asyncio
from typing import Dict, List
from fastapi import WebSocket
from starlette.websockets import WebSocketDisconnect

clients: Dict[str, List[WebSocket]] = {}


async def broadcast_log(task_id: str, message: str):
    """Send logs to all active clients for a job."""
    if task_id not in clients:
        return

    still_alive = []
    for ws in clients[task_id]:
        if ws.client_state.name != "CONNECTED":
            continue
        try:
            await ws.send_text(message + '\n')
            still_alive.append(ws)
        except Exception:
            pass  # Ignore dropped client
    clients[task_id] = still_alive


async def handle_websocket(websocket: WebSocket, task_id: str, log_history: str):
    """Manages WebSocket connection with periodic heartbeat and cleanup."""
    await websocket.accept()
    clients.setdefault(task_id, []).append(websocket)

    # Send backlog logs immediately
    if log_history:
        for line in log_history.splitlines():
            await websocket.send_text(line + '\n')

    try:
        while True:
            try:
                # Wait for client messages or timeout (30s)
                await asyncio.wait_for(websocket.receive_text(), timeout=30.0)
            except asyncio.TimeoutError:
                # Send heartbeat ping
                await websocket.send_text("[ping]")
    except WebSocketDisconnect:
        pass
    finally:
        # Cleanup: remove client from registry
        if task_id in clients and websocket in clients[task_id]:
            clients[task_id].remove(websocket)


async def cleanup_all_clients():
    """Called on shutdown — clears all client references."""
    for task_id, ws_list in list(clients.items()):
        for ws in ws_list:
            try:
                await ws.close()
            except Exception:
                pass
        clients.pop(task_id, None)
