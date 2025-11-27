from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.ext.declarative import declarative_base
from config import get_settings 

settings = get_settings()
engine = create_engine(url=settings.database_url)

SessionLocal = sessionmaker(autoflush=False, bind=engine)
base = declarative_base()