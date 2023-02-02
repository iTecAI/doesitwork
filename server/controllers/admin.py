from starlite import ASGIConnection, BaseRouteHandler, Controller, get, post, State, delete, Provide, Request
from starlite.exceptions import NotFoundException, PermissionDeniedException
from typing import TypedDict, Union
from _types import AppState, Admin, Session
import hashlib
import uuid
from pymongo.collection import Collection


class Login(TypedDict):
    username: str
    password: str


class AdminUserData(TypedDict):
    user_id: str
    name: str
    email: str


def guard_isAdmin(connection: ASGIConnection, _: BaseRouteHandler):
    if not "authorization" in connection.headers.keys():
        raise PermissionDeniedException(
            detail="A valid session token is required to access this endpoint")

    session_collection: Collection = connection.app.state.database.sessions
    if session_collection.find_one({"uuid": connection.headers["authorization"]}) == None:
        raise PermissionDeniedException(
            detail="A valid session token is required to access this endpoint")


def getSession(request: Request) -> Union[Session, None]:
    if "authorization" in request.headers.keys():
        result = request.app.state.database.sessions.find_one(
            {"uuid": request.headers["authorization"]})
        return result
    else:
        return None


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

    @get("", dependencies={"session": Provide(getSession)}, guards=[guard_isAdmin])
    async def get_user_data(self, app_state: AppState, session: Union[Session, None]) -> AdminUserData:
        user: Admin = app_state.database.admins.find_one(
            {"user_id": session["user_id"]})

        if user:
            return AdminUserData(user_id=user["user_id"], name=user["name"], email=user["email"])
        raise NotFoundException(detail="User not found.")
