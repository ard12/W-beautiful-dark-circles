"""
Minimal SQLite-backed auth for SENTINEL hackathon MVP.
Uses hashlib.pbkdf2_hmac with per-user random salt.
"""

import hashlib
import os
import secrets
import sqlite3
from pathlib import Path

from fastapi import APIRouter, HTTPException, Header
from pydantic import BaseModel

# ---------------------------------------------------------------------------
# Database setup
# ---------------------------------------------------------------------------

DB_PATH = Path(__file__).resolve().parent.parent / "data" / "sentinel.db"

def _get_conn() -> sqlite3.Connection:
    conn = sqlite3.connect(str(DB_PATH))
    conn.row_factory = sqlite3.Row
    return conn


def init_db():
    """Create tables and seed the demo user if not present."""
    DB_PATH.parent.mkdir(parents=True, exist_ok=True)
    conn = _get_conn()
    cur = conn.cursor()

    cur.execute("""
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            email TEXT UNIQUE NOT NULL,
            display_name TEXT NOT NULL,
            salt TEXT NOT NULL,
            password_hash TEXT NOT NULL,
            created_at TEXT DEFAULT CURRENT_TIMESTAMP
        )
    """)

    cur.execute("""
        CREATE TABLE IF NOT EXISTS sessions (
            token TEXT PRIMARY KEY,
            user_id INTEGER NOT NULL,
            created_at TEXT DEFAULT CURRENT_TIMESTAMP
        )
    """)

    conn.commit()

    # Seed demo user if not present
    existing = cur.execute("SELECT id FROM users WHERE email = ?", ("commander@sentinel.mil",)).fetchone()
    if not existing:
        _create_user(conn, "commander@sentinel.mil", "Commander", "sentinel2026")

    conn.close()


# ---------------------------------------------------------------------------
# Password hashing  (pbkdf2_hmac + random salt)
# ---------------------------------------------------------------------------

def _hash_password(password: str, salt: bytes | None = None) -> tuple[str, str]:
    """Return (hex_salt, hex_hash) using pbkdf2_hmac with 260k iterations."""
    if salt is None:
        salt = os.urandom(32)
    dk = hashlib.pbkdf2_hmac("sha256", password.encode(), salt, iterations=260_000)
    return salt.hex(), dk.hex()


def _verify_password(password: str, hex_salt: str, hex_hash: str) -> bool:
    salt = bytes.fromhex(hex_salt)
    _, computed_hash = _hash_password(password, salt)
    return secrets.compare_digest(computed_hash, hex_hash)


def _create_user(conn: sqlite3.Connection, email: str, display_name: str, password: str):
    hex_salt, hex_hash = _hash_password(password)
    conn.execute(
        "INSERT INTO users (email, display_name, salt, password_hash) VALUES (?, ?, ?, ?)",
        (email, display_name, hex_salt, hex_hash),
    )
    conn.commit()


# ---------------------------------------------------------------------------
# Request / response models
# ---------------------------------------------------------------------------

class LoginRequest(BaseModel):
    email: str
    password: str

class LoginResponse(BaseModel):
    token: str
    user: dict

class UserResponse(BaseModel):
    id: int
    email: str
    display_name: str


# ---------------------------------------------------------------------------
# Router
# ---------------------------------------------------------------------------

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/login", response_model=LoginResponse)
def login(req: LoginRequest):
    conn = _get_conn()
    row = conn.execute("SELECT * FROM users WHERE email = ?", (req.email,)).fetchone()
    if not row:
        conn.close()
        raise HTTPException(status_code=401, detail="Invalid credentials")

    if not _verify_password(req.password, row["salt"], row["password_hash"]):
        conn.close()
        raise HTTPException(status_code=401, detail="Invalid credentials")

    token = secrets.token_urlsafe(32)
    conn.execute("INSERT INTO sessions (token, user_id) VALUES (?, ?)", (token, row["id"]))
    conn.commit()
    conn.close()

    return LoginResponse(
        token=token,
        user={"id": row["id"], "email": row["email"], "display_name": row["display_name"]},
    )


@router.get("/me", response_model=UserResponse)
def get_me(authorization: str = Header(default="")):
    token = authorization.replace("Bearer ", "").strip()
    if not token:
        raise HTTPException(status_code=401, detail="Not authenticated")

    conn = _get_conn()
    session = conn.execute("SELECT user_id FROM sessions WHERE token = ?", (token,)).fetchone()
    if not session:
        conn.close()
        raise HTTPException(status_code=401, detail="Invalid or expired session")

    user = conn.execute("SELECT id, email, display_name FROM users WHERE id = ?", (session["user_id"],)).fetchone()
    conn.close()
    if not user:
        raise HTTPException(status_code=401, detail="User not found")

    return UserResponse(id=user["id"], email=user["email"], display_name=user["display_name"])


@router.post("/logout")
def logout(authorization: str = Header(default="")):
    token = authorization.replace("Bearer ", "").strip()
    if not token:
        raise HTTPException(status_code=401, detail="Not authenticated")

    conn = _get_conn()
    conn.execute("DELETE FROM sessions WHERE token = ?", (token,))
    conn.commit()
    conn.close()
    return {"status": "logged_out"}
