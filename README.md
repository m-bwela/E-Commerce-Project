# GenZiiShop 👑

A full-stack e-commerce platform for curated fashion — footwear, clothing, and accessories — built with React, Node.js/Express, PostgreSQL (Prisma), and integrated M-Pesa payments.

**Live:** [genziishop.onrender.com](https://genziishop.onrender.com) (backend) · deployed frontend on Vercel

---

## Features

- 🛍️ **Product catalog** — browse, search, and filter by category
- 👟 **Size selection** — footwear products support EU size options (e.g. EU 40, EU 41)
- 🛒 **Cart & Checkout** — add to cart, adjust quantities, checkout flow
- 💳 **M-Pesa STK Push payments** — real-time payment prompts via Safaricom Daraja API, with live payment status polling
- 📧 **Order confirmation emails** — includes a visual 5-step order progress tracker (Order Placed → Payment Confirmed → Shipped → Ready for Pickup → Picked Up)
- 🔐 **Authentication** — email/password login + Google OAuth 2.0
- 👤 **User profiles** — update details, change password, upload avatar
- 🛠️ **Admin dashboard** — manage products, orders, and users (protected routes, 3D "Access Denied / Granted" verification screens)
- 🏠 **Home page** — 3D animated hero (Three.js), category showcase, featured products, new arrivals, trending items, personalised recommendations
- 📱 **PWA-ready** — installable with manifest + custom favicon

---

## Tech Stack

### Frontend (`/Client`)
- **React 19** + **Vite**
- **Redux Toolkit** for state management
- **React Router v7**
- **Tailwind CSS** + **shadcn/ui** (Radix primitives)
- **React Three Fiber** + **drei** — 3D visuals (hero orb, verification gates)
- **React Hook Form** + **Zod** — form validation
- **Axios** — API client
- **React Hot Toast** — notifications

### Backend (`/Server`)
- **Node.js** + **Express 5**
- **Prisma ORM** + **PostgreSQL**
- **Passport.js** — Google OAuth 2.0 strategy
- **JWT** — HTTP-only cookie-based authentication
- **Multer** — image uploads
- **Nodemailer** — transactional emails (Gmail)
- **Axios** — M-Pesa Daraja API integration
- **Helmet**, **express-rate-limit**, **CORS** — security hardening

---

## Project Structure

```
E-Commerce Project/
├── Client/                      # React frontend
│   ├── public/                  # favicon, manifest, static assets
│   └── src/
│       ├── api/                 # Axios wrappers per resource (auth, cart, orders, products...)
│       ├── components/          # Shared UI + layout + admin route guard
│       ├── pages/                # Route-level pages (Home, Products, Cart, Checkout...)
│       │   └── adminpages/       # Admin dashboard, products, orders, users
│       └── store/                # Redux slices (auth, cart, products, admin)
│
└── Server/                      # Express backend
    ├── prisma/
    │   └── schema.prisma         # Database models (User, Product, Cart, Order, Payments...)
    └── src/
        ├── config/               # Prisma client, Passport strategy
        ├── controllers/          # Route logic (auth, products, cart, orders, mpesa, admin)
        ├── middleware/           # Auth guard, error handler
        ├── routes/                # Express routers
        └── services/              # Email service (Nodemailer)
```

---

## Getting Started

### Prerequisites
- Node.js 18+
- PostgreSQL database
- A Safaricom Daraja sandbox account (for M-Pesa)
- A Google Cloud OAuth 2.0 client (for Google Sign-In)
- A Gmail account with an App Password (for sending emails)

### 1. Clone & install

```bash
git clone https://github.com/m-bwela/E-Commerce-Project.git
cd E-Commerce-Project

cd Server && npm install
cd ../Client && npm install
```

### 2. Environment variables

Create a `.env` file inside `/Server`:

```env
PORT=5000
SERVER_URL="http://localhost:5000"
DATABASE_URL="postgresql://user:password@localhost:5432/e_commerce?schema=public"
JWT_SECRET="your-super-secret-key"
JWT_EXPIRES_IN="7d"

GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"

EMAIL_USER="you@gmail.com"
EMAIL_PASS="your-gmail-app-password"

MPESA_CONSUMER_KEY="your-daraja-consumer-key"
MPESA_CONSUMER_SECRET="your-daraja-consumer-secret"
MPESA_PASSKEY="your-daraja-passkey"
MPESA_SHORTCODE="174379"
MPESA_CALLBACK_URL="https://your-ngrok-url.ngrok-free.dev/api/mpesa/callback"

NODE_ENV="development"
CLIENT_URL="http://localhost:5173"
```

For local M-Pesa testing, Safaricom needs a public URL to send callbacks to — use [ngrok](https://ngrok.com) (`ngrok http 5000`) and paste the forwarding URL into `MPESA_CALLBACK_URL`.

Create a `.env` file inside `/Client` (optional — only needed to point at a deployed backend):

```env
VITE_API_URL="http://localhost:5000"
```

### 3. Set up the database

```bash
cd Server
npx prisma migrate dev
npx prisma generate
```

### 4. Run the app

```bash
# Terminal 1 — backend
cd Server
npm run dev

# Terminal 2 — frontend
cd Client
npm run dev
```

Frontend runs on `http://localhost:5173`, backend on `http://localhost:5000` (Vite proxies `/api` requests to the backend automatically in dev).

---

## Making Yourself an Admin

New accounts default to the `USER` role. To access `/admin`, promote your account directly in the database:

```sql
UPDATE "User" SET role = 'ADMIN' WHERE email = 'you@example.com';
```

---

## Deployment

- **Backend** — deployed on [Render](https://render.com). Build command: `npm install && npm run build` (runs `prisma generate` + `prisma migrate deploy`).
- **Frontend** — deployed on [Vercel](https://vercel.com) with root directory set to `Client`.
- Environment variables must be set separately on each platform's dashboard (`.env` files are never committed).
- CORS is configured to allow only the deployed `CLIENT_URL`, with cookies set to `SameSite=None; Secure` in production for cross-origin auth.

---

## License

ISC
