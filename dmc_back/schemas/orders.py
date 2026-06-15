from pydantic import BaseModel, Field, ValidationInfo, field_validator

from .products import ProductModel as BaseProductModel
from .validators import validate_non_empty_string, validate_non_negative_number, validate_positive_int


class OrderProductModel(BaseProductModel):
    count: int

    @field_validator("count")
    @classmethod
    def count_validator(cls, value: int, info: ValidationInfo) -> int:
        return validate_positive_int(value, info)


class OrderModel(BaseModel):
    id: int
    products: list[OrderProductModel]
    status: str
    price: float | int
    address: str

    @field_validator("id")
    @classmethod
    def id_validator(cls, value: int, info: ValidationInfo) -> int:
        return validate_positive_int(value, info)

    @field_validator("status", "address")
    @classmethod
    def text_fields_validator(cls, value: str, info: ValidationInfo) -> str:
        return validate_non_empty_string(value, info)

    @field_validator("price")
    @classmethod
    def price_validator(cls, value: float | int, info: ValidationInfo) -> float | int:
        return validate_non_negative_number(value, info)


class OrderUpdateRequest(BaseModel):
    order_id: int
    user_id: int
    status: str

    @field_validator("order_id", "user_id")
    @classmethod
    def ids_validator(cls, value: int, info: ValidationInfo) -> int:
        return validate_positive_int(value, info)

    @field_validator("status")
    @classmethod
    def status_validator(cls, value: str, info: ValidationInfo) -> str:
        return validate_non_empty_string(value, info)


class OrderProductRequest(BaseModel):
    product_id: int
    product_count: int

    @field_validator("product_id")
    @classmethod
    def product_id_validator(cls, value: int, info: ValidationInfo) -> int:
        return validate_positive_int(value, info)

    @field_validator("product_count")
    @classmethod
    def product_count_validator(cls, value: int, info: ValidationInfo) -> int:
        return validate_positive_int(value, info)


class CreateOrderRequest(BaseModel):
    products: list[OrderProductRequest] = Field(min_length=1)
    address: str

    @field_validator("address")
    @classmethod
    def address_validator(cls, value: str, info: ValidationInfo) -> str:
        return validate_non_empty_string(value, info)


class OrderPaymentRequest(BaseModel):
    order_id: int

    @field_validator("order_id")
    @classmethod
    def order_id_validator(cls, value: int, info: ValidationInfo) -> int:
        return validate_positive_int(value, info)


class AdminOrdersRequest(BaseModel):
    user_id: int

    @field_validator("user_id")
    @classmethod
    def user_id_validator(cls, value: int, info: ValidationInfo) -> int:
        return validate_positive_int(value, info)


class AdminOrderRequest(AdminOrdersRequest):
    order_id: int

    @field_validator("order_id")
    @classmethod
    def order_id_validator(cls, value: int, info: ValidationInfo) -> int:
        return validate_positive_int(value, info)
