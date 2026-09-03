<div align="center">

# 🎂 Bamzy Cakes & Confectionery

**A premium full-stack bakery e-commerce platform**

[![React](https://img.shields.io/badge/React-18-61DAFB?logo=react)](https://reactjs.org/)
[![Node.js](https://img.shields.io/badge/Node.js-20-339933?logo=node.js)](https://nodejs.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-4169E1?logo=postgresql)](https://www.postgresql.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3-06B6D4?logo=tailwindcss)](https://tailwindcss.com/)
[![Vite](https://img.shields.io/badge/Vite-5-646CFF?logo=vite)](https://vitejs.dev/)

[Live Demo](https://bamzycakes.com) · [Report Bug](https://github.com/your-username/bamzy-cake/issues) · [Architecture Guide](architecture.md)

</div>

---

## Overview

Bamzy Cakes & Confectionery is a full-stack web application built for a Nigerian bakery business. It provides:

- **Online Store** — Browse and order cakes, pastries, tiger nuts, and drinks
- **Event Booking** — Book birthdays, weddings, bridal showers, and corporate events
- **Training Registration** — Sign up for professional baking classes
- **Customer Account** — Track orders, bookings, and training registrations
- **Admin Dashboard** — Manage products, orders, bookings, analytics, and newsletter
- **Payment Integration** — Secure payments via Paystack (card, bank transfer, USSD)
- **Email System** — OTP verification, welcome emails, and newsletter broadcasts via Brevo

---

## Features

### Customer Experience
- 🛒 Full product catalog with category filtering and search
- 📱 Responsive design — works beautifully on mobile, tablet, and desktop
- 🔐 Secure registration with email OTP verification
- 💳 Paystack payment integration (card, bank transfer, USSD)
- 📋 Order tracking with visual status timeline
- 🎉 Event booking with service selection
- 🎓 Training registration with capacity management
- ⭐ Customer reviews and ratings
- 📧 Newsletter subscription
- 💬 WhatsApp floating button

### Admin Dashboard
- 📊 Real-time analytics with charts and pie graphs
- 📦 Full product and category management (CRUD)
- 📋 Order management with status updates
- 🎉 Event booking management
- 🎓 Training management with image upload
- 👥 Customer list and management
- 💰 Payment history and tracking
- ⭐ Review moderation (approve/hide/delete)
- 📧 Newsletter management with Brevo integration
- 🗺️ Delivery zone fee management
- 📈 CSV export with branded Excel formatting

### Security
- 🔒 JWT authentication with bcrypt password hashing
- 🛡️ Helmet security headers (CSP, HSTS, X-Frame-Options)
- ⏱️ Rate limiting on all endpoints
- 🗃️ Parameterized SQL queries (zero SQL injection risk)
- 🔐 Row-Level Security on all database tables
- 💳 HMAC-SHA512 Paystack webhook verification
- 🚫 Idempotent payment processing (no double charges)
- ✅ Input validation with express-validator

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React 18, Vite 5, React Router 6, Tailwind CSS 3, Framer Motion 11 |
| **Backend** | Node.js, Express.js 4, PostgreSQL (via Supabase) |
| **Payment** | Paystack (card, bank transfer, USSD) |
| **Email** | Brevo (Sendinblue) — OTP, welcome, newsletter |
| **Authentication** | JWT tokens, bcrypt hashing |
| **Security** | Helmet, express-rate-limit, express-validator, RLS |

---

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) 18+ installed
- [PostgreSQL](https://www.postgresql.org/) database (or [Supabase](https://supabase.com/) account)
- [Paystack](https://paystack.com/) account (test mode)
- [Brevo](https://www.brevo.com/) account (for emails)

### Installation

```bash
# Clone the repository
git clone https://github.com/your-username/bamzy-cake.git
cd bamzy-cake

# Install frontend dependencies
npm install

# Install backend dependencies
cd backend
npm install
```

### Environment Setup

```bash
# Frontend
cp .env.example .env
# Edit .env with your keys

# Backend
cd backend
cp .env.example .env
# Edit .env with your database URL, JWT secret, Paystack keys, Brevo API key
```

### Database Setup

```bash
# Run all migrations
cd backend
node src/db/migrate.js

# Seed initial products (optional)
node src/db/seed.js
```

### Running the App

```bash
# Terminal 1 — Backend
cd backend
npm run dev

# Terminal 2 — Frontend
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) for the customer site.
Open [http://localhost:5173/admin/login](http://localhost:5173/admin/login) for the admin dashboard.

---

## Project Structure

```
bamzy-cake/
├── src/                    # React frontend
│   ├── components/         # Reusable UI components
│   ├── pages/              # Customer & admin pages
│   ├── context/            # Auth & cart state management
│   ├── utils/              # API client & helpers
│   └── services/           # Business logic wrappers
│
├── backend/                # Express.js backend
│   └── src/
│       ├── controllers/    # Route handlers
│       ├── services/       # Business logic
│       ├── routes/         # API route definitions
│       ├── middleware/      # Auth, validation, error handling
│       ├── db/             # Migrations & seed data
│       └── utils/          # Helpers & utilities
│
└── public/                 # Static assets
```

See [architecture.md](architecture.md) for the complete file-by-file breakdown.

---

## Deployment

### Frontend → Vercel

1. Push code to GitHub
2. Go to [vercel.com](https://vercel.com) → Import repository
3. Vercel auto-detects Vite → click Deploy
4. Set environment variable: `VITE_API_URL` = your backend URL + `/api`

### Backend → Railway

1. Go to [railway.app](https://railway.app) → Import same repository
2. Set root directory to `backend`
3. Add all environment variables from `backend/.env`
4. Deploy

### Going Live

- Switch Paystack from test to live keys
- Verify Brevo sender email
- Configure Paystack webhook URL
- Buy domain and configure DNS
- Submit sitemap to Google Search Console

---

## Default Admin Account

| Field | Value |
|-------|-------|
| Email | `admin@bamzycakes.com` |
| Password | `admin123` |

---

## Documentation

- **[Architecture Guide](architecture.md)** — Complete developer manual with debugging guides, API reference, and troubleshooting

---

## License

This project is proprietary software built for Bamzy Cakes & Confectionery.

---

<div align="center">

**Made with ❤️ for Bamzy Cakes & Confectionery**

</div>
