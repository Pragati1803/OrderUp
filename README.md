# OrderUp — Smart Canteen Food Ordering System
> Hassle-free canteen experience at PSIT Lucknow

## 🚀 Quick Start (Local Development)

### Prerequisites
- Node.js v18+
- MongoDB Atlas account (free)
- Razorpay account (test mode is free)
- Anthropic API key (for AI chatbot)

---

## STEP 1 — MongoDB Atlas Setup

1. Go to https://cloud.mongodb.com → Sign up (free)
2. Create a new **Project** → Create a **Cluster** (M0 Free Tier)
3. Click **Connect** → **Connect your application**
4. Copy the connection string:
   ```
   mongodb+srv://USERNAME:PASSWORD@cluster0.xxxxx.mongodb.net/orderup?retryWrites=true&w=majority
   ```
5. In **Database Access** → Add user with read/write permissions
6. In **Network Access** → Add IP `0.0.0.0/0` (allow all — for deployment)

---

## STEP 2 — Razorpay Setup

1. Go to https://dashboard.razorpay.com → Sign up
2. Go to **Settings → API Keys** → Generate Test API Keys
3. Copy:
   - `Key ID` → RAZORPAY_KEY_ID
   - `Key Secret` → RAZORPAY_KEY_SECRET
4. For production, complete KYC and switch to Live keys

---

## STEP 3 — Backend Setup

```bash
cd backend
cp .env.example .env
# Edit .env with your values (see below)

npm install
npm run seed      # Seeds database with sample data + owner accounts
npm run dev       # Starts on port 5000
```

### backend/.env
```
PORT=5000
NODE_ENV=development
MONGO_URI=mongodb+srv://user:pass@cluster0.xxxxx.mongodb.net/orderup
JWT_SECRET=make_this_very_long_and_random_at_least_32_chars
JWT_EXPIRE=7d
RAZORPAY_KEY_ID=rzp_test_XXXXXXXXXXXXXXXXXX
RAZORPAY_KEY_SECRET=your_razorpay_secret_key
CLIENT_URL=http://localhost:5173
ANTHROPIC_API_KEY=sk-ant-XXXXXXXXXXXXXXXXXX
```

---

## STEP 4 — Frontend Setup

```bash
cd frontend
npm install
npm run dev       # Starts on port 5173
```

Open http://localhost:5173

### Demo Accounts (after seeding):
| Role | Email | Password |
|------|-------|----------|
| Student | student@psit.ac.in | student123 |
| Nescafe Owner | owner.nescafe@orderup.psit | password123 |
| Amul Owner | owner.amul@orderup.psit | password123 |
| Samocha Owner | owner.samocha@orderup.psit | password123 |
| Urban Vada Pao Owner | owner.urbanvadapao@orderup.psit | password123 |
| Che-Canteen Owner | owner.che-canteen@orderup.psit | password123 |
| Nescafe-CHE Owner | owner.nescafe-che@orderup.psit | password123 |
| PSIT 2004 Owner | owner.psit2004@orderup.psit | password123 |
| Admin | admin@orderup.psit | admin123 |

---

## STEP 5 — Deploy Backend on Railway

1. Go to https://railway.app → Sign up with GitHub
2. Click **New Project** → **Deploy from GitHub repo**
3. Select your repository → choose the `backend` folder
4. Add environment variables (same as .env above but with production values):
   - `NODE_ENV=production`
   - `CLIENT_URL=https://your-frontend.vercel.app`
   - All others same as local
5. Railway auto-detects Node.js and deploys
6. Copy your Railway URL: `https://orderup-backend.up.railway.app`

---

## STEP 6 — Deploy Frontend on Vercel

1. Go to https://vercel.com → Sign up with GitHub
2. Click **New Project** → Import your GitHub repo
3. Set **Root Directory** to `frontend`
4. Add environment variable:
   ```
   VITE_API_URL=https://your-backend.up.railway.app
   ```
5. Click Deploy

### Update vite.config.ts for production:
```typescript
// frontend/vite.config.ts
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: process.env.VITE_API_URL || 'http://localhost:5000',
        changeOrigin: true
      }
    }
  }
})
```

---

## STEP 7 — Post-Deployment Checklist

