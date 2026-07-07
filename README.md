# ShopLead — Full-Stack E-Commerce Platform

A production-ready e-commerce web application with React frontend and Django REST API backend.

## Features

- **Authentication** — Register, login, JWT tokens, role-based access (user/admin)
- **Products** — Browse, search, filter by category, product detail pages
- **Cart** — Add, remove, update quantity with server-side persistence
- **Orders** — Place orders, view order history, admin order management
- **Admin Panel** — CRUD products, update order status
- **UI** — Modern responsive design, dark mode, toast notifications

## Tech Stack

| Layer    | Technologies                                           |
|----------|--------------------------------------------------------|
| Frontend | React, Vite, Tailwind CSS, React Router, Axios         |
| Backend  | Django, Django REST Framework, SimpleJWT               |
| Database | SQLite (built-in, no install required)                 |

## Project Structure

```
├── client/          # React frontend (Vite)
├── backend/         # Django REST API
│   ├── shoplead/    # Project settings
│   └── store/       # Main app (models, views, API)
└── README.md
```

## Prerequisites

- [Python 3.10+](https://www.python.org/)
- [Node.js 18+](https://nodejs.org/)

## Setup

### 1. Backend (Django)

```bash
cd backend
pip install -r requirements.txt
python manage.py migrate
python manage.py seed_data
python manage.py runserver
```

API runs at http://localhost:8000/api

### 2. Frontend (React)

```bash
cd client
npm install
npm run dev
```

Frontend runs at http://localhost:5173 and proxies API requests to the Django backend.

## Demo Accounts

| Role  | Email           | Password  |
|-------|-----------------|-----------|
| Admin | admin@shop.com  | admin123  |
| User  | user@shop.com   | user123   |

## API Endpoints

### Auth
| Method | Endpoint           | Access  |
|--------|--------------------|---------|
| POST   | /api/auth/register | Public  |
| POST   | /api/auth/login    | Public  |
| GET    | /api/auth/me       | Private |

### Products
| Method | Endpoint                | Access  |
|--------|-------------------------|---------|
| GET    | /api/products           | Public  |
| GET    | /api/products/categories| Public  |
| GET    | /api/products/:id       | Public  |
| POST   | /api/products           | Admin   |
| PUT    | /api/products/:id       | Admin   |
| DELETE | /api/products/:id       | Admin   |

### Cart
| Method | Endpoint         | Access  |
|--------|------------------|---------|
| GET    | /api/cart        | Private |
| POST   | /api/cart/add    | Private |
| POST   | /api/cart/remove | Private |
| PUT    | /api/cart/update | Private |
| DELETE | /api/cart/clear  | Private |

### Orders
| Method | Endpoint               | Access  |
|--------|------------------------|---------|
| POST   | /api/orders            | Private |
| GET    | /api/orders/user       | Private |
| GET    | /api/orders/all        | Admin   |
| PUT    | /api/orders/:id/status | Admin   |

## Environment Variables

**Backend** (`backend/.env`):
```env
SECRET_KEY=your-django-secret-key
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1
CLIENT_URL=http://localhost:5173
```

**Client** (`client/.env`):
```env
VITE_API_URL=/api
```

## Django Admin

Create a superuser for Django's built-in admin panel:

```bash
python manage.py createsuperuser
```

Access at http://localhost:8000/admin

## License

MIT
