from pydantic import BaseModel


class UserModel(BaseModel):
    username: str
    password: str


class TokenModel(BaseModel):
    refresh_token: str
