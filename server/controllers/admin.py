from starlite import Controller, get, post, delete, Provide, put
from starlite.exceptions import NotFoundException
from typing import TypedDict, Union
from _types import AppState, Admin, Session
import hashlib
import uuid
from deps import *


class Login(TypedDict):
    username: str
    password: str


class AdminUserData(TypedDict):
    user_id: str
    name: str
    email: str


class UpdatePassword(TypedDict):
    current: str
    new: str


class UpdateSettings(TypedDict):
    name: str
    email: str


class NewUser(TypedDict):
    name: str
    email: str
    password: str


class AdminController(Controller):
    path = "/admin"

    @post("", status_code=200)
    async def login(self, app_state: AppState, data: Login) -> str:
        matched_user: Admin = app_state.database.admins.find_one(
            {"name": data["username"]})
        if matched_user == None:
            raise NotFoundException(detail="Username/Password Incorrect")

        if hashlib.sha256(data["password"].encode("utf-8")).hexdigest() != matched_user["password_hash"]:
            raise NotFoundException(detail="Username/Password Incorrect")

        new_uuid = uuid.uuid4().hex

        app_state.database.sessions.replace_one({"user_id": matched_user["user_id"]}, {
            "user_id": matched_user["user_id"], "uuid": new_uuid}, upsert=True)
        return new_uuid

    @delete("", status_code=204, dependencies={"session": Provide(getSession)}, guards=[guard_isAdmin])
    async def logout(self, app_state: AppState, session: Union[Session, None]) -> None:
        if session:
            app_state.database.sessions.delete_one({"uuid": session["uuid"]})

    @put("", status_code=200, guards=[guard_isAdmin])
    async def create_user(self, app_state: AppState, data: NewUser) -> str:
        newAdmin = Admin(user_id=uuid.uuid4().hex, name=data["name"], password_hash=hashlib.sha256(
            data["password"].encode("utf-8")).hexdigest(), email=data["email"])
        app_state.database.admins.insert_one(newAdmin)
        return newAdmin["user_id"]

    @get("", dependencies={"session": Provide(getSession)}, guards=[guard_isAdmin])
    async def get_user_data(self, app_state: AppState, session: Union[Session, None]) -> AdminUserData:
        user: Admin = app_state.database.admins.find_one(
            {"user_id": session["user_id"]})

        if user:
            return AdminUserData(user_id=user["user_id"], name=user["name"], email=user["email"])
        raise NotFoundException(detail="User not found.")

    @post("/settings/password", status_code=200, dependencies={"session": Provide(getSession)}, guards=[guard_isAdmin])
    async def update_user_password(self, app_state: AppState, session: Union[Session, None], data: UpdatePassword) -> None:
        user: Admin = app_state.database.admins.find_one(
            {"user_id": session["user_id"]})

        if user:
            if hashlib.sha256(data["current"].encode("utf-8")).hexdigest() != user["password_hash"]:
                raise PermissionDeniedException(
                    detail="Incorrect password supplied.")
            user["password_hash"] = hashlib.sha256(
                data["new"].encode("utf-8")).hexdigest()
            app_state.database.admins.replace_one({"user_id": user["user_id"]}, {
                                                  k: v for k, v in user.items() if k != "_id"}, upsert=True)
            return None
        raise NotFoundException(detail="User not found.")

    @post("/settings", status_code=200, dependencies={"session": Provide(getSession)}, guards=[guard_isAdmin])
    async def update_user_settings(self, app_state: AppState, session: Union[Session, None], data: UpdateSettings) -> None:
        user: Admin = app_state.database.admins.find_one(
            {"user_id": session["user_id"]})

        if user:
            user["email"] = data["email"]
            user["name"] = data["name"]
            app_state.database.admins.replace_one({"user_id": user["user_id"]}, {
                                                  k: v for k, v in user.items() if k != "_id"}, upsert=True)
            return None
        raise NotFoundException(detail="User not found.")

    @get("/all", status_code=200, guards=[guard_isAdmin])
    async def list_users(self, app_state: AppState) -> list[AdminUserData]:
        ret: list[AdminUserData] = []
        for a in app_state.database.admins.find({}):
            ret.append(AdminUserData(
                user_id=a["user_id"], name=a["name"], email=a["email"]))
        return ret

    @delete("/{user_id:str}", status_code=204, guards=[guard_isAdmin])
    async def delete_user(self, app_state: AppState, user_id: str) -> None:
        app_state.database.admins.delete_many({"user_id": user_id})
        app_state.database.sessions.delete_many({"user_id": user_id})
