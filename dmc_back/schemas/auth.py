from pydantic import BaseModel, field_validator, ValidationInfo
from string import ascii_letters, digits, punctuation, ascii_lowercase, ascii_uppercase


class LoginRequest(BaseModel):
    username: str
    password: str

    @field_validator("username", "password")
    @classmethod
    def content_validator(cls, v, info: ValidationInfo):
        for ch in v:
            if ch not in ascii_letters + punctuation + digits:
                raise ValueError(f"{info.field_name} must contain only eng letters, numbers, and/or punctuation")

        return v

    @field_validator("password")
    @classmethod
    def password_validator(cls, v):
        if len(v) < 8:
            raise ValueError("Password must be at least 8 characters")

        low = False
        up = False
        digit = False
        punct = False

        for ch in v:

            if ch in ascii_lowercase:
                low = True
            if ch in ascii_uppercase:
                up = True
            if ch in punctuation:
                punct = True
            if ch in digits:
                digit = True

        if not (low and up and digit and punct):
            raise ValueError("Password must contains lower and upper case letters, digits and punctuation")

        return v

    @field_validator("username")
    @classmethod
    def username_validator(cls, v):
        if len(v) < 4:
            raise ValueError("Username must be at least 4 characters")

        if len(v) > 50:
            raise ValueError("Username should be no more than 50 characters")

        return v


class TokenRequest(BaseModel):
    refresh_token: str


class TokenResponse(BaseModel):
    jwt_token: str
    refresh_token: str


class LogoutRequest(BaseModel):
    refresh_token: str
