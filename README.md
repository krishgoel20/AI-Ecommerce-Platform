# ShopMind 🛍️

A full-stack AI-native E-commerce platform where natural language is the primary interface — search, product Q&A, business analytics and recommendations are all powered by LLMs instead of traditional keyword matching.

---

## What makes ShopMind different

Most E-commerce platforms use keyword search and fixed analytics dashboards. ShopMind replaces these with a conversational AI layer:

| Feature | Traditional approach | ShopMind |
|---|---|---|
| **Search** | Keyword matching | Natural language → SQL via LLaMA |
| **Product Q&A** | Crowdsourced human answers | Instant RAG-based answers from product data |
| **Analytics** | Fixed predefined reports | Ask any business question in plain English |
| **Recommendations** | Black-box algorithm | Collaborative filtering + LLM explanation |

---

## Features

### AI Features
- **Natural Language Search** — Type queries like *"wireless headphones under ₹5000 with noise cancellation"* and LLaMA generates the SQL query dynamically
- **RAG Product Q&A** — Ask questions about any product and get grounded answers from the actual product description using FAISS + LLaMA. Includes voice input support
- **NL Analytics Dashboard** — Admin asks business questions in plain English; LLaMA generates multi-table SQL and returns real-time results
- **AI Recommendations** — Collaborative filtering surfaces relevant products with a natural language explanation of why they're recommended

### E-commerce Features
- **Category browsing** — 9 product categories with emoji navigation
- **Product variants** — Size, weight, volume, colour selectors with dynamic price adjustment
- **Cart management** — Quantity controls (−/+), real-time badge count, variant info
- **Checkout & Payments** — UPI, Credit/Debit Card, Net Banking, and Cash on Delivery simulation
- **Order tracking** — Visual timeline (Placed → Processing → Shipped → Delivered)
- **E-mail receipts** — HTML order confirmation e-mails with order summary and tracking status via Gmail SMTP
- **Order history** — Full order history with line items and shipping details

### Auth & Access
- **JWT authentication** — 7-day token expiry, role-based access control
- **Role-based access** — Admin (full access) v/s Customer (no Analytics)
- **Guest browsing** — Browse and search without an account
- **Forgot password** — Secure token-based password reset via e-mail

---

## Tech Stack

### Backend
| Layer | Technology |
|---|---|
| Framework | FastAPI (Python) |
| Database | MySQL 8.0 |
| Vector store | FAISS |
| Embeddings | sentence-transformers (`all-MiniLM-L6-v2`) |
| LLM provider | Groq API (`llama-3.3-70b-versatile`) |
| Auth | JWT via `python-jose`, bcrypt |
| E-mail | Gmail SMTP (`smtplib`) |

### Frontend
| Layer | Technology |
|---|---|
| Framework | React 18 + Vite |
| Styling | Tailwind CSS v4 |
| Routing | React Router v6 |
| Voice input | Web Speech API |

---

## Project Structure

```
ShopMind/
├── backend/
│   ├── main.py                  # FastAPI entry point
│   ├── database.py              # MySQL connection
│   ├── config.py                # Environment variables
│   ├── requirements.txt
│   ├── routers/
│   │   ├── auth.py              # Register, login, forgot/reset password
│   │   ├── products.py          # Product CRUD + variants
│   │   ├── cart.py              # Cart management
│   │   ├── orders.py            # Order placement + history
│   │   ├── categories.py        # Category listing
│   │   └── ai.py                # All AI endpoints
│   ├── schemas/
│   │   └── models.py            # Pydantic schemas
│   ├── ai/
│   │   ├── nl_search.py         # Natural language → SQL search
│   │   ├── product_qa.py        # FAISS + RAG Q&A
│   │   ├── analytics.py         # NL business analytics
│   │   └── recommendations.py   # Collaborative filtering
│   └── utils/
│       └── email.py             # Order confirmation + password reset e-mails
└── frontend/
    └── src/
        ├── api.js               # Centralised API client
        ├── App.jsx              # Routes + role-based access
        ├── components/
        │   ├── Navbar.jsx       # Sticky nav with live cart badge
        │   └── ProductCard.jsx  # Product grid card
        └── pages/
            ├── Home.jsx         # Category browsing + NL search + recommendations
            ├── ProductDetail.jsx # Product page + variant selector + voice Q&A
            ├── Cart.jsx         # Cart with quantity controls
            ├── Payment.jsx      # Payment methods + order summary
            ├── Orders.jsx       # Order history + tracking timeline
            ├── Analytics.jsx    # Admin NL analytics dashboard
            ├── Login.jsx        # Login + guest access
            ├── Register.jsx     # Customer registration
            ├── ForgotPassword.jsx
            └── ResetPassword.jsx
```

---

## Database Schema

11 core tables:

```
users              — customer accounts with role (admin/customer)
categories         — product categories with self-referencing parent
products           — product catalog with rating denormalisation
product_images     — multiple images per product, primary flag
product_variants   — size/weight/volume/colour options with price modifiers
cart               — one cart per user
cart_items         — items in cart with variant reference
orders             — order snapshots with status enum
order_items        — line items with price locked at purchase time
reviews            — one review per user per product
user_interactions  — view/cart/wishlist/purchase events for recommendations
password_reset_tokens — secure token-based password reset
```
 
---

## Setup and Installation

### Pre-requisites
- Python 3.11+
- Node.js 18+
- MySQL 8.0
- Groq API key ([console.groq.com](https://console.groq.com))
- Gmail account with App Password enabled

### Backend

```bash
cd backend
python -m venv venv
.\venv\Scripts\activate
pip install -r requirements.txt
```

Create a `.env` file inside the `backend/` folder:

```
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=ecommerce_db

SECRET_KEY=your-secret-key
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=10080

GROQ_API_KEY=your_groq_api_key
GMAIL_USER=your_gmail@gmail.com
GMAIL_APP_PASSWORD=your_app_password
```

Run the database schema:

```bash
mysql -u root -p < backend/ecommerce_schema.sql
```

Start the server:

```bash
uvicorn main:app --reload
```

API docs available at `http://127.0.0.1:8000/docs`.

### Frontend

```bash
cd frontend
npm install
npm run dev
```

App runs at `http://localhost:5173`.

---

## API Endpoints

### Auth
| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/auth/register` | Register new customer |
| POST | `/api/auth/login` | Login, returns JWT |
| POST | `/api/auth/forgot-password` | Send password reset e-mail |
| POST | `/api/auth/reset-password` | Reset password with token |

### Products
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/products/` | List all products (optional `?category_id=`) |
| GET | `/api/products/{id}` | Single product with image |
| POST | `/api/products/` | Create product (admin) |
| GET | `/api/products/{id}/variants` | Product variants grouped by type |

### Cart & Orders
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/cart/` | Get cart items |
| POST | `/api/cart/` | Add item with optional variant |
| PUT | `/api/cart/{product_id}` | Update quantity |
| DELETE | `/api/cart/{product_id}` | Remove item |
| POST | `/api/orders/` | Place order + send e-mail receipt |
| GET | `/api/orders/` | Order history |

### AI
| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/ai/search` | NL product search |
| POST | `/api/ai/index-products` | Build FAISS index |
| POST | `/api/ai/qa` | RAG product Q&A |
| POST | `/api/ai/analytics` | NL business analytics (admin only) |
| GET | `/api/ai/recommendations` | Collaborative filtering recommendations |

---

## Credentials (Demo)

| Role | E-mail | Password |
|---|---|---|
| Admin | admin@shopmind.com | Admin@123 |
| Customer | (register via /register) | — |

---
