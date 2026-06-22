from fastapi import APIRouter, HTTPException, Depends
from schemas.models import OrderCreate, OrderResponse
from database import get_connection, get_cursor
from routers.auth import get_current_user
from utils.email import send_order_confirmation
from typing import List
import threading

router = APIRouter()

@router.post("/", response_model=OrderResponse, status_code=201)
def place_order(order: OrderCreate, user_id: int = Depends(get_current_user)):
    conn = get_connection()
    cursor = get_cursor(conn)
    try:
        cursor.execute("SELECT id FROM cart WHERE user_id = %s", (user_id,))
        cart = cursor.fetchone()
        if not cart:
            raise HTTPException(status_code=400, detail="Cart is empty")

        cursor.execute("""
            SELECT ci.product_id, ci.quantity,
                   p.price + COALESCE(pv.price_modifier, 0) as price,
                   p.name, ci.variant_info
            FROM cart_items ci
            JOIN products p ON ci.product_id = p.id
            LEFT JOIN product_variants pv ON ci.variant_id = pv.id
            WHERE ci.cart_id = %s
        """, (cart["id"],))
        items = cursor.fetchall()

        if not items:
            raise HTTPException(status_code=400, detail="Cart is empty")

        total = sum(item["price"] * item["quantity"] for item in items)

        cursor.execute(
            "INSERT INTO orders (user_id, total_amount, shipping_address) VALUES (%s, %s, %s)",
            (user_id, total, order.shipping_address)
        )
        conn.commit()
        order_id = cursor.lastrowid

        for item in items:
            cursor.execute(
                """INSERT INTO order_items
                   (order_id, product_id, quantity, price_at_purchase, variant_info)
                   VALUES (%s, %s, %s, %s, %s)""",
                (order_id, item["product_id"], item["quantity"], item["price"], item.get("variant_info"))
            )

        cursor.execute("DELETE FROM cart_items WHERE cart_id = %s", (cart["id"],))
        conn.commit()

        cursor.execute("SELECT email FROM users WHERE id = %s", (user_id,))
        user = cursor.fetchone()

        email_items = [
            {
                "name": i["name"],
                "quantity": i["quantity"],
                "price_at_purchase": i["price"],
                "variant_info": i.get("variant_info")
            } for i in items
        ]

        threading.Thread(
            target=send_order_confirmation,
            args=(user["email"], order_id, email_items, total, order.shipping_address),
            daemon=True
        ).start()

        cursor.execute(
            "SELECT id, total_amount, status, shipping_address, created_at FROM orders WHERE id = %s",
            (order_id,)
        )
        new_order = cursor.fetchone()
        new_order["created_at"] = str(new_order["created_at"])
        new_order["items"] = [
            {
                "product_id": i["product_id"],
                "name": i["name"],
                "quantity": i["quantity"],
                "price_at_purchase": i["price"]
            } for i in items
        ]
        return new_order
    finally:
        cursor.close()
        conn.close()

@router.get("/", response_model=List[OrderResponse])
def get_orders(user_id: int = Depends(get_current_user)):
    conn = get_connection()
    cursor = get_cursor(conn)
    try:
        cursor.execute(
            "SELECT id, total_amount, status, shipping_address, created_at FROM orders WHERE user_id = %s ORDER BY created_at DESC",
            (user_id,)
        )
        orders = cursor.fetchall()
        result = []
        for order in orders:
            order["created_at"] = str(order["created_at"])
            cursor.execute("""
                SELECT oi.product_id, p.name, oi.quantity, oi.price_at_purchase
                FROM order_items oi
                JOIN products p ON oi.product_id = p.id
                WHERE oi.order_id = %s
            """, (order["id"],))
            order["items"] = cursor.fetchall()
            result.append(order)
        return result
    finally:
        cursor.close()
        conn.close()