from starlite import Controller, get, post, NotFoundException, delete
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
            return [{k: v for k, v in i.items() if k != "_id"} for i in app_state.database.locations.find({"parent_id": parent})]
        else:
            return [{k: v for k, v in i.items() if k != "_id"} for i in app_state.database.locations.find({})]

    @get("/{location_id:str}", status_code=200)
    async def get_specific_location(self, app_state: AppState, location_id: str) -> Location:
        item: Location = app_state.database.locations.find_one(
            {"location_id": location_id})
        if item:
            return {k: v for k, v in item.items() if k != "_id"}
        else:
            raise NotFoundException(detail="Location not found")

    @post("", status_code=200, guards=[guard_isAdmin])
    async def create_location(self, app_state: AppState, data: CreateLocation) -> str:
        newLoc = Location(location_id=uuid4().hex, parent_id=data["parent"] if "parent" in data.keys(
        ) else "root", name=data["name"], icon=data["icon"] if "icon" in data.keys() else None)
        app_state.database.locations.insert_one(newLoc)
        return newLoc["location_id"]

    @post("/{location_id:str}", status_code=200, guards=[guard_isAdmin])
    async def edit_location(self, app_state: AppState, location_id: str, data: CreateLocation) -> str:
        item: Location = app_state.database.locations.find_one(
            {"location_id": location_id})
        if item:
            item["icon"] = data["icon"]
            item["name"] = data["name"]
            item["parent_id"] = data["parent"]
            app_state.database.locations.replace_one(
                {"location_id": item["location_id"]}, item, upsert=True)
            return item["location_id"]
        else:
            raise NotFoundException(detail="Location not found")

    @delete("/{location_id:str}", status_code=204, guards=[guard_isAdmin])
    async def delete_location(self, app_state: AppState, location_id: str) -> None:
        item: Location = app_state.database.locations.find_one(
            {"location_id": location_id})
        if item:
            app_state.database.locations.update_many({"parent_id": item["location_id"]}, {
                                                     "$set": {"parent_id": item["parent_id"]}})
            app_state.database.locations.delete_one(
                {"location_id": item["location_id"]})
        else:
            raise NotFoundException(detail="Location not found")
