import os
import uuid
import bcrypt
import jwt
from datetime import datetime, timezone, timedelta
from fastapi import HTTPException, Request, Depends

JWT_ALGORITHM = "HS256"
ACCESS_TTL_MIN = 60 * 24 * 7  # 7 days for storefront convenience


def hash_password(password: str) -> str:
    salt = bcrypt.gensalt()
    return bcrypt.hashpw(password.encode("utf-8"), salt).decode("utf-8")


def verify_password(plain: str, hashed: str) -> bool:
    try:
        return bcrypt.checkpw(plain.encode("utf-8"), hashed.encode("utf-8"))
    except Exception:
        return False


def _secret() -> str:
    return os.environ["JWT_SECRET"]


def create_access_token(user_id: str, email: str, role: str) -> str:
    payload = {
        "sub": user_id,
        "email": email,
        "role": role,
        "type": "access",
        "exp": datetime.now(timezone.utc) + timedelta(minutes=ACCESS_TTL_MIN),
    }
    return jwt.encode(payload, _secret(), algorithm=JWT_ALGORITHM)


def _extract_token(request: Request):
    auth_header = request.headers.get("Authorization", "")
    if auth_header.startswith("Bearer "):
        return auth_header[7:]
    return request.cookies.get("access_token")


def make_get_current_user(db):
    async def get_current_user(request: Request) -> dict:
        token = _extract_token(request)
        if not token:
            raise HTTPException(status_code=401, detail="Not authenticated")
        try:
            payload = jwt.decode(token, _secret(), algorithms=[JWT_ALGORITHM])
            if payload.get("type") != "access":
                raise HTTPException(status_code=401, detail="Invalid token type")
            user = await db.users.find_one({"id": payload["sub"]}, {"_id": 0})
            if not user:
                raise HTTPException(status_code=401, detail="User not found")
            user.pop("password_hash", None)
            return user
        except jwt.ExpiredSignatureError:
            raise HTTPException(status_code=401, detail="Token expired")
        except jwt.InvalidTokenError:
            raise HTTPException(status_code=401, detail="Invalid token")

    return get_current_user


def make_require_admin(get_current_user):
    async def require_admin(user: dict = Depends(get_current_user)) -> dict:
        if user.get("role") != "admin":
            raise HTTPException(status_code=403, detail="Admin access required")
        return user

    return require_admin


def new_id() -> str:
    return str(uuid.uuid4())
