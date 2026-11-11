# A utility file that handles hashing passwords and creating JWT tokens.
# We use bcrypt to turn it into a random string of characters. When the user logs in, we hash the password they typed and compare the hashes. 
# JWT tokens are literally like tokens; once a user logs in, they show the token to access protected routes.

from pwdlib import PasswordHash
from datetime import datetime, timedelta
from jose import jwt

SECRET_KEY = "super_secret_fitpulse_key_change_me_later"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30 

# Explicitly force it to use bcrypt (avoids the argon2 crash)
password_hash = PasswordHash.recommended()

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return password_hash.verify(plain_password, hashed_password)

def get_password_hash(password: str) -> str:
    return password_hash.hash(password)

def create_access_token(data: dict):
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt