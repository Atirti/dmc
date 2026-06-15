"""Database engine and async session factory setup."""

from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker


class Database():
    """Create SQLAlchemy async engine and session factory for one database URL."""

    def __init__(self, db_url):
        self.engine = create_async_engine(url=db_url, connect_args={"ssl": "require"})
        self.session_factory = async_sessionmaker(bind=self.engine)
