# Bamzy Cakes & Confectionery — Backend

Node.js/Express + PostgreSQL API for the Bamzy Cakes ordering platform.

## Tech Stack

- **Runtime:** Node.js (ESM)
- **Framework:** Express.js
- **Database:** PostgreSQL (via `pg`)
- **Auth:** JWT (jsonwebtoken + bcrypt)
- **Validation:** express-validator

## Setup

### 1. Install dependencies

```bash
cd backend
npm install
```

### 2. Configure environment

```bash
cp .env.example .env
```

Edit `.env` with your PostgreSQL credentials:

```
DATABASE_URL=postgresql://postgres:password@localhost:5432/bamzy_cakes
JWT_SECRET=your-secret-key
PORT=5000
CLIENT_URL=http://localhost:5173
```

### 3. Create the database

```bash
createdb bamzy_cakes
```

### 4. Run migrations

```bash
npm run migrate
```

### 5. Seed sample data

```bash
npm run seed
```

### 6. Start the server

```bash
npm run dev
```

The API runs on `http://localhost:5000`.

## Test Credentials

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@bamzycakes.com | admin123 |
| Customer | ada@example.com | customer123 |

## API Endpoints

### Auth
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | /api/auth/register | Public | Register customer |
| POST | /api/auth/login | Public | Login |
| GET | /api/auth/me | Required | Get current user |
| PUT | /api/auth/me | Required | Update profile |

### Products
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | /api/products | Public | List products (supports ?category, ?search, ?sort) |
| GET | /api/products/categories | Public | List categories |
| GET | /api/products/:id | Public | Get product by ID |
| GET | /api/products/slug/:slug | Public | Get product by slug |
| POST | /api/products | Admin | Create product |
| PUT | /api/products/:id | Admin | Update product |
| DELETE | /api/products/:id | Admin | Delete product |

### Orders
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | /api/orders | Public | Create order (calculates prices server-side) |
| GET | /api/orders | Required | Get customer's orders |
| GET | /api/orders/:id | Required | Get order (owner or admin) |
| GET | /api/orders/admin/all | Admin | Get all orders |
| PATCH | /api/orders/admin/:id/status | Admin | Update order status |

### Event Bookings
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | /api/bookings | Public | Create booking |
| GET | /api/bookings/:id | Public | Get booking |
| GET | /api/bookings/admin/all | Admin | Get all bookings |
| PATCH | /api/bookings/admin/:id/status | Admin | Update booking status |

### Trainings
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | /api/trainings | Public | List trainings |
| GET | /api/trainings/:id | Public | Get training |
| POST | /api/trainings/:id/register | Public | Register for training |
| POST | /api/trainings | Admin | Create training |
| PUT | /api/trainings/:id | Admin | Update training |
| DELETE | /api/trainings/:id | Admin | Delete training |

### Customer Account
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | /api/account | Required | Get account info (orders, bookings, trainings) |
| PUT | /api/account | Required | Update account |

### Admin
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | /api/admin/dashboard | Admin | Dashboard stats |
| GET | /api/admin/customers | Admin | Customer list |

### Payments
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | /api/payments | Admin | Payment records |
| POST | /api/payments/initialize | Public | Initialize payment (placeholder) |
| GET | /api/payments/verify/:reference | Public | Verify payment (placeholder) |

### Contact
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | /api/contact | Public | Send contact message |

## Response Format

**Success:**
```json
{ "success": true, "data": { ... } }
```

**Error:**
```json
{ "success": false, "message": "Error description" }
```

## Database Tables

1. `users` — Customers and admins
2. `product_categories` — Cakes, Small Chops, Pastries, etc.
3. `products` — Product listings
4. `product_images` — Multiple images per product (future use)
5. `orders` — Customer orders
6. `order_items` — Individual items in an order
7. `event_bookings` — Event catering bookings
8. `trainings` — Training classes
9. `training_registrations` — Training sign-ups
10. `payments` — Payment records
11. `customer_addresses` — Saved addresses (future use)
12. `contact_messages` — Contact form submissions
13. `business_settings` — Business configuration

## Security

- Passwords hashed with bcrypt
- JWT-based authentication
- Role-based access control (customer/admin)
- Server-side price calculation (never trusts frontend totals)
- Stock validation with row-level locking
- Parameterized SQL queries (no injection)
- CORS configured for frontend origin only
