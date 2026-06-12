from sqlalchemy import ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship
from .base import Base


class Order(Base):
    __tablename__ = 'orders'

    user_id: Mapped[int] = mapped_column(ForeignKey('users.id', ondelete='CASCADE'))
    user: Mapped["User"] = relationship("User", back_populates="orders")

    status: Mapped[str]
    address: Mapped[str]

    price: Mapped[float]
