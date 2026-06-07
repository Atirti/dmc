from sqlalchemy.orm import Mapped, mapped_column, relationship
from base import Base
from models.cart import Cart
from order import Order

class User(Base):
    __tablename__ = 'users'

    username: Mapped[str] = mapped_column(unique=True)
    password: Mapped[str]

    orders: Mapped[list[Order]] = relationship("Order", back_populates="user")
    products_in_cart: Mapped[list[Cart]] = relationship("Cart", back_populates="user")
