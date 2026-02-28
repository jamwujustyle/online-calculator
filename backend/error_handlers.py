from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
from starlette.exceptions import HTTPException as StarletteHTTPException
from sqlalchemy.exc import SQLAlchemyError
from exceptions import AppException

def register_handlers(app: FastAPI):
    
    @app.exception_handler(AppException)
    async def app_exception_handler(request: Request, exc: AppException):
        return JSONResponse(
            status_code=exc.status_code,
            content={
                "message": exc.message,
                "error_code": exc.error_code,
                "details": exc.details,
                "type": "app_error"
            },
        )

    @app.exception_handler(StarletteHTTPException)
    async def http_exception_handler(request: Request, exc: StarletteHTTPException):
        return JSONResponse(
            status_code=exc.status_code,
            content={
                "message": exc.detail,
                "error_code": f"http_{exc.status_code}",
                "type": "http_error"
            },
        )

    @app.exception_handler(RequestValidationError)
    async def validation_exception_handler(request: Request, exc: RequestValidationError):
        return JSONResponse(
            status_code=422,
            content={
                "message": "Validation failed",
                "error_code": "validation_error",
                "details": exc.errors(),
                "type": "validation_error"
            },
        )

    @app.exception_handler(SQLAlchemyError)
    async def sqlalchemy_exception_handler(request: Request, exc: SQLAlchemyError):
        # In production, don't leak DB details
        print(f"DATABASE ERROR: {exc}")
        return JSONResponse(
            status_code=500,
            content={
                "message": "A database error occurred",
                "error_code": "database_error",
                "type": "server_error"
            },
        )

    @app.exception_handler(Exception)
    async def global_exception_handler(request: Request, exc: Exception):
        print(f"UNHANDLED ERROR: {exc}")
        return JSONResponse(
            status_code=500,
            content={
                "message": "An unexpected error occurred",
                "error_code": "internal_error",
                "type": "server_error"
            },
        )
