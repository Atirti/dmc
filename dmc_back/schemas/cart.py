"""Cart schemas."""

from pydantic import BaseModel, ValidationInfo, field_validator

from .products import ProductModel as BaseProductModel
from .validators import validate_positive_int


class CartProductModel(BaseProductModel):
    """Product representation with quantity in current user's cart."""

    count_in_cart: int

    @field_validator("count_in_cart")
    @classmethod
    def count_in_cart_validator(cls, value: int, info: ValidationInfo) -> int:
        """Validate cart count is positive."""
        return validate_positive_int(value, info)


class CartProductChangeRequest(BaseModel):
    """Payload for adding or changing product count in cart."""

    id: int
    count: int

    @field_validator("id")
    @classmethod
    def id_validator(cls, value: int, info: ValidationInfo) -> int:
        """Validate product id is positive."""
        return validate_positive_int(value, info)

    @field_validator("count")
    @classmethod
    def count_validator(cls, value: int, info: ValidationInfo) -> int:
        """Validate requested count is positive."""
        return validate_positive_int(value, info)


class CartProductDeleteRequest(BaseModel):
    """Query payload for deleting a product from cart."""

    id: int

    @field_validator("id")
    @classmethod
    def id_validator(cls, value: int, info: ValidationInfo) -> int:
        """Validate product id is positive."""
        return validate_positive_int(value, info)
