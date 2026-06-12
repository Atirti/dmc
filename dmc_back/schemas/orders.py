from pydantic import BaseModel, field_validator
from schemas.products import ProductModel as p


class ProductModel(p):
    count: int


class OrderModel(BaseModel):
    id: int
    products: list[ProductModel]
    status: str
    price: float | int


class ProductRequest(BaseModel):
    product_id: int
    product_count: int

    @field_validator('product_id')
    @classmethod
    def id_validator(cls, v):
        if v < 0:
            raise ValueError('id must be >= 0')
        return v

    @field_validator('product_count')
    @classmethod
    def count_validator(cls, v):
        if v < 1:
            raise ValueError('count must be >= 1')
        return v


class PayRequest(BaseModel):
    order_id: int

    @field_validator('order_id')
    @classmethod
    def id_validator(cls, v):
        if v < 0:
            raise ValueError('id must be >= 0')
        return v
