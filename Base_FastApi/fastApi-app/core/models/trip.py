from typing import TYPE_CHECKING
from fastapi_users_db_sqlalchemy import SQLAlchemyBaseUserTable, SQLAlchemyUserDatabase
from sqlalchemy import Integer, ForeignKey, String, Date, Text, Column
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import Mapped, mapped_column

from .base import Base
from core.types.user_id import UserIdType
from .mixin.id_int_pk import IdIntPkMixin


if TYPE_CHECKING:
    from sqlalchemy.ext.asyncio import AsyncSession


class Trip(Base, IdIntPkMixin, SQLAlchemyBaseUserTable[UserIdType]):
    user_id: Mapped[UserIdType] = mapped_column(
        Integer,
        ForeignKey(
            "users.id",
            ondelete="cascade",
        ),
        nullable=False,
    )
    title: Mapped[str] = mapped_column(String(255))
    start_latitude: Mapped[float]
    start_longitude: Mapped[float]
    end_latitude: Mapped[float]
    end_longitude: Mapped[float]

    start_date: Mapped[Date]
    end_date: Mapped[Date]
    preferences: Mapped[dict] = mapped_column(default={})
    notes: Mapped[str] = mapped_column(Text, nullable=True)

    @classmethod
    def get_db(cls, session: "AsyncSession"):
        return SQLAlchemyUserDatabase(
            session,
            Trip,
        )
