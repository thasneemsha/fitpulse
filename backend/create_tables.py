from app.database import engine, Base
from app import models # We must import models so SQLAlchemy knows about them

print("Connecting to database and creating tables...")

# This tells SQLAlchemy to look at all classes inheriting from Base (like our User model)
# and create the tables in the database if they don't already exist.
Base.metadata.create_all(bind=engine)

print("Tables created successfully!")