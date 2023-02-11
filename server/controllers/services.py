from starlite import Controller, get, post, delete, Provide, put
from starlite.exceptions import NotFoundException
from typing import TypedDict, Union
from _types import AppState, Service, Vote
import time
import uuid
from deps import guard_isAdmin

class CreateService(TypedDict):
    name: str
    category: str
    location: str


class NewVote(TypedDict):
    status: bool
    flags: list[str]

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

    @delete("/{service_id:str}", guards=[guard_isAdmin], status_code=200)
    async def delete_service(self, app_state: AppState, service_id: str) -> None:
        app_state.database.services.delete_one({"service_id": service_id})

    @post("/{service_id:str}/vote", status_code=200)
    async def vote_for_service(self, app_state: AppState, service_id: str, data: NewVote) -> Vote:
        cur_service: Service = app_state.database.services.find_one(
            {"service_id": service_id})
        if cur_service == None:
            raise NotFoundException(detail="Service not found.")
        new_vote = Vote(working=data["status"],
                        flags=data["flags"], timestamp=time.time())
        cur_service["votes"].append(new_vote)
        app_state.database.services.replace_one(
            {"service_id": service_id}, cur_service, upsert=True)
        return new_vote

    @delete("/{service_id:str}/votes", guards=[guard_isAdmin], status_code=200)
    async def delete_service(self, app_state: AppState, service_id: str) -> None:
        app_state.database.services.update_one(
            {"service_id": service_id}, {"$set": {"votes": []}})
