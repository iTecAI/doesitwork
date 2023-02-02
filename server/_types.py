from dataclasses import dataclass
from pymongo.database import Database
from typing import TypedDict


@dataclass
class AppState:
    database: Database = None
    organization: str = None
    organization_color: str = None


class Admin(TypedDict):
    user_id: str
    name: str
    password_hash: str
    email: str


class Session(TypedDict):
    user_id: str
    uuid: str
