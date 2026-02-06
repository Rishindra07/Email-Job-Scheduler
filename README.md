# Email Job Scheduler (Monorepo)

A production-grade, full-stack email job scheduler service built with TypeScript, Express, BullMQ, Redis, and React.

## 📁 Repository Structure

```text
.
├── backend/                # Express & Node.js Backend
│   ├── src/
│   │   ├── config/         # DB and Redis configurations
│   │   ├── controllers/    # API Request handlers
│   │   ├── jobs/           # BullMQ Workers and DB Polling Worker
│   │   ├── routes/         # API Route definitions
│   │   ├── services/       # Email & Core business logic
│   │   └── index.ts        # Entry point
│   ├── prisma/             # DB schema and migrations
│   └── tsconfig.json       # Backend TS config
├── frontend/               # Vite & React Frontend
│   ├── src/
│   │   ├── components/     # Shared UI components (Layout, Table)
│   │   ├── context/        # Auth context
│   │   ├── pages/          # Application views (Dashboard, Compose)
│   │   └── lib/            # API client (Axios)
│   ├── tailwind.config.js  # Styling configuration
│   └── package.json        # Frontend dependencies
├── .env                    # Environment variables (Shared/Backend)
├── .gitignore              # Git exclusion rules
└── package.json            # Root configuration
```

## 🚀 Getting Started

### Prerequisites
- **Node.js**: v18+ 
- **Redis**: Required for BullMQ (falling back to DB polling if unavailable)
- **SQLite**: Used by default (dev.db)

### 1. Backend Setup
```bash
cd backend
npm install
npx prisma generate
npx prisma migrate dev
```

### 2. Frontend Setup
```bash
cd frontend
npm install
```

### 3. Environment Variables
Create a `.env` in the root (or `backend/`) with:
```env
PORT=3000
DATABASE_URL="file:./dev.db"
REDIS_HOST="localhost"
REDIS_PORT=6379

# SMTP Configuration (GMAIL / ETHEREAL)
SMTP_HOST="smtp.gmail.com"
SMTP_PORT=587
SMTP_USER="your-email@gmail.com"
SMTP_PASS="your-app-password"
SMTP_SECURE=false
SMTP_FROM_NAME="ReachInbox Scheduler"

# JWT Secret
JWT_SECRET="supersecretkey"
```

### 4. Running the App
- **Backend**: `npm run dev` in `backend/` folder.
- **Frontend**: `npm run dev` in `frontend/` folder.

---

## 📧 Email Configuration (Ethereal)
If you do not want to use real SMTP, you can use **Ethereal**.
1. Set `SMTP_HOST` to `smtp.ethereal.email`.
2. Generate credentials at [ethereal.email](https://ethereal.email).
3. Update `SMTP_USER` and `SMTP_PASS` in `.env`.

---

## 🏗️ Architecture Overview

### How Scheduling Works
Jobs are pushed into a **BullMQ** queue with a `delay` parameter (calculated as `scheduledAt - now`). If Redis is unavailable, a **DB Polling Worker** periodically checks for pending emails that are due.

### Persistence on Restart
All scheduled emails are stored in a **SQLite** database via **Prisma**. Upon server restart, the `pollWorker` or an initialization script can re-queue pending jobs into BullMQ to ensure no email is lost.

### Rate Limiting & Concurrency
- **Concurrency**: The BullMQ worker is configured with a concurrency of 5, meaning it can process 5 emails in parallel.
- **Rate Limiting**: BullMQ handles rate limiting natively (`MAX_EMAILS_PER_HOUR`). The worker also adds a `MIN_DELAY_BETWEEN_EMAILS` (2 seconds) to avoid overhead.

---

## ✨ Features Implemented

### Backend
- ✅ **Scheduler**: Precise scheduling using BullMQ or DB polling fallback.
- ✅ **Persistence**: Reliable data storage with SQLite/Prisma.
- ✅ **Rate Limiting**: Configurable hourly limits and inter-email delays.
- ✅ **Concurrency**: Efficient parallel job processing.

### Frontend
- ✅ **Login**: Google OAuth integration and fallback credentials.
- ✅ **Dashboard**: Clean view of "Scheduled" vs "Sent" status.
- ✅ **Compose**: Form for scheduling emails with immediate feedback.
- ✅ **Tables**: Reusable, formatted data displays.

---

## 📦 Submission Guidelines
1. **GitHub Repository**: The code is hosted on a private repository.
2. **Access**: Access has been granted to user `Mitrajit`.

---

## 📝 Assumptions & Trade-offs
- **SQLite**: Chosen for its zero-config setup for the initial demo. For large scale, PostgreSQL is recommended.
- **Redis Fallback**: Implemented a DB polling fallback to ensure the app works even if the user doesn't have Redis installed locally.
- **Security**: `.env` is ignored by Git to protect SMTP credentials.
