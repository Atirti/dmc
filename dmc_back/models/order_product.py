from sqlalchemy import ForeignKey, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship
from typing import Optional
from .base import Base

class OrderProduct(Base):
    __tablename__ = 'orders_products'

    order_id: Mapped[int] = mapped_column(ForeignKey('orders.id', ondelete='CASCADE'))
    order: Mapped["Order"] = relationship('Order')

    product_id: Mapped[int | None] = mapped_column(ForeignKey('products.id', ondelete='SET NULL'))
    product: Mapped[Optional["Product"]] = relationship('Product')

    count: Mapped[int]

    __table_args__ = (
        UniqueConstraint('order_id', 'product_id'),
    )
