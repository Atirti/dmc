import os
import secrets

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """
    Application settings
    """
    DB_HOST: str
    DB_PORT: int
    DB_NAME: str
    DB_USER: str
    DB_PASSWORD: str

    JWT_SECRET: str
    JWT_ALGORITHM: str
    JWT_EXPIRE_MINUTES: int

    REFRESH_TOKEN_EXPIRE_DAYS: int

    ADMIN_USERNAME: str
    ADMIN_PASSWORD: str

    ADMIN_JWT_SECRET: str
    ADMIN_JWT_ALGORITHM: str
    ADMIN_JWT_EXPIRE_MINUTES: int

    ADMIN_REFRESH_TOKEN: str = ""

    TEST_DB_HOST: str
    TEST_DB_PORT: int
    TEST_DB_NAME: str
    TEST_DB_USER: str
    TEST_DB_PASSWORD: str

    model_config = SettingsConfigDict(
        env_file=os.path.join(os.path.dirname(os.path.abspath(__file__)), ".env")
    )

    def get_db_async_url(self) -> str:
        """
        get db url from environment variables
        :return db url for async connection
        """
        return f"postgresql+asyncpg://{self.DB_USER}:{self.DB_PASSWORD}@{self.DB_HOST}:{self.DB_PORT}/{self.DB_NAME}"

    def get_db_url(self) -> str:
        """
        for alembic migration
        get db url from environment variables
        :return db url for async connection
        """
        return f"postgresql://{self.DB_USER}:{self.DB_PASSWORD}@{self.DB_HOST}:{self.DB_PORT}/{self.DB_NAME}"

    def get_test_async_db_url(self) -> str:
        """
        """
        return f"postgresql+asyncpg://{self.TEST_DB_USER}:{self.TEST_DB_PASSWORD}@{self.TEST_DB_HOST}:{self.TEST_DB_PORT}/{self.TEST_DB_NAME}"

    def get_jwt_secret(self) -> dict:
        """
        get jwt secret from environment variables
        :return dict with jwt settings
        """
        return {"secret": self.JWT_SECRET, "algorithm": self.JWT_ALGORITHM, "exp_minutes": self.JWT_EXPIRE_MINUTES,
                "refresh_exp_days": self.REFRESH_TOKEN_EXPIRE_DAYS, "admin_secret": self.ADMIN_JWT_SECRET,
                "admin_algorithm": self.ADMIN_JWT_ALGORITHM, "admin_exp_minutes": self.ADMIN_JWT_EXPIRE_MINUTES,
                "admin_refresh_token": self.ADMIN_REFRESH_TOKEN}

    def get_admin_user(self) -> dict:
        return {"username": self.ADMIN_USERNAME, "password": self.ADMIN_PASSWORD}