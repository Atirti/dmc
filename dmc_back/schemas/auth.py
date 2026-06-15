"""Authentication request and response schemas."""

from pydantic import BaseModel, ValidationInfo, field_validator

from .validators import (
    validate_auth_content,
    validate_non_empty_string,
    validate_password,
    validate_username,
)


class LoginRequest(BaseModel):
    """Username and password payload for login and registration."""

    username: str
    password: str

    @field_validator("username", "password")
    @classmethod
    def content_validator(cls, value: str, info: ValidationInfo) -> str:
        """Validate allowed characters for auth fields."""
        return validate_auth_content(value, info)

    @field_validator("username")
    @classmethod
    def username_validator(cls, value: str) -> str:
        """Validate username rules."""
        return validate_username(value)

    @field_validator("password")
    @classmethod
    def password_validator(cls, value: str) -> str:
        """Validate password rules."""
        return validate_password(value)


class TokenRequest(BaseModel):
    """Refresh token payload."""

    refresh_token: str

    @field_validator("refresh_token")
    @classmethod
    def refresh_token_validator(cls, value: str, info: ValidationInfo) -> str:
        """Validate refresh token is not empty."""
        return validate_non_empty_string(value, info)


class TokenResponse(BaseModel):
    """JWT and refresh token response payload."""

    jwt_token: str
    refresh_token: str


class UserIdRequest(BaseModel):
    """Admin query payload for looking up a user by username."""

    username: str

    @field_validator("username")
    @classmethod
    def content_validator(cls, value: str, info: ValidationInfo) -> str:
        """Validate allowed characters for username."""
        return validate_auth_content(value, info)

    @field_validator("username")
    @classmethod
    def username_validator(cls, value: str) -> str:
        """Validate username rules."""
        return validate_username(value)


class UserIdResponse(BaseModel):
    """User id response payload."""

    id: int


class LogoutRequest(BaseModel):
    """Refresh token payload for logout."""

    refresh_token: str

    @field_validator("refresh_token")
    @classmethod
    def refresh_token_validator(cls, value: str, info: ValidationInfo) -> str:
        """Validate refresh token is not empty."""
        return validate_non_empty_string(value, info)
