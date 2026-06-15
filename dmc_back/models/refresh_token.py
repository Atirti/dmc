"""Refresh token database model."""

from datetime import datetime
from sqlalchemy import ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship
from .base import Base


class RefreshToken(Base):
    """Stored refresh token with expiration time for a user."""

    __tablename__ = 'refresh_tokens'

    user_id: Mapped[int] = mapped_column(ForeignKey('users.id', ondelete='CASCADE'))
    user: Mapped["User"] = relationship("User")

    token: Mapped[str] = mapped_column(unique=True)
    expires_at: Mapped[datetime]
