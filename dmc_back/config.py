import os
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

    model_config = SettingsConfigDict(
        env_file=os.path.join(os.path.dirname(os.path.abspath(__file__)), ".env")
    )


    def get_db_url(self) -> str:
        """
        get db url from environment variables
        :return db url for async connection
        """
        return f"postgresql+asyncpg://{self.DB_USER}:{self.DB_PASSWORD}@{self.DB_HOST}:{self.DB_PORT}/{self.DB_NAME}?sslmode=require"


    def get_jwt_secret(self) -> dict:
        """
        get jwt secret from environment variables
        :return dict with jwt settings
        """
        return {"secret": self.JWT_SECRET, "algorithm": self.JWT_ALGORITHM, "exp_minutes": self.JWT_EXPIRE_MINUTES, "refresh_exp_days": self.REFRESH_TOKEN_EXPIRE_DAYS}


settings = Settings()
