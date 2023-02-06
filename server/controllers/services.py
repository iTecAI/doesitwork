from starlite import Controller, get, post, delete, Provide, put
from starlite.exceptions import NotFoundException
from typing import TypedDict, Union
from _types import AppState, Service, Vote
import hashlib
import uuid
from deps import guard_isAdmin


class ServiceController(Controller):
    path = "/services"

    @get("", status_code=200)
    async def get_all_services(self, app_state: AppState) -> list[Service]:
        return [{k: v for k, v in i.items() if k != "_id"} for i in app_state.database.services.find({})]
