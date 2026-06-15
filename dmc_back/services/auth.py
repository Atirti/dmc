"""Authentication service."""

from bcrypt import hashpw, checkpw, gensalt

from models import User
from repositories import UserRepository

from fastapi import HTTPException, status


class AuthService:
    """Authenticate regular users and configured admin credentials."""

    def __init__(self, repository: UserRepository, admin_settings: dict):
        self.__user_repository = repository
        self.__admin_username = admin_settings["username"]
        self.__admin_password = admin_settings["password"]

    async def login(self, username, password) -> User:
        """
        Find user
        check password if user exists
        else raise Exception
        """
        user = await self.__user_repository.get_user_by_login(username)

        if user is not None:
            if checkpw(password.encode(), user.password.encode()):
                return user
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Incorrect username or password")

    async def registration(self, username, password) -> User:
        """
        Checks if user not exists
        then create new user
        """
        existing = await self.__user_repository.get_user_by_login(username)
        if existing:
            raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Username already taken")

        return await self.__user_repository.create_user(username, hashpw(password.encode(), gensalt()).decode())

    async def get_user_id_by_username(self, username: str) -> int:
        """Return user id for username."""
        user = await self.__user_repository.get_user_by_login(username)
        if user is None:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
        return user.id


    async def admin_login(self, username, password):
        """Validate configured admin username and password."""
        if username == self.__admin_username and password == self.__admin_password:
            return username
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Incorrect username or password")

