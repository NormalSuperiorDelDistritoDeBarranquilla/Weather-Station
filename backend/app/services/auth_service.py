from __future__ import annotations

from typing import Any

from fastapi import Depends, HTTPException, Request, Response, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.security import decode_access_token, verify_password
from app.database import get_db
from app.models.user import User


def authenticate_user(db: Session, username: str, password: str) -> User | None:
    statement = select(User).where(User.username == username.strip())
    user = db.scalar(statement)
    if user is None:
        return None

    if not verify_password(password, user.password_hash):
        return None

    return user


def set_session_cookie(response: Response, token: str) -> None:
    response.set_cookie(
        key=settings.session_cookie_name,
        value=token,
        httponly=True,
        samesite="lax",
        secure=False,
        max_age=settings.jwt_expire_minutes * 60,
        path="/",
    )


def clear_session_cookie(response: Response) -> None:
    response.delete_cookie(
        key=settings.session_cookie_name,
        path="/",
        samesite="lax",
    )


def get_current_user(
    request: Request,
    db: Session = Depends(get_db),
) -> User:
    token = request.cookies.get(settings.session_cookie_name)
    if not token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="No autenticado.",
        )

    try:
        payload: dict[str, Any] = decode_access_token(token)
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Sesion invalida o expirada.",
        ) from exc

    username = payload.get("sub")
    if not username:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token invalido.",
        )

    user = db.scalar(select(User).where(User.username == username))
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Usuario no encontrado.",
        )

    return user
