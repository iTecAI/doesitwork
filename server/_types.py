from dataclasses import dataclass
from pymongo.database import Database
from typing import TypedDict, Union, Literal


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


class Location(TypedDict):
    location_id: str
    parent_id: Union[str, Literal["root"]]
    name: str
    icon: str


class Category(TypedDict):
    category_id: str
    name: str
    icon: str
    flags: list[str]
