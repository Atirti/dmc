"""Order schemas."""

from pydantic import AwareDatetime, BaseModel, Field, ValidationInfo, field_validator

from .products import ProductModel as BaseProductModel
from .validators import (
    validate_limit,
    validate_non_empty_string,
    validate_non_negative_int,
    validate_non_negative_number,
    validate_optional_order_status,
    validate_positive_int,
)


class OrderProductModel(BaseProductModel):
    """Product representation inside an order."""

    count: int

    @field_validator("count")
    @classmethod
    def count_validator(cls, value: int, info: ValidationInfo) -> int:
        """Validate ordered product count is positive."""
        return validate_positive_int(value, info)


class OrderModel(BaseModel):
    """Order response with product rows."""

    id: int
    products: list[OrderProductModel]
    status: str
    price: float | int
    address: str

    @field_validator("id")
    @classmethod
    def id_validator(cls, value: int, info: ValidationInfo) -> int:
        """Validate order id is positive."""
        return validate_positive_int(value, info)

    @field_validator("status", "address")
    @classmethod
    def text_fields_validator(cls, value: str, info: ValidationInfo) -> str:
        """Validate text fields are not empty."""
        return validate_non_empty_string(value, info)

    @field_validator("price")
    @classmethod
    def price_validator(cls, value: float | int, info: ValidationInfo) -> float | int:
        """Validate order price is not negative."""
        return validate_non_negative_number(value, info)


class AdminOrderModel(OrderModel):
    """Order response with user id for admin lists."""

    user_id: int

    @field_validator("user_id")
    @classmethod
    def user_id_validator(cls, value: int, info: ValidationInfo) -> int:
        """Validate user id is positive."""
        return validate_positive_int(value, info)


class OrderUpdateRequest(BaseModel):
    """Admin payload for updating order status."""

    order_id: int
    user_id: int
    status: str

    @field_validator("order_id", "user_id")
    @classmethod
    def ids_validator(cls, value: int, info: ValidationInfo) -> int:
        """Validate ids are positive."""
        return validate_positive_int(value, info)

    @field_validator("status")
    @classmethod
    def status_validator(cls, value: str, info: ValidationInfo) -> str:
        """Validate status is not empty."""
        return validate_non_empty_string(value, info)


class OrderProductRequest(BaseModel):
    """Requested product and quantity for order creation."""

    product_id: int
    product_count: int

    @field_validator("product_id")
    @classmethod
    def product_id_validator(cls, value: int, info: ValidationInfo) -> int:
        """Validate product id is positive."""
        return validate_positive_int(value, info)

    @field_validator("product_count")
    @classmethod
    def product_count_validator(cls, value: int, info: ValidationInfo) -> int:
        """Validate requested product count is positive."""
        return validate_positive_int(value, info)


class CreateOrderRequest(BaseModel):
    """Payload for creating an order."""

    products: list[OrderProductRequest] = Field(min_length=1)
    address: str

    @field_validator("address")
    @classmethod
    def address_validator(cls, value: str, info: ValidationInfo) -> str:
        """Validate delivery address is not empty."""
        return validate_non_empty_string(value, info)


class OrderPaymentRequest(BaseModel):
    """Payload identifying an order for payment operations."""

    order_id: int

    @field_validator("order_id")
    @classmethod
    def order_id_validator(cls, value: int, info: ValidationInfo) -> int:
        """Validate order id is positive."""
        return validate_positive_int(value, info)


class AdminOrdersRequest(BaseModel):
    """Admin query payload for selecting a user's orders."""

    user_id: int

    @field_validator("user_id")
    @classmethod
    def user_id_validator(cls, value: int, info: ValidationInfo) -> int:
        """Validate user id is positive."""
        return validate_positive_int(value, info)


class AdminAllOrdersRequest(BaseModel):
    """Admin query parameters for listing all orders."""

    limit: int = 20
    offset: int = 0
    created_at_from: AwareDatetime | None = None
    created_at_to: AwareDatetime | None = None
    status: str | None = None

    @field_validator("limit")
    @classmethod
    def limit_validator(cls, value: int) -> int:
        """Validate list limit."""
        return validate_limit(value)

    @field_validator("offset")
    @classmethod
    def offset_validator(cls, value: int, info: ValidationInfo) -> int:
        """Validate list offset."""
        return validate_non_negative_int(value, info)

    @field_validator("status")
    @classmethod
    def status_validator(cls, value: str | None, info: ValidationInfo) -> str | None:
        """Validate optional order status filter."""
        return validate_optional_order_status(value, info)


class AdminOrderRequest(AdminOrdersRequest):
    """Admin query payload for selecting one user order."""

    order_id: int

    @field_validator("order_id")
    @classmethod
    def order_id_validator(cls, value: int, info: ValidationInfo) -> int:
        """Validate order id is positive."""
        return validate_positive_int(value, info)
