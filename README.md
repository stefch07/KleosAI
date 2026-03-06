# KleosAI — AI-Powered Restaurant Reputation Manager

KleosAI helps restaurants monitor Google reviews, generate professional AI responses instantly, and protect their online reputation.

## Features

- 🔐 **Authentication** — Secure email/password login with JWT tokens
- 📊 **Dashboard** — Overview of review stats and sentiment breakdown
- ⭐ **Reviews** — All Google reviews with filtering by rating and sentiment
- 🤖 **AI Responses** — One-click AI-generated professional responses (powered by OpenAI)
- 🔔 **Alerts** — Automatic notifications for negative reviews
- ⚙️ **Settings** — Restaurant profile management and Google Place ID setup

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | Next.js 14 (App Router) + Tailwind CSS |
| Backend | Node.js + Express |
| Database | PostgreSQL + Prisma ORM |
| AI | OpenAI GPT-3.5 |
| Auth | JWT (email/password) |

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL 14+ (or Docker)
- OpenAI API key

### Option 1: Docker Compose (Recommended)

```bash
cp backend/.env.example backend/.env
# Add your OPENAI_API_KEY to backend/.env

docker compose up -d
```

Visit http://localhost:3000

### Option 2: Manual Setup

#### Backend

```bash
cd backend
cp .env.example .env
# Edit .env with your credentials

npm install
npx prisma generate
npx prisma db push
npm run dev
```

#### Frontend

```bash
cd frontend
npm install
npm run dev
```

Visit http://localhost:3000

## Project Structure

```
KleosAI/
├── backend/
│   ├── src/
│   │   ├── controllers/   # Business logic
│   │   ├── middleware/    # JWT auth
│   │   ├── routes/        # API endpoints
│   │   └── lib/           # Prisma client
│   └── prisma/schema.prisma
├── frontend/
│   ├── app/               # Next.js pages
│   │   ├── dashboard/     # Main dashboard
│   │   ├── reviews/       # Reviews + AI responses
│   │   ├── alerts/        # Negative review alerts
│   │   └── settings/      # Profile settings
│   ├── components/
│   ├── contexts/          # Auth context
│   └── lib/               # API client
└── docker-compose.yml
```

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/auth/register | Create account |
| POST | /api/auth/login | Sign in |
| GET | /api/auth/me | Get current user |
| GET | /api/reviews | List reviews |
| GET | /api/reviews/stats | Dashboard stats |
| POST | /api/reviews/fetch | Fetch Google reviews |
| POST | /api/reviews/:id/generate-response | Generate AI response |
| GET | /api/alerts | List alerts |
| PATCH | /api/alerts/mark-all-read | Mark all alerts read |

## Environment Variables

### Backend (`backend/.env`)
```
DATABASE_URL="postgresql://user:password@localhost:5432/kleosai_db"
JWT_SECRET="your-secret-key"
OPENAI_API_KEY="sk-..."
PORT=3001
FRONTEND_URL="http://localhost:3000"
```

### Frontend (`frontend/.env.local`)
```
NEXT_PUBLIC_API_URL=http://localhost:3001/api
```
