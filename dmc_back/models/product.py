"""Product database model."""

from sqlalchemy import ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship
from .base import Base


class Product(Base):
    """Sellable product linked to a category."""

    __tablename__ = 'products'

    title: Mapped[str]
    description: Mapped[str | None]
    price: Mapped[float]
    picture_url: Mapped[str | None]
    count_in_stock: Mapped[int]

    category_id: Mapped[int] = mapped_column(ForeignKey('categories.id'))
    category: Mapped["Category"] = relationship("Category", back_populates="products")
