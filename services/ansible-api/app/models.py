import datetime
from sqlmodel import SQLModel, Field
from typing import Optional
import uuid


class Job(SQLModel, table=True):
    id: str = Field(primary_key=True, default_factory=lambda: str(uuid.uuid4()))
    status: str = "pending"
    rc: Optional[int] = None
    stats: Optional[str] = None
    logs: str = ""
    created_at: datetime.datetime = Field(
        default_factory=lambda: datetime.datetime.now(datetime.timezone.utc)
    )
