from __future__ import annotations

from pydantic import BaseModel, ConfigDict, Field, field_validator

from app.schemas.user import UserPublic


class LoginRequest(BaseModel):
    username: str = Field(min_length=3, max_length=50)
    password: str = Field(min_length=6, max_length=128)

    @field_validator("username")
    @classmethod
    def normalize_username(cls, value: str) -> str:
        return value.strip()


class LoginResponse(BaseModel):
    message: str
    user: UserPublic


class MeResponse(BaseModel):
    user: UserPublic


class MessageResponse(BaseModel):
    message: str


class TokenPayload(BaseModel):
    model_config = ConfigDict(extra="ignore")

    sub: str
    role: str
