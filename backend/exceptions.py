from typing import Any, Dict, Optional

class AppException(Exception):
    """Base class for all application-specific exceptions."""
    def __init__(
        self, 
        message: str, 
        status_code: int = 500, 
        error_code: str = "internal_error",
        details: Optional[Any] = None
    ):
        self.message = message
        self.status_code = status_code
        self.error_code = error_code
        self.details = details
        super().__init__(self.message)

class AuthException(AppException):
    """Raised when authentication or authorization fails."""
    def __init__(self, message: str = "Authentication failed", details: Optional[Any] = None):
        super().__init__(
            message=message, 
            status_code=401, 
            error_code="auth_error", 
            details=details
        )

class ProjectNotFoundException(AppException):
    """Raised when a requested project is not found."""
    def __init__(self, project_id: str):
        super().__init__(
            message=f"Project with ID {project_id} not found", 
            status_code=404, 
            error_code="project_not_found"
        )

class AIServiceException(AppException):
    """Raised when an external AI service fails."""
    def __init__(self, message: str, details: Optional[Any] = None):
        super().__init__(
            message=message, 
            status_code=502, 
            error_code="ai_service_error", 
            details=details
        )

class DatabaseException(AppException):
    """Raised when a database operation fails."""
    def __init__(self, message: str = "A database error occurred", details: Optional[Any] = None):
        super().__init__(
            message=message, 
            status_code=500, 
            error_code="database_error", 
            details=details
        )

class AlreadyExistsException(AppException):
    """Raised when an entity already exists (e.g. email registered)."""
    def __init__(self, message: str):
        super().__init__(
            message=message,
            status_code=400,
            error_code="already_exists"
        )
