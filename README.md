# Bamzy Cakes & Confectionery

> Premium online bakery platform — Order cakes, pastries, tiger nuts, book events, and register for baking trainings.

**Live website:** [bamzy-cakes.vercel.app](https://bamzy-cakes.vercel.app)

---

## What This Project Does

- **Online Shop** — Browse and order cakes, pastries, tiger nuts, drinks
- **Event Booking** — Book birthdays, weddings, corporate events
- **Training Registration** — Register for baking training classes
- **Payment** — Pay with cards, bank transfer, or USSD via Paystack
- **Newsletter** — Subscribe for updates, admin sends broadcasts via email
- **Admin Dashboard** — Full business management: products, orders, bookings, analytics, reviews, settings

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React 18, Vite 5, Tailwind CSS, Framer Motion |
| **Backend** | Node.js, Express.js, PostgreSQL |
| **Database** | Supabase (PostgreSQL) |
| **Payments** | Paystack |
| **Email** | Brevo (Sendinblue) |
| **Image Storage** | Cloudinary |
| **Hosting** | Vercel (frontend) + Railway (backend) |

---

## Quick Start (Development)

### Prerequisites
- Node.js 18+
- PostgreSQL database (or Supabase account)

### Setup

```bash
# Clone the repository
git clone https://github.com/Ifenuel/bamzy_cakes.git
cd bamzy-cakes

# Install frontend dependencies
npm install

# Install backend dependencies
cd backend
npm install

# Configure backend environment
cp .env.example .env
# Edit .env with your database credentials

# Run database migrations
npm run migrate

# Seed sample data
npm run seed

# Start backend (Terminal 1)
npm run dev

# Start frontend (Terminal 2 - new terminal)
cd ..
npm run dev
```

---

## Project Structure

```
bamzy-cakes/
├── src/                    # Frontend (React)
│   ├── pages/customer/     # Customer-facing pages
│   ├── pages/admin/        # Admin dashboard pages
│   ├── components/         # Reusable UI components
│   ├── context/            # React context (auth, cart)
│   ├── utils/              # API calls, helpers
│   └── styles/             # Tailwind CSS config
├── backend/                # Backend (Node.js/Express)
│   ├── src/
│   │   ├── routes/         # API route handlers
│   │   ├── controllers/    # Business logic
│   │   ├── services/       # Email, payment, auth
│   │   ├── middleware/      # Auth, validation, error handling
│   │   ├── config/         # Database, Cloudinary
│   │   └── db/             # Migrations, seed data
│   └── .env.example        # Environment template
├── architecture.md         # Detailed architecture docs (not in git)
└── README.md               # This file
```

---

## API Endpoints

### Public (No Auth Required)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register customer |
| POST | `/api/auth/login` | Login |
| POST | `/api/auth/forgot-password` | Request password reset |
| POST | `/api/auth/reset-password` | Reset password |
| GET | `/api/products` | List products |
| GET | `/api/products/categories` | List categories |
| POST | `/api/orders` | Create order |
| POST | `/api/bookings` | Create event booking |
| GET | `/api/trainings` | List training classes |
| POST | `/api/newsletter/subscribe` | Subscribe to newsletter |
| POST | `/api/reviews` | Submit review (auth required) |

### Admin Only
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/admin/dashboard` | Dashboard stats |
| GET | `/api/admin/customers` | Customer list |
| POST | `/api/products` | Create product |
| PUT | `/api/products/:id` | Update product |
| DELETE | `/api/products/:id` | Delete product |
| PATCH | `/api/orders/admin/:id/status` | Update order status |
| POST | `/api/upload/:type` | Upload image to Cloudinary |
| PUT | `/api/settings` | Update business settings |

---

## Deployment

### Frontend (Vercel)
1. Connect GitHub repo to Vercel
2. Set environment variable: `VITE_API_URL` = your Railway backend URL
3. Deploy automatically on push

### Backend (Railway)
1. Connect GitHub repo to Railway
2. Set environment variables (see `backend/.env.example`)
3. Deploy automatically on push

### Required Environment Variables (Railway)
```
DATABASE_URL=postgresql://...
JWT_SECRET=your-secret-key
CLIENT_URL=https://bamzy-cakes.vercel.app
PAYSTACK_SECRET_KEY=sk_test_...
PAYSTACK_WEBHOOK_URL=https://your-backend.railway.app/api/payments/webhook
BREVO_API_KEY=your-brevo-key
BREVO_SENDER_EMAIL=bamzycakes621@gmail.com
CLOUDINARY_CLOUD_NAME=pqgyfjto
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...
```

---

## Security Features

- Passwords encrypted with bcrypt
- JWT authentication for protected routes
- Admin-only routes with role verification
- Server-side price calculation (never trusts frontend)
- Rate limiting on API endpoints
- SQL injection prevention (parameterized queries)
- CORS protection
- Helmet security headers
- Cloudinary upload preset restrictions

---

## License

Private — Bamzy Cakes & Confectionery

---

*Built with ❤️ for Bamzy Cakes & Confectionery*
