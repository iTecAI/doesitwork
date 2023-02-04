from starlite import Controller, get, post, delete
from _types import AppState, Category
from deps import guard_isAdmin


class CategoryController(Controller):
    path = "/categories"

    @get("", status_code=200)
    async def list_categories(self, app_state: AppState) -> list[Category]:
        return [{k: v for k, v in i.items() if k != "_id"} for i in app_state.database.categories.find({})]
