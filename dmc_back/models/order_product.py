from sqlalchemy import ForeignKey, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship
from base import Base
from order import Order
from product import Product

class OrderProduct(Base):
    __tablename__ = 'orders_products'

    order_id: Mapped[int] = mapped_column(ForeignKey('orders.id', ondelete='CASCADE'))
    order: Mapped[Order] = relationship('Order',  lazy="joined")

    product_id: Mapped[int | None] = mapped_column(ForeignKey('products.id', ondelete='SET NULL'))
    product: Mapped[Product | None] = relationship('Product', lazy="joined")

    count: Mapped[int]

    __table_args__ = (
        UniqueConstraint('order_id', 'product_id'),
    )
