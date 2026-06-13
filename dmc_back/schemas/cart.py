from pydantic import BaseModel, field_validator
from schemas.products import ProductModel as p


class ProductModel(p):
    count_in_cart: int


class ProductRequest(BaseModel):
    id: int
    count: int

    @field_validator('id')
    @classmethod
    def id_validator(cls, v):
        if v < 0:
            raise ValueError('id must be >= 0')
        return v

    @field_validator('count')
    @classmethod
    def count_validator(cls, v):
        if v < 1:
            raise ValueError('count must be >= 1')
        return v

class DeleteRequest(BaseModel):
    id: int
    @field_validator('id')
    @classmethod
    def id_validator(cls, v):
        if v < 0:
            raise ValueError('id must be >= 0')
        return v