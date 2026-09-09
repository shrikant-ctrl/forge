from collections.abc import Callable
from typing import Annotated

from fastapi import Depends
from prisma.enums import Role
from prisma.models import User

from app.common.guards.auth_guard import get_current_user
from app.core.exceptions import ForbiddenException


def Roles(*allowed_roles: Role) -> Callable[[User], User]:
    """NestJS-style Roles decorator/guard factory."""

    def role_checker(user: Annotated[User, Depends(get_current_user)]) -> User:
        if user.role not in allowed_roles:
            role_names = [r.value for r in allowed_roles]
            raise ForbiddenException(
                f"Access denied: Required role in {role_names}, but user has role '{user.role}'"
            )
        return user

    return role_checker
