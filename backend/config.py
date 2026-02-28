from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    google_client_id: str = ""
    openai_api_key: str = ""
    redis_url: str = "redis://redis:6379/0"
    secret_key: str = "supersecretkey"
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 43200

    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8")

settings = Settings()
