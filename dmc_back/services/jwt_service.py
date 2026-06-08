import jwt
import datetime
import secrets
from fastapi import HTTPException, status
from sqlalchemy.orm import Session


class JwtService:
    def __init__(self, secrets_dct: dict, db: Session):
        self.secret = secrets_dct["secret"]
        self.algorithm = secrets_dct["algorithm"]
        self.exp_minutes = secrets_dct["exp_minutes"]
        self.refresh_exp_days = secrets_dct["refresh_exp_days"]
        self.db = db


    def create_token_pair(self, user_id: int, username: str) -> dict[str, str]:
        """
        generate JWT and Refresh tokens
        """
        payload = {
            "user_id": user_id,
            "username": username,
            "exp": datetime.datetime.utcnow() + datetime.timedelta(minutes=self.exp_minutes)
        }

        refresh_token = secrets.token_urlsafe(32)
        # TODO put refresh token in database.

        return {"jwt_token": jwt.encode(payload, self.secret, algorithm=self.algorithm),
                "refresh_token": refresh_token}

    def refresh_token(self, refresh_token: str) -> dict[str, str]:
        """
        finds user using refresh token in database and returns a new pair of jwt and refresh tokens
        """
        # TODO find user in db
        user_id = 0
        username = "delete later"

        tokens_pair = self.create_token_pair(user_id, username)

        #TODO update refresh token in db

        return tokens_pair

    def decode(self, token ) -> dict:
        """
        decodes jwt token and returns user id and username
        """
        try:
            payload = jwt.decode(token, self.secret, algorithms=self.algorithm)
            return {"user_id": payload["user_id"], "username": payload["username"]}

        except jwt.ExpiredSignatureError:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Token expired")
        except jwt.InvalidTokenError:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")

