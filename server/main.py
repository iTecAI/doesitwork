from starlite import Starlite, State, Provide, get
import dotenv
from _types import Admin, AppState
import os
from pymongo import MongoClient
from pymongo.collection import Collection
from hashlib import sha256
from controllers import *
from uuid import uuid4


def initialize(state: State):
    dotenv.load_dotenv()

    # Load branding
    state.organization = os.getenv("CUSTOM_ORG")
    state.organization_color = os.getenv("CUSTOM_BRAND")

    # Initialize DB
    client = MongoClient(host=f'{os.getenv("MONGO_HOST", "localhost")}:{int(os.getenv("MONGO_PORT", 27017))}/{os.getenv("MONGO_DATABASE", "doesitwork")}', username=os.getenv(
        "MONGO_USER"), password=os.getenv("MONGO_PASS"), tls=True if os.getenv("MONGO_TLS", False) == "yes" else False)
    state.database = client[os.getenv("MONGO_DATABASE", "doesitwork")]

    admins_collection: Collection = state.database["admins"]
    if admins_collection.estimated_document_count() == 0:
        admins_collection.insert_one(
            Admin(name=os.getenv("ROOT_USER", "admin"), password_hash=sha256(os.getenv("ROOT_PASS", "admin").encode("utf-8")).hexdigest(), email="", user_id=uuid4().hex))


def dep_appState(state: State) -> AppState:
    return AppState(database=state.database, organization=state.organization, organization_color=state.organization_color)


@get("/theming")
async def get_theme_info(app_state: AppState) -> dict:
    return {
        "brand": app_state.organization_color,
        "name": app_state.organization
    }

app = Starlite(route_handlers=[get_theme_info, AdminController, LocationController, CategoryController, ServiceController], on_startup=[initialize],
               dependencies={"app_state": Provide(dep_appState)})
