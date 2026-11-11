from app.database import engine, Base
from app import models # We must import models so SQLAlchemy knows about them

print("Connecting to database and creating tables...")
Base.metadata.create_all(bind=engine)
print("Tables created!")