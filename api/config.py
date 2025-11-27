from pydantic_settings import BaseSettings, SettingsConfigDict
from functools import lru_cache
from typing import List, Optional
from pydantic import field_validator

class Settings(BaseSettings):
    """Application configuration settings loaded from environment variables"""
    
    # Database
    database_url: str = "postgresql+psycopg2://mirtech_admin:mirtech1345@localhost:5432/mirtech"
    database_username: Optional[str] = 'mirtech_admin'  # Add this
    database_password: Optional[str] = 'mirtech1345'  # Add this
    
    # Redis
    redis_url: str = "redis://localhost:6378"
    
    # App config
    environment: str = "development"
    # secret_key: Optional[str] = None  
    
    # API settings
    api_title: str = "MirTech API"
    api_version: str = "1.0.0"
    
    
    # CORS
    cors_origins: List[str] = ["*", "https://mirtech.whisttle.cloud"]
    cors_credentials: bool = True
    cors_methods: List[str] = ["*"]
    cors_headers: List[str] = ["*"]
    
    # Pagination defaults
    default_page_size: int = 50
    max_page_size: int = 100
    
    # Performance
    db_pool_size: int = 20
    db_max_overflow: int = 10
    
    model_config = SettingsConfigDict(
        env_file=".env",
        case_sensitive=False,
        extra="ignore"  # This ignores extra env vars not defined in the class
    )


@lru_cache()
def get_settings() -> Settings:
    """Get cached settings instance"""
    return Settings()