from __future__ import annotations

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.security import hash_password
from app.models.user import User


def seed_initial_data(db: Session) -> None:
    admin = db.scalar(select(User).where(User.username == "admin"))
    if admin is None:
        db.add(
            User(
                username="admin",
                password_hash=hash_password("admin123"),
                role="admin",
            ),
        )

    db.commit()
