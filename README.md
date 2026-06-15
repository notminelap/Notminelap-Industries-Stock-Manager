# Notminelap Industries

> Enterprise-grade inventory intelligence. Designed like Apple. Built for the real world.

**Notminelap Industries** is a next-generation SaaS platform for warehouse and inventory management. Featuring a stunning dark-mode interface with glassmorphism effects, real-time analytics, barcode generation, and seamless multi-user collaboration — all running 24/7 on the cloud.

## ✨ Features

### Free Tier
- Real-time inventory tracking with live dashboard
- Secure JWT authentication with role-based access
- Transaction ledger (restock & dispatch logging)
- Dark & light mode with system detection
- Command palette (⌘K) for power users
- Mobile-responsive design

### Pro Tier (₹100/month)
- Advanced analytics with interactive visualizations
- Barcode generation & label printing
- CSV import/export
- Low-stock alert system
- Priority support
- Multi-user team management

## 🛠️ Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | React 19, Vite 8, Framer Motion, Lucide Icons |
| Backend | Node.js, Express 5, JWT Authentication |
| Database | MongoDB Atlas + Mongoose 8 |
| Payments | Razorpay Subscriptions + UPI Direct Pay |
| Validation | Zod 4 |
| Hosting | Render (24/7 cloud deployment) |

## 🚀 Quick Start

```bash
git clone https://github.com/notminelap/perfect-ergonomics.git
cd perfect-ergonomics
npm install
cp .env.example .env  # Fill in your MongoDB URI and JWT secret
npm run dev            # Admin auto-seeds on startup
```

## 🔐 Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `MONGODB_URI` | ✅ | MongoDB Atlas connection string |
| `JWT_SECRET` | ✅ | Secret key for JWT tokens |
| `ADMIN_USERNAME` | No | Default admin username (default: notminelap) |
| `ADMIN_PASSWORD` | No | Default admin password |
| `RAZORPAY_KEY_ID` | No | Razorpay API key (enables autopay) |
| `RAZORPAY_KEY_SECRET` | No | Razorpay secret key |
| `PORT` | No | Server port (default: 3002) |

---

_Built with obsessive attention to detail by Notminelap Industries._
