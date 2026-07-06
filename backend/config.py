"""
Configuration for the backend.
"""

from pathlib import Path
from flask_sqlalchemy import SQLAlchemy

BASE_DIR: Path = Path(__file__).resolve().parent
DB_PATH: str = BASE_DIR / "data" / "baseball.db"

DEFAULT_PAGE_SIZE: int = 10
MAX_PAGE_SIZE: int = 100
db: SQLAlchemy = SQLAlchemy()
