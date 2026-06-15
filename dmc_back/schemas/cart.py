from pydantic import BaseModel, ValidationInfo, field_validator

from .products import ProductModel as BaseProductModel
from .validators import validate_positive_int


class CartProductModel(BaseProductModel):
    count_in_cart: int

    @field_validator("count_in_cart")
    @classmethod
    def count_in_cart_validator(cls, value: int, info: ValidationInfo) -> int:
        return validate_positive_int(value, info)


class CartProductChangeRequest(BaseModel):
    id: int
    count: int

    @field_validator("id")
    @classmethod
    def id_validator(cls, value: int, info: ValidationInfo) -> int:
        return validate_positive_int(value, info)

    @field_validator("count")
    @classmethod
    def count_validator(cls, value: int, info: ValidationInfo) -> int:
        return validate_positive_int(value, info)


class CartProductDeleteRequest(BaseModel):
    id: int

    @field_validator("id")
    @classmethod
    def id_validator(cls, value: int, info: ValidationInfo) -> int:
        return validate_positive_int(value, info)
