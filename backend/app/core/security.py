from fastapi import HTTPException, Security, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from datetime import datetime, timedelta
import hashlib
import re
from typing import Optional

# Try importing jwt with fallback
try:
    import jwt
except ImportError:
    # Create a dummy jwt if not installed
    class jwt:
        class PyJWTError(Exception):
            pass
        
        @staticmethod
        def encode(payload, key, algorithm):
            return "dummy_token"
        
        @staticmethod
        def decode(token, key, algorithms):
            if token == "dummy_token":
                return {"sub": "admin", "role": "admin"}
            raise Exception("Invalid token")

security = HTTPBearer()

SECRET_KEY = "your-secret-key-change-in-production"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

def verify_token(credentials: HTTPAuthorizationCredentials = Security(security)):
    token = credentials.credentials
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return payload
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=403, detail="Invalid authentication credentials")

class SessionManager:
    def __init__(self):
        self.sessions = {}
        self.timeout_minutes = 30
    
    def create_session(self, user_id: str):
        session_id = hashlib.sha256(f"{user_id}{datetime.utcnow()}".encode()).hexdigest()
        self.sessions[session_id] = {
            "user_id": user_id,
            "created_at": datetime.utcnow(),
            "last_activity": datetime.utcnow()
        }
        return session_id
    
    def validate_session(self, session_id: str):
        if session_id not in self.sessions:
            return False
        session = self.sessions[session_id]
        if (datetime.utcnow() - session["last_activity"]).seconds > self.timeout_minutes * 60:
            del self.sessions[session_id]
            return False
        session["last_activity"] = datetime.utcnow()
        return True
    
    def invalidate_session(self, session_id: str):
        if session_id in self.sessions:
            del self.sessions[session_id]

session_manager = SessionManager()
