from typing import Union
from starlite import ASGIConnection, BaseRouteHandler, PermissionDeniedException, Request
from pymongo.collection import Collection
from _types import Session


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
