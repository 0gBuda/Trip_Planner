from fastapi_users import FastAPIUsers

from api.dependencies.auth.user_manager import get_user_manager
from core.types.user_id import UserIdType
from core.models.user import User
from api.dependencies.auth.backend import authentication_backend

fastapi_users = FastAPIUsers[User, UserIdType](
    get_user_manager,
    [authentication_backend],
)
