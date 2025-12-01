from fastapi import Request
from starlette.responses import JSONResponse
from app.utils.jwt import verify_token
from app.auth.service import get_user_by_email
from app.models import User


PROTECTED_PREFIXES: list[str] = [
    "/user"
]

async def auth_middleware(request: Request, call_next):
    path = request.url.path
    is_protected = any(path.startswith(prefix) for prefix in PROTECTED_PREFIXES)

    token = None

    # Extract Bearer token
    auth_header = request.headers.get("Authorization")

    if auth_header and auth_header.startswith("Bearer "):
        token = auth_header.replace("Bearer ", "")

    if is_protected:
        # No token → reject immediately
        if not token:
            return JSONResponse(
                {"detail": "Authorization token missing"},
                status_code=401,
            )

        # Decode JWT
        payload = verify_token(token)
        if not payload:
            return JSONResponse(
                {"detail": "Invalid authentication token"},
                status_code=401,
            )

        email: str = payload.get("sub") # type: ignore
        if not email:
            return JSONResponse(
                {"detail": "Invalid token payload"},
                status_code=401,
            )

        user: User | None = await get_user_by_email(email)
        if not user:
            return JSONResponse(
                {"detail": "User not found"},
                status_code=401,
            )

        request.state.user = user.to_safe_user()

    else:
        # Public route → attach user if token exists but don't block
        if token:
            payload = verify_token(token)
            if payload:
                email: str = payload.get("sub") # type: ignore
                user_temp = (await get_user_by_email(email))
                if not user_temp:
                    request.user.state = None
                else:
                    request.state.user = user_temp.to_safe_user()
            else:
                request.state.user = None
        else:
            request.state.user = None

    return await call_next(request)
