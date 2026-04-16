from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException, Response, status
from sqlalchemy.orm import Session

from app.core.security import create_access_token
from app.database import get_db
from app.schemas.auth import LoginRequest, LoginResponse, MeResponse, MessageResponse
from app.schemas.user import UserPublic
from app.services.auth_service import (
    authenticate_user,
    clear_session_cookie,
    get_current_user,
    set_session_cookie,
)

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/login", response_model=LoginResponse)
def login(
    payload: LoginRequest,
    response: Response,
    db: Session = Depends(get_db),
) -> LoginResponse:
    user = authenticate_user(db, payload.username, payload.password)
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Credenciales invalidas.",
        )

    token = create_access_token(subject=user.username, role=user.role)
    set_session_cookie(response, token)
    return LoginResponse(
        message="Autenticacion exitosa.",
        user=UserPublic.model_validate(user),
    )


@router.post("/logout", response_model=MessageResponse)
def logout(response: Response) -> MessageResponse:
    clear_session_cookie(response)
    return MessageResponse(message="Sesion cerrada correctamente.")


@router.get("/me", response_model=MeResponse)
def me(current_user=Depends(get_current_user)) -> MeResponse:
    return MeResponse(user=UserPublic.model_validate(current_user))
