from starlite import Controller, get, post
from _types import AppState, Location
from uuid import uuid4
from deps import guard_isAdmin
from typing import Optional, TypedDict


class CreateLocation(TypedDict):
    name: str
    parent: Optional[str]
    icon: Optional[str]


class LocationController(Controller):
    path = "/locations"

    @get("", status_code=200)
    async def list_locations(self, app_state: AppState, parent: Optional[str] = None) -> list[Location]:
        if parent:
            return [i for i in app_state.database.locations.find({"parent_id": parent})]
        else:
            return [i for i in app_state.database.locations.find({})]

    @post("", status_code=200, guards=[guard_isAdmin])
    async def create_location(self, app_state: AppState, data: CreateLocation) -> str:
        newLoc = Location(location_id=uuid4().hex, parent_id=data["parent"] if "parent" in data.keys(
        ) else "root", name=data["name"], icon=data["icon"] if "icon" in data.keys() else None)
        app_state.database.locations.insert_one(newLoc)
        return newLoc["location_id"]
