"""Product and category schemas."""

from pydantic import BaseModel, ValidationInfo, field_validator

from .validators import (
    validate_limit,
    validate_non_empty_string,
    validate_non_negative_int,
    validate_non_negative_number,
    validate_optional_non_empty_string,
    validate_optional_non_negative_int,
    validate_optional_non_negative_number,
    validate_optional_positive_int,
    validate_order,
    validate_positive_int,
    validate_sort,
)


class ProductModel(BaseModel):
    """Product response and update payload."""

    id: int
    title: str | None
    description: str | None
    price: float | int | None
    picture_url: str | None
    count_in_stock: int | None
    category_id: int | None

    @field_validator("id")
    @classmethod
    def id_validator(cls, value: int, info: ValidationInfo) -> int:
        """Validate product id is positive."""
        return validate_positive_int(value, info)

    @field_validator("title", "description", "picture_url")
    @classmethod
    def text_fields_validator(cls, value: str | None, info: ValidationInfo) -> str | None:
        """Validate optional text fields when provided."""
        return validate_optional_non_empty_string(value, info)

    @field_validator("price")
    @classmethod
    def price_validator(cls, value: float | int | None, info: ValidationInfo) -> float | int | None:
        """Validate optional price when provided."""
        return validate_optional_non_negative_number(value, info)

    @field_validator("count_in_stock")
    @classmethod
    def count_in_stock_validator(cls, value: int | None, info: ValidationInfo) -> int | None:
        """Validate optional stock count when provided."""
        return validate_optional_non_negative_int(value, info)

    @field_validator("category_id")
    @classmethod
    def category_id_validator(cls, value: int | None, info: ValidationInfo) -> int | None:
        """Validate optional category id when provided."""
        return validate_optional_positive_int(value, info)


class ProductCreateRequest(BaseModel):
    """Payload for creating a product."""

    title: str
    description: str
    price: float | int
    picture_url: str | None
    count_in_stock: int
    category_id: int

    @field_validator("title", "description")
    @classmethod
    def text_fields_validator(cls, value: str, info: ValidationInfo) -> str:
        """Validate required text fields are not empty."""
        return validate_non_empty_string(value, info)

    @field_validator("picture_url")
    @classmethod
    def picture_url_validator(cls, value: str | None, info: ValidationInfo) -> str | None:
        """Validate optional picture url when provided."""
        return validate_optional_non_empty_string(value, info)

    @field_validator("price")
    @classmethod
    def price_validator(cls, value: float | int, info: ValidationInfo) -> float | int:
        """Validate product price is not negative."""
        return validate_non_negative_number(value, info)

    @field_validator("count_in_stock")
    @classmethod
    def count_in_stock_validator(cls, value: int, info: ValidationInfo) -> int:
        """Validate stock count is not negative."""
        return validate_non_negative_int(value, info)

    @field_validator("category_id")
    @classmethod
    def category_id_validator(cls, value: int, info: ValidationInfo) -> int:
        """Validate category id is positive."""
        return validate_positive_int(value, info)


class CategoryModel(BaseModel):
    """Category response and update payload."""

    id: int
    title: str

    @field_validator("id")
    @classmethod
    def id_validator(cls, value: int, info: ValidationInfo) -> int:
        """Validate category id is positive."""
        return validate_positive_int(value, info)

    @field_validator("title")
    @classmethod
    def title_validator(cls, value: str, info: ValidationInfo) -> str:
        """Validate category title is not empty."""
        return validate_non_empty_string(value, info)


class CategoryCreateRequest(BaseModel):
    """Payload for creating a category."""

    title: str

    @field_validator("title")
    @classmethod
    def title_validator(cls, value: str, info: ValidationInfo) -> str:
        """Validate category title is not empty."""
        return validate_non_empty_string(value, info)


class IdRequest(BaseModel):
    """Generic positive id query payload."""

    id: int

    @field_validator("id")
    @classmethod
    def id_validator(cls, value: int, info: ValidationInfo) -> int:
        """Validate id is positive."""
        return validate_positive_int(value, info)


class ProductListRequest(BaseModel):
    """Query parameters for listing products."""

    limit: int = 20
    offset: int = 0
    sort: str = "date"
    order: str = "desc"
    category_id: int | None = None

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

    @field_validator("sort")
    @classmethod
    def sort_validator(cls, value: str) -> str:
        """Validate sort field."""
        return validate_sort(value)

    @field_validator("order")
    @classmethod
    def order_validator(cls, value: str) -> str:
        """Validate sort direction."""
        return validate_order(value)

    @field_validator("category_id")
    @classmethod
    def category_id_validator(cls, value: int | None, info: ValidationInfo) -> int | None:
        """Validate optional category id filter."""
        return validate_optional_positive_int(value, info)
