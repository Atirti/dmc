from datetime import datetime
from sqlalchemy import ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship
from .base import Base


class RefreshToken(Base):
    __tablename__ = 'refresh_tokens'

    user_id: Mapped[int] = mapped_column(ForeignKey('users.id', ondelete='CASCADE'))
    user: Mapped["User"] = relationship("User", lazy="joined")

    token: Mapped[str] = mapped_column(unique=True)
    expires_at: Mapped[datetime]
