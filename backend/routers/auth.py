from fastapi import APIRouter, HTTPException, status, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from datetime import datetime, timedelta
from jose import JWTError, jwt
import bcrypt
import secrets
import threading
from schemas.models import UserRegister, UserLogin, Token, UserResponse, ForgotPasswordRequest, ResetPasswordRequest
from database import get_connection, get_cursor
from config import SECRET_KEY, ALGORITHM, ACCESS_TOKEN_EXPIRE_MINUTES
from utils.email import send_password_reset_email

router = APIRouter()
security = HTTPBearer()

def hash_password(password: str) -> str:
    salt = bcrypt.gensalt()
    return bcrypt.hashpw(password.encode('utf-8'), salt).decode('utf-8')

def verify_password(plain: str, hashed: str) -> bool:
    return bcrypt.checkpw(plain.encode('utf-8'), hashed.encode('utf-8'))

def create_access_token(data: dict) -> str:
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

def decode_token(token: str) -> dict:
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id: str = payload.get("sub")
        role: str = payload.get("role", "customer")
        if user_id is None:
            raise HTTPException(status_code=401, detail="Invalid token")
        return {"id": int(user_id), "role": role}
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid token")

def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    return decode_token(credentials.credentials)["id"]

def require_admin(credentials: HTTPAuthorizationCredentials = Depends(security)):
    data = decode_token(credentials.credentials)
    if data["role"] != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    return data["id"]

@router.post("/register", response_model=UserResponse, status_code=201)
def register(user: UserRegister):
    conn = get_connection()
    cursor = get_cursor(conn)
    try:
        cursor.execute("SELECT id FROM users WHERE email = %s", (user.email,))
        if cursor.fetchone():
            raise HTTPException(status_code=400, detail="Email already registered")
        hashed = hash_password(user.password)
        cursor.execute(
            "INSERT INTO users (name, email, password_hash, phone, role) VALUES (%s, %s, %s, %s, 'customer')",
            (user.name, user.email, hashed, user.phone)
        )
        conn.commit()
        cursor.execute("SELECT id, name, email, phone FROM users WHERE email = %s", (user.email,))
        return cursor.fetchone()
    finally:
        cursor.close()
        conn.close()

@router.post("/login", response_model=Token)
def login(credentials: UserLogin):
    conn = get_connection()
    cursor = get_cursor(conn)
    try:
        cursor.execute("SELECT * FROM users WHERE email = %s", (credentials.email,))
        user = cursor.fetchone()
        if not user or not verify_password(credentials.password, user["password_hash"]):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid email or password"
            )
        token = create_access_token({
            "sub": str(user["id"]),
            "email": user["email"],
            "role": user["role"]
        })
        return {"access_token": token, "token_type": "bearer"}
    finally:
        cursor.close()
        conn.close()

@router.post("/forgot-password")
def forgot_password(request: ForgotPasswordRequest):
    conn = get_connection()
    cursor = get_cursor(conn)
    try:
        cursor.execute("SELECT id, email, name FROM users WHERE email = %s", (request.email,))
        user = cursor.fetchone()
        if not user:
            return {"message": "If this email is registered you will receive a reset link."}
        token = secrets.token_urlsafe(32)
        expires_at = datetime.utcnow() + timedelta(hours=1)
        cursor.execute("DELETE FROM password_reset_tokens WHERE user_id = %s", (user["id"],))
        cursor.execute(
            "INSERT INTO password_reset_tokens (user_id, token, expires_at) VALUES (%s, %s, %s)",
            (user["id"], token, expires_at)
        )
        conn.commit()
        reset_link = f"http://localhost:5173/reset-password?token={token}"
        threading.Thread(
            target=send_password_reset_email,
            args=(user["email"], user["name"], reset_link),
            daemon=True
        ).start()
        return {"message": "If this email is registered you will receive a reset link."}
    finally:
        cursor.close()
        conn.close()

@router.post("/reset-password")
def reset_password(request: ResetPasswordRequest):
    conn = get_connection()
    cursor = get_cursor(conn)
    try:
        cursor.execute(
            "SELECT * FROM password_reset_tokens WHERE token = %s AND used = FALSE",
            (request.token,)
        )
        token_record = cursor.fetchone()
        if not token_record:
            raise HTTPException(status_code=400, detail="Invalid or expired reset link")
        if datetime.utcnow() > token_record["expires_at"]:
            raise HTTPException(status_code=400, detail="Reset link has expired. Please request a new one.")
        hashed = hash_password(request.new_password)
        cursor.execute(
            "UPDATE users SET password_hash = %s WHERE id = %s",
            (hashed, token_record["user_id"])
        )
        cursor.execute(
            "UPDATE password_reset_tokens SET used = TRUE WHERE id = %s",
            (token_record["id"],)
        )
        conn.commit()
        return {"message": "Password reset successfully. You can now log in."}
    finally:
        cursor.close()
        conn.close()