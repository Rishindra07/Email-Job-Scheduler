# ReachInbox Email Job Scheduler

A production-grade email scheduler service with a React dashboard, built with Express, BullMQ, Redis, and Ethereal Email.

## Features

- **Backend**: Express + TypeScript
- **Queue**: BullMQ (Redis-backed) for reliable scheduling
- **Database**: PostgreSQL (Prisma ORM)
- **Email**: Ethereal (Mock SMTP)
- **Frontend**: React + Vite + Tailwind CSS
- **Auth**: Google OAuth Integration
- **Persistency**: Jobs survive server restarts
- **Rate Limiting**: Configurable hourly limits

## Prerequisites

- Node.js (v18+)
- PostgreSQL (Running locally or remote)
- Redis (Running locally or remote)

## API Keys Configuration

Create a `.env` file in `backend/` and populate it (see `backend/.env.example` or below):

```bash
PORT=3000
DATABASE_URL="postgresql://user:password@localhost:5432/email_scheduler?schema=public"
REDIS_HOST="localhost"
REDIS_PORT=6379
MAX_EMAILS_PER_HOUR=100
# Ethereal credentials will be auto-generated on first run if empty
ETHEREAL_EMAIL=""
ETHEREAL_PASS=""
```

## Setup & Run

### 1. Backend

```bash
cd backend
npm install
npx prisma generate
npx prisma db push  # Create tables in DB
npm run dev
```

The server will start on `http://localhost:3000`.

### 2. Frontend

```bash
cd frontend
npm install
npm run dev
```

The dashboard will open at `http://localhost:5173`.

## Architecture Overview

1. **Scheduling**: When a user schedules an email, it is saved to the Postgres DB as `PENDING` and added to a BullMQ delayed queue.
2. **Execution**: The BullMQ worker picks up the job at the right time.
3. **Throttling**: The worker utilizes `limiter` settings to enforce `MAX_EMAILS_PER_HOUR` and simulated delays between sends.
4. **Persistence**: Since BullMQ relies on Redis, and job state is in Postgres, the system is robust against restarts.

## Dashboard

- **Login**: Authenticate via Google.
- **Compose**: Schedule emails with subject, body, and time.
- **Lists**: View scheduled and sent email history.
