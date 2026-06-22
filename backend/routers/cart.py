from fastapi import APIRouter, HTTPException, Depends
from schemas.models import CartItemAdd, CartItemUpdate, CartItemResponse
from database import get_connection, get_cursor
from routers.auth import get_current_user
from typing import List

router = APIRouter()

@router.get("/", response_model=List[CartItemResponse])
def get_cart(user_id: int = Depends(get_current_user)):
    conn = get_connection()
    cursor = get_cursor(conn)
    try:
        cursor.execute("SELECT id FROM cart WHERE user_id = %s", (user_id,))
        cart = cursor.fetchone()
        if not cart:
            return []
        cursor.execute("""
            SELECT ci.id, ci.product_id, ci.quantity, p.name,
                   p.price + COALESCE(pv.price_modifier, 0) as price,
                   ci.variant_info
            FROM cart_items ci
            JOIN products p ON ci.product_id = p.id
            LEFT JOIN product_variants pv ON ci.variant_id = pv.id
            WHERE ci.cart_id = %s
        """, (cart["id"],))
        return cursor.fetchall()
    finally:
        cursor.close()
        conn.close()

@router.post("/", status_code=201)
def add_to_cart(item: CartItemAdd, user_id: int = Depends(get_current_user)):
    conn = get_connection()
    cursor = get_cursor(conn)
    try:
        cursor.execute("SELECT id FROM cart WHERE user_id = %s", (user_id,))
        cart = cursor.fetchone()
        if not cart:
            cursor.execute("INSERT INTO cart (user_id) VALUES (%s)", (user_id,))
            conn.commit()
            cart_id = cursor.lastrowid
        else:
            cart_id = cart["id"]
        cursor.execute(
            """INSERT INTO cart_items (cart_id, product_id, quantity, variant_id, variant_info)
               VALUES (%s, %s, %s, %s, %s)
               ON DUPLICATE KEY UPDATE quantity = quantity + VALUES(quantity)""",
            (cart_id, item.product_id, item.quantity, item.variant_id, item.variant_info)
        )
        conn.commit()
        return {"message": "Item added to cart"}
    finally:
        cursor.close()
        conn.close()

@router.put("/{product_id}")
def update_cart_item(product_id: int, update: CartItemUpdate, user_id: int = Depends(get_current_user)):
    conn = get_connection()
    cursor = get_cursor(conn)
    try:
        cursor.execute("SELECT id FROM cart WHERE user_id = %s", (user_id,))
        cart = cursor.fetchone()
        if not cart:
            raise HTTPException(status_code=404, detail="Cart not found")
        cursor.execute(
            "UPDATE cart_items SET quantity = %s WHERE cart_id = %s AND product_id = %s",
            (update.quantity, cart["id"], product_id)
        )
        conn.commit()
        return {"message": "Cart updated"}
    finally:
        cursor.close()
        conn.close()

@router.delete("/{product_id}")
def remove_from_cart(product_id: int, user_id: int = Depends(get_current_user)):
    conn = get_connection()
    cursor = get_cursor(conn)
    try:
        cursor.execute("SELECT id FROM cart WHERE user_id = %s", (user_id,))
        cart = cursor.fetchone()
        if not cart:
            raise HTTPException(status_code=404, detail="Cart not found")
        cursor.execute(
            "DELETE FROM cart_items WHERE cart_id = %s AND product_id = %s",
            (cart["id"], product_id)
        )
        conn.commit()
        return {"message": "Item removed from cart"}
    finally:
        cursor.close()
        conn.close()