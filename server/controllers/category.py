from starlite import Controller, get, post, delete, NotFoundException
from _types import AppState, Category
from deps import guard_isAdmin
from typing import TypedDict
from uuid import uuid4


class CategoryCreateUpdate(TypedDict):
    name: str
    icon: str
    flags: list[str]

class CategoryController(Controller):
    path = "/categories"

    @get("", status_code=200)
    async def list_categories(self, app_state: AppState) -> list[Category]:
        return [{k: v for k, v in i.items() if k != "_id"} for i in app_state.database.categories.find({})]

    @post("/{category_id:str}", status_code=200, guards=[guard_isAdmin])
    async def update_category(self, app_state: AppState, category_id: str, data: CategoryCreateUpdate) -> str:
        item: Category = app_state.database.categories.find_one(
            {"category_id": category_id})
        if item:
            item["name"] = data["name"]
            item["icon"] = data["icon"]
            item["flags"] = data["flags"]
            app_state.database.categories.replace_one(
                {"category_id": category_id}, item, upsert=True)
            return item["category_id"]
        else:
            raise NotFoundException(detail="Category not found")

    @post("", status_code=201, guards=[guard_isAdmin])
    async def create_category(self, app_state: AppState, data: CategoryCreateUpdate) -> str:
        cid = uuid4().hex
        item: Category = Category(
            category_id=cid, name=data["name"], icon=data["icon"], flags=data["flags"])
        app_state.database.categories.insert_one(item)
        return cid

    @delete("/{category_id:str}", status_code=204, guards=[guard_isAdmin])
    async def delete_category(self, app_state: AppState, category_id: str) -> None:
        item: Category = app_state.database.categories.find_one(
            {"category_id": category_id})
        if item:
            app_state.database.categories.delete_one(
                {"category_id": category_id})
        else:
            raise NotFoundException(detail="Category not found")
