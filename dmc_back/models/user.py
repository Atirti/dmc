"""User database model."""

from sqlalchemy.orm import Mapped, mapped_column, relationship
from .base import Base

class User(Base):
    """Registered user with auth credentials, orders, and cart rows."""

    __tablename__ = 'users'

    username: Mapped[str] = mapped_column(unique=True)
    password: Mapped[str]

    orders: Mapped[list["Order"]] = relationship("Order", back_populates="user")
    products_in_cart: Mapped[list["Cart"]] = relationship("Cart", back_populates="user")
