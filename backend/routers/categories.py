from fastapi import APIRouter
from database import get_connection, get_cursor

router = APIRouter()

@router.get("/")
def get_categories():
    conn = get_connection()
    cursor = get_cursor(conn)
    try:
        cursor.execute("SELECT id, name, description FROM categories")
        return cursor.fetchall()
    finally:
        cursor.close()
        conn.close()