from starlite import Controller, get, post, delete, Provide, put
from starlite.exceptions import NotFoundException
from typing import TypedDict, Union
from _types import AppState, Service, Vote
import hashlib
import uuid
from deps import guard_isAdmin

class CreateService(TypedDict):
    name: str
    category: str
    location: str

class ServiceController(Controller):
    path = "/services"

    @get("", status_code=200)
    async def get_all_services(self, app_state: AppState) -> list[Service]:
        return [{k: v for k, v in i.items() if k != "_id"} for i in app_state.database.services.find({})]
    
    @post("", guards=[guard_isAdmin], status_code=201)
    async def create_service(self, app_state: AppState, data: CreateService) -> str:
        new_service = Service(service_id=uuid.uuid4().hex, name=data["name"], category=data["category"], location=data["location"], votes=[])
        app_state.database.services.insert_one(new_service)
        return new_service["service_id"]

