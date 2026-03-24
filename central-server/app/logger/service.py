from typing import Optional, Dict, Any
from app.models import Log  # adjust import if needed
from beanie import PydanticObjectId


async def log_event(
    event_type: str,
    description: Optional[str] = None,
    category: Optional[str] = None,
    source: Optional[str] = None,
    status: str = "Active",
    severity: Optional[str] = None,
    user_id: Optional[PydanticObjectId] = None,
    reference_id: Optional[PydanticObjectId] = None,
    ip_address: Optional[str] = None,
    metadata: Optional[Dict[str, Any]] = None
):
    log = Log(
        event_type=event_type,
        description=description,
        category=category,
        source=source,
        status=status,
        severity=severity,
        user_id=user_id,
        reference_id=reference_id,
        ip_address=ip_address,
        metadata=metadata
    )

    await log.insert()