from datetime import datetime, timezone, timedelta
import jwt
import secrets
from fastapi import HTTPException, status
from repositories import RefreshTokenRepository


class JwtService:
    def __init__(self, secrets_dct: dict, repository: RefreshTokenRepository):
        self.secret = secrets_dct["secret"]
        self.algorithm = secrets_dct["algorithm"]
        self.exp_minutes = secrets_dct["exp_minutes"]
        self.refresh_exp_days = secrets_dct["refresh_exp_days"]
        self.refresh_token_repository = repository

    def create_token_pair(self, user_id: int, username: str) -> dict[str, str | datetime]:
        """
        generate JWT and Refresh tokens
        """
        payload = {
            "user_id": user_id,
            "username": username,
            "exp": datetime.now(timezone.utc) + timedelta(minutes=self.exp_minutes)
        }

        refresh_token = secrets.token_urlsafe(32)
        refresh_exp_date = datetime.now(timezone.utc) + timedelta(days=self.refresh_exp_days)

        return {"jwt_token": jwt.encode(payload, self.secret, algorithm=self.algorithm),
                "refresh_token": refresh_token,
                "refresh_exp_date": refresh_exp_date}

    async def add_refresh_token(self, user_id: int, username: str) -> dict[str, str]:
        """
        add refresh token to database
        """
        dct = self.create_token_pair(user_id, username)
        tokens_pair = {"jwt_token": dct["jwt_token"], "refresh_token": dct["refresh_token"]}

        await self.refresh_token_repository.add_refresh_token(user_id, dct["refresh_token"],
                                                              dct["refresh_exp_date"])
        return tokens_pair

    async def update_refresh_token(self, refresh_token: str) -> dict[str, str]:
        """
        finds user using refresh token in database
        replace old refresh token with new one
        and returns a new pair of jwt and refresh tokens
        """
        user = await self.refresh_token_repository.get_user_by_refresh_token(refresh_token)

        if user is None:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid or expired refresh token")

        dct = self.create_token_pair(user.id, user.username)
        tokens_pair = {"jwt_token": dct["jwt_token"], "refresh_token": dct["refresh_token"]}

        await self.refresh_token_repository.update_refresh_token(user.id, refresh_token, dct['refresh_token'],
                                                                 dct['refresh_exp_date'])
        return tokens_pair

    async def delete_refresh_token(self, refresh_token: str) -> None:
        """
        delete refresh token in database
        """
        await self.refresh_token_repository.delete_refresh_token(refresh_token)


    def decode(self, token ) -> dict:
        """
        decodes jwt token and returns user id and username
        """
        try:
            payload = jwt.decode(token, self.secret, algorithms=[self.algorithm])
            return {"user_id": payload["user_id"], "username": payload["username"]}

        except jwt.ExpiredSignatureError:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Token expired")
        except jwt.InvalidTokenError:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")

