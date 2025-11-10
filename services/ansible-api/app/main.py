import threading
import os
from fastapi import FastAPI, Depends, HTTPException, status, Security
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from contextlib import asynccontextmanager
from .database import init_db, engine
from .routes import jobs, ws, playbooks
from .websockets import cleanup_all_clients
from .cleanup import cleanup_old_logs

security = HTTPBearer()

@asynccontextmanager
async def lifespan(app: FastAPI):
    # --- Startup ---
    init_db()

    # --- Cleanup (background) ---
    thread = threading.Thread(target=cleanup_old_logs, daemon=True)
    thread.start()

    print("Database initialized")
    yield
    # --- Shutdown ---
    await cleanup_all_clients()
    await engine.dispose()

async def verify_shared_key(credentials: HTTPAuthorizationCredentials = Security(security)):
    shared_key = os.environ.get("ANSIBLE_API_SHARED_KEY")
    if shared_key:
        if credentials.credentials != shared_key:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid shared key",
                headers={"WWW-Authenticate": "Bearer"},
            )

app = FastAPI(title="Ansible Runner API", lifespan=lifespan, dependencies=[Depends(verify_shared_key)])

app.include_router(jobs.router)
app.include_router(ws.router)
app.include_router(playbooks.router)