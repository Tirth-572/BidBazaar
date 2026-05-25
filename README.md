# BidBazaar (React + Node.js)

Online auction platform with a **React** frontend and **Node.js** API backed by **PostgreSQL**.

## Requirements

- **Node.js 22+**
- **PostgreSQL 18** running on port `5433`
- Two terminal windows (or use `npm run dev` from root)

## Quick Start

**From project root (starts both):**

```bash
npm run dev
```

Or separately:

```bash
# Terminal 1 — Backend API
cd backend
npm run dev

# Terminal 2 — Frontend
cd frontend
npm run dev
```

- API: `http://localhost:3001`
- Website: `http://localhost:5173`

## Default Admin Credentials

| Field | Value |
|-------|-------|
| Username | `admin` |
| Password | `Admin@123` |

## OTP / Registration

Email is optional. The OTP is always printed in the **backend terminal**:

```
[OTP] username <email>: 123456
```

Enter that code on the OTP verification page to complete registration.

## Troubleshooting

| Problem | Fix |
|--------|-----|
| "Cannot reach the API server" | Start the backend first |
| `Port 3001 is already in use` | Run `taskkill /F /IM node.exe` then start again |
| "Failed to send email" on register | Ignore — check backend terminal for OTP code |
| `npm install` SSL error | Run `npm config set strict-ssl false` |
| Can't bid on listing | You cannot bid on your own listings. Login as `admin` to bid on all listings |

## Project Structure

```
BidBazaar1/
├── backend/        # Node.js API (port 3001)
│   ├── src/
│   │   ├── handlers.js   # All API route handlers
│   │   ├── db.js         # PostgreSQL connection + schema
│   │   ├── middleware.js # JWT auth
│   │   └── ...
│   ├── seed.js     # Seed admin + listings
│   └── .env
├── frontend/       # React + Vite (port 5173)
│   └── src/
│       ├── pages/
│       ├── components/
│       └── api/client.js
└── media/
```

## Tech Stack

- **Frontend:** React 18, Vite, Tailwind (CDN)
- **Backend:** Node.js 22, native HTTP, JWT auth
- **Database:** PostgreSQL 18

---

## Postman API Reference

**Base URL:** `http://localhost:3001/api`

### Step 1 — Get a Token (Login)

```
POST http://localhost:3001/api/auth/login/
Content-Type: application/json

{
  "username": "admin",
  "password": "Admin@123"
}
```

Copy the `token` from the response. Add it to all protected requests as:

```
Authorization: Bearer <token>
```

---

### Auth Endpoints

| Method | Full URL | Auth | Body |
|--------|----------|------|------|
| POST | `http://localhost:3001/api/auth/login/` | No | `{ "username": "", "password": "" }` |
| POST | `http://localhost:3001/api/auth/logout/` | No | — |
| POST | `http://localhost:3001/api/auth/register/` | No | `{ "username": "", "email": "", "password": "", "confirmation": "" }` |
| POST | `http://localhost:3001/api/auth/otp-verify/` | No | `{ "otp": "123456" }` |
| POST | `http://localhost:3001/api/auth/forgot-password/` | No | `{ "username": "", "email": "" }` |
| POST | `http://localhost:3001/api/auth/password-otp/` | No | `{ "otp": "123456" }` |
| GET  | `http://localhost:3001/api/auth/me/` | Yes | — |

---

### Listings

| Method | Full URL | Auth | Body / Notes |
|--------|----------|------|------|
| GET | `http://localhost:3001/api/listings/` | No | All active listings |
| GET | `http://localhost:3001/api/listings/1/` | No | Single listing by ID |
| GET | `http://localhost:3001/api/listings/mine/` | Yes | Your own listings |
| GET | `http://localhost:3001/api/listings/won/` | Yes | Auctions you won |
| GET | `http://localhost:3001/api/listings/watch/` | Yes | Your watchlist |
| POST | `http://localhost:3001/api/listings/create/` | Yes | `form-data: title, category, description, starting_value, image(file)` |
| POST | `http://localhost:3001/api/listings/1/bid/` | Yes | `{ "value": 15000 }` |
| POST | `http://localhost:3001/api/listings/1/watch/` | Yes | Toggle watchlist |
| POST | `http://localhost:3001/api/listings/1/close/` | Yes | Owner only — closes auction |
| POST | `http://localhost:3001/api/listings/1/comments/` | Yes | `{ "comment": "Nice item!" }` |

---

### Categories

| Method | Full URL | Auth | Notes |
|--------|----------|------|-------|
| GET | `http://localhost:3001/api/categories/` | No | List all categories |
| GET | `http://localhost:3001/api/categories/Trading Cards/` | No | Listings in a category |

---

### Profile

| Method | Full URL | Auth | Body |
|--------|----------|------|------|
| GET | `http://localhost:3001/api/profile/` | Yes | Get your profile |
| PUT | `http://localhost:3001/api/profile/` | Yes | `form-data: first_name, last_name, email, address, profile_picture(file)` |
| POST | `http://localhost:3001/api/profile/password/` | Yes | `{ "original_password": "", "new_password": "", "confirm_password": "" }` |

---

### Admin (requires admin token)

| Method | Full URL | Auth | Notes |
|--------|----------|------|-------|
| GET | `http://localhost:3001/api/admin/dashboard/` | Admin | Stats overview |
| GET | `http://localhost:3001/api/admin/users/` | Admin | All users |
| POST | `http://localhost:3001/api/admin/users/7/toggle-staff/` | Admin | Add/remove staff role |
| POST | `http://localhost:3001/api/admin/users/7/toggle-admin/` | Admin | Add/remove admin role |
| POST | `http://localhost:3001/api/admin/users/7/delete/` | Admin | Delete user + all their data |
| GET | `http://localhost:3001/api/admin/listings/` | Admin | All listings (add `?q=search` to filter) |
| POST | `http://localhost:3001/api/admin/listings/1/deactivate/` | Admin | Deactivate a listing |
| POST | `http://localhost:3001/api/admin/listings/1/delete/` | Admin | Delete a listing |
| GET | `http://localhost:3001/api/admin/reports/` | Admin | Full analytics report |

---

### Postman Quick Setup

1. Create a new **Collection** called `BidBazaar`
2. Add a **Collection Variable** called `token`
3. On the Login request → **Tests** tab, add:
   ```js
   pm.collectionVariables.set("token", pm.response.json().token);
   ```
4. On all protected requests set header:
   ```
   Authorization: Bearer {{token}}
   ```

---

## URL Structure

| Page | URL |
|------|-----|
| Home | `/` |
| Browse Categories | `/auctions/browse-categories` |
| Category Listings | `/auctions/browse-categories/Trading Cards` |
| Listing Detail | `/auctions/listing-detail/1` |
| Create Listing | `/auctions/create-new-listing` |
| My Listings | `/dashboard/my-active-listings` |
| Won Auctions | `/dashboard/my-won-auctions` |
| Watchlist | `/dashboard/my-watchlist` |
| Profile | `/account/my-profile` |
| Login | `/account/login` |
| Register | `/account/register` |
| Admin Dashboard | `/admin/control-panel/dashboard` |
| Manage Users | `/admin/control-panel/manage-users` |
| Manage Listings | `/admin/control-panel/manage-listings` |
| Reports | `/admin/control-panel/reports-analytics` |
| How It Works | `/how-it-works` |
| About | `/about-bidbazaar` |
