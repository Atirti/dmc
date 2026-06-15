from pydantic import BaseModel, ValidationInfo, field_validator

from .validators import (
    validate_auth_content,
    validate_non_empty_string,
    validate_password,
    validate_username,
)


class LoginRequest(BaseModel):
    username: str
    password: str

    @field_validator("username", "password")
    @classmethod
    def content_validator(cls, value: str, info: ValidationInfo) -> str:
        return validate_auth_content(value, info)

    @field_validator("username")
    @classmethod
    def username_validator(cls, value: str) -> str:
        return validate_username(value)

    @field_validator("password")
    @classmethod
    def password_validator(cls, value: str) -> str:
        return validate_password(value)


class TokenRequest(BaseModel):
    refresh_token: str

    @field_validator("refresh_token")
    @classmethod
    def refresh_token_validator(cls, value: str, info: ValidationInfo) -> str:
        return validate_non_empty_string(value, info)


class TokenResponse(BaseModel):
    jwt_token: str
    refresh_token: str


class LogoutRequest(BaseModel):
    refresh_token: str

    @field_validator("refresh_token")
    @classmethod
    def refresh_token_validator(cls, value: str, info: ValidationInfo) -> str:
        return validate_non_empty_string(value, info)
