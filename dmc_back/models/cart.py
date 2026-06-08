from sqlalchemy import ForeignKey, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship
from .base import Base


class Cart(Base):
    __tablename__ = 'carts'

    user_id: Mapped[int] = mapped_column(ForeignKey('users.id', ondelete='CASCADE'))
    user: Mapped["User"] = relationship('User', back_populates='products_in_cart')

    product_id: Mapped[int] = mapped_column(ForeignKey('products.id', ondelete='CASCADE'))
    product: Mapped["Product"] = relationship('Product')
    count: Mapped[int]

    __table_args__ = (
        UniqueConstraint('user_id', 'product_id'),
    )