from dataclasses import dataclass
from pymongo.database import Database
from typing import TypedDict


@dataclass
class AppState:
    database: Database = None
    organization: str = None
    organization_color: str = None


class Admin(TypedDict):
    name: str
    password_hash: str
