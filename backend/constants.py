# Constants for the 3D Cost Calculator API

TITLE = "3D Cost Calculator API"
DESCRIPTION = """
This API provides a simplified way to calculate production costs for 3D printed parts.
It handles project management, 3D file analysis, and AI-powered descriptions and commercial texts.

## Features
* **Authentication**: JWT-based login and Google OAuth.
* **Projects**: CRUD operations for projects.
* **3D Analysis**: Automatic extraction of geometry data from STL/OBJ files.
* **AI Services**: Powered by OpenAI for generating descriptions and marketing content.
"""
VERSION = "1.0.0"
CONTACT = {
    "name": "API Support",
    "email": "support@example.com",
}
LICENSE_INFO = {
    "name": "MIT License",
    "url": "https://opensource.org/licenses/MIT",
}

# Documentation Tags
TAGS_METADATA = [
    {
        "name": "auth",
        "description": "Operations for user registration, token generation, and authentication.",
    },
    {
        "name": "projects",
        "description": "Manage 3D printing projects, including file uploads and calculations.",
    },
]