- [ ] Run `npm run seed` on production (update MONGO_URI to prod DB first)
- [ ] Test Razorpay payment with test card: `4111 1111 1111 1111`, CVV: `111`, Expiry: any future date
- [ ] Switch `RAZORPAY_KEY_ID` to live key for real payments
- [ ] Update `CLIENT_URL` in Railway to your Vercel URL
- [ ] Test socket connections (order status updates)
- [ ] Test AI chatbot with your Anthropic key

---

## 📁 Project Structure

```
orderup/
├── backend/
│   ├── server.js              # Entry point
│   ├── .env.example
│   └── src/
│       ├── config/db.js       # MongoDB connection
│       ├── controllers/       # Business logic
│       │   ├── authController.js
│       │   ├── menuController.js
│       │   ├── orderController.js
│       │   ├── paymentController.js
│       │   └── adminController.js
│       ├── middleware/auth.js  # JWT + role guard
│       ├── models/            # Mongoose schemas
│       │   ├── User.js
│       │   ├── MenuItem.js
│       │   ├── Order.js
│       │   └── Payment.js
│       ├── routes/            # Express routers
│       ├── socket/index.js    # Socket.io setup
│       └── utils/seed.js      # DB seeder
│
└── frontend/
    ├── public/hero-bg.mp4     # Hero video
    └── src/
        ├── App.tsx            # Router + providers
        ├── contexts/          # Auth, Cart, Socket
        ├── pages/
        │   ├── Landing.tsx    # Hero + canteens
        │   ├── Login.tsx
        │   ├── Register.tsx
        │   ├── Menu.tsx       # Browse + add to cart
        │   ├── Cart.tsx
        │   ├── Payment.tsx    # Razorpay integration
        │   ├── OrderTracking.tsx  # Live tracking
        │   ├── StudentDashboard.tsx
        │   └── admin/
        │       ├── AdminDashboard.tsx
        │       ├── OrderManagement.tsx
        │       └── MenuManagement.tsx
        ├── components/ChatBot.tsx  # AI assistant
        └── utils/api.ts       # Axios + types
```

---

## 🔑 API Endpoints

### Auth
- `POST /api/auth/register` — Register
- `POST /api/auth/login` — Login
- `GET /api/auth/me` — Current user

### Menu
- `GET /api/menu?canteen=Nescafe` — Get menu
- `POST /api/menu` — Add item (owner)
- `PUT /api/menu/:id` — Update item (owner)
- `DELETE /api/menu/:id` — Delete item (owner)
- `PATCH /api/menu/:id/toggle` — Toggle availability (owner)

### Orders
- `POST /api/orders` — Create order (student)
- `GET /api/orders/my` — My orders
- `GET /api/orders/canteen` — Canteen orders (owner)
- `GET /api/orders/:id` — Order details
- `PUT /api/orders/:id/status` — Update status (owner)

### Payment
- `POST /api/payment/create-order` — Create Razorpay order
- `POST /api/payment/verify` — Verify payment signature

### Admin
- `GET /api/admin/analytics` — Dashboard stats
- `GET /api/admin/users` — All users (admin only)

### Chat
- `POST /api/chat/message` — AI chatbot message

---

## 🔌 Socket Events

| Event | Direction | Data |
|-------|-----------|------|
| `joinOrder` | Client→Server | orderId |
| `joinCanteen` | Client→Server | canteen name |
| `orderStatusUpdate` | Server→Client | { orderId, status, tokenNumber } |
| `newOrder` | Server→Client (canteen) | Order object |
| `orderUpdate` | Server→Client (canteen) | Order object |

---

## 💳 Test Razorpay Cards

| Card | Number |
|------|--------|
| Visa (Success) | 4111 1111 1111 1111 |
| Mastercard | 5104 0155 5555 5558 |
| UPI | success@razorpay |

CVV: any 3 digits | Expiry: any future date

---

## 🛡️ Security Notes

- JWT tokens expire in 7 days
- Passwords hashed with bcrypt (12 rounds)
- Razorpay payment verified with HMAC-SHA256 on server
- Role-based access on all protected routes
- Rate limiting: 200 req/15min per IP

---

Built with ❤️ for PSIT Lucknow
