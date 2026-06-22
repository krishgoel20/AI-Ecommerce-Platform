from pydantic import BaseModel, EmailStr
from typing import Optional, List

class UserRegister(BaseModel):
    name: str
    email: EmailStr
    password: str
    phone: Optional[str] = None

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str

class UserResponse(BaseModel):
    id: int
    name: str
    email: str
    phone: Optional[str] = None

# Product schemas
class ProductCreate(BaseModel):
    name: str
    description: Optional[str] = None
    price: float
    stock_qty: int = 0
    category_id: Optional[int] = None

class ProductResponse(BaseModel):
    id: int
    name: str
    description: Optional[str] = None
    price: float
    stock_qty: int
    category_id: Optional[int] = None
    rating_avg: float
    rating_count: int
    image_url: Optional[str] = None

# Cart schemas
class CartItemAdd(BaseModel):
    product_id: int
    quantity: int = 1
    variant_id: Optional[int] = None
    variant_info: Optional[str] = None

class CartItemUpdate(BaseModel):
    quantity: int

class CartItemResponse(BaseModel):
    id: int
    product_id: int
    quantity: int
    name: str
    price: float
    variant_info: Optional[str] = None

# Order schemas
class OrderCreate(BaseModel):
    shipping_address: str

class OrderItemResponse(BaseModel):
    product_id: int
    name: str
    quantity: int
    price_at_purchase: float

class OrderResponse(BaseModel):
    id: int
    total_amount: float
    status: str
    shipping_address: str
    created_at: str
    items: List[OrderItemResponse] = []

class ProductVariant(BaseModel):
    id: int
    product_id: int
    variant_type: str
    variant_value: str
    price_modifier: float
    stock_qty: int

class ForgotPasswordRequest(BaseModel):
    email: EmailStr

class ResetPasswordRequest(BaseModel):
    token: str
    new_password: str