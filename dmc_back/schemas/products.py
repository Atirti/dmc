from pydantic import BaseModel, field_validator


class ProductModel(BaseModel):
    id: int
    title: str | None
    description: str | None
    price: float | int | None
    picture_url: str | None
    count_in_stock: int | None
    category_id: int | None

class ProductRequest(BaseModel):
    title: str
    description: str
    price: float | int
    picture_url: str | None
    count_in_stock: int
    category_id: int

class CategoryModel(BaseModel):
    id: int
    title: str

class CategoryRequest(BaseModel):
    title: str

class RequestId(BaseModel):
    id: int
    @field_validator("id")
    @classmethod
    def category_id_validator(cls, v):
        if v is not None:
            if v < 0:
                raise ValueError("Category id must be greater than 0")
        return v

class ProductsRequest(BaseModel):
    limit: int = 20
    offset: int = 0
    sort: str = "date"
    order: str = "desc"
    category_id: int | None = None

    @field_validator("limit")
    @classmethod
    def limit_validator(cls, v):
        if v > 500:
            raise ValueError("Limit must be less than 500")
        if v < 1:
            raise ValueError("Limit must be greater than 1")
        return v

    @field_validator("offset")
    @classmethod
    def last_product_id_validator(cls, v):
        if v < 0:
            raise ValueError("Offset must be greater than 0")
        return v

    @field_validator("sort")
    @classmethod
    def sort_validator(cls, v):
        if v not in ["date", "price"]:
            raise ValueError("Sort must be 'date' or 'price'")
        return v

    @field_validator("order")
    @classmethod
    def order_validator(cls, v):
        if v not in ["asc", "desc"]:
            raise ValueError("Order must be 'asc' or 'desc'")
        return v

    @field_validator("category_id")
    @classmethod
    def category_id_validator(cls, v):
        if v is not None:
            if v < 0:
                raise ValueError("Category id must be greater than 0")
        return v
