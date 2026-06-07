from sqlalchemy import ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship
from base import Base
from category import Category


class Product(Base):
    __tablename__ = 'products'

    title: Mapped[str]
    description: Mapped[str | None]
    price: Mapped[float]
    picture_url: Mapped[str | None]
    count_in_stock: Mapped[int]

    category_id: Mapped[int] = mapped_column(ForeignKey('categories.id'))
    category: Mapped[Category] = relationship("Category", lazy="joined", back_populates="products")