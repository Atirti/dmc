"""Category database model."""

from sqlalchemy.orm import Mapped, mapped_column, relationship
from .base import Base

class Category(Base):
    """Product category with a unique title."""

    __tablename__ = 'categories'

    title: Mapped[str] = mapped_column(unique=True)

    products: Mapped[list["Product"]] = relationship("Product", back_populates="category")
