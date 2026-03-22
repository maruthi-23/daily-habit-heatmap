# 🔥 HabitMap — Daily Habit Heatmap App

> Track your habits, visualize your consistency, build your legacy.  
> **GitHub Contributions × Habit Tracker** — full-stack, production-ready.

---

## ✨ Features

| Category | Feature |
|---|---|
| 🔐 Auth | JWT (Access + Refresh tokens), BCrypt, token rotation, account lockout |
| 📋 Habits | Full CRUD, icons & colors, target frequency, soft delete |
| ✅ Tracking | Mark/unmark daily completion, notes, backdate entries |
| 🔥 Streaks | Current streak, longest streak, per-habit analytics |
| 📊 Heatmap | GitHub-style calendar heatmap, full year view, per-habit breakdown |
| 📈 Dashboard | Today's progress bar, weekly completion %, live stats |
| 🐳 DevOps | Docker Compose, multi-stage builds, GitHub Actions CI/CD |

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────┐
│  React (Vite + TS + Tailwind + Zustand)          │
│  Login · Register · Dashboard · Habits · Heatmap │
└──────────────────────┬──────────────────────────┘
                       │ HTTP / REST + JWT
┌──────────────────────▼──────────────────────────┐
│  Spring Boot 3.x                                  │
│  SecurityConfig · JwtFilter · Controllers         │
│  Services · JPA Repositories                      │
└──────────────────────┬──────────────────────────┘
                       │ JDBC / Hibernate
┌──────────────────────▼──────────────────────────┐
│  PostgreSQL 16                                    │
│  users · habits · habit_entries · refresh_tokens  │
└─────────────────────────────────────────────────┘
```

---

## 📁 Project Structure

```
habit-heatmap/
├── backend/                        # Spring Boot
│   └── src/main/java/com/habitmap/
│       ├── config/
│       │   ├── SecurityConfig.java      # Spring Security + CORS + JWT
│       │   └── TokenCleanupScheduler.java
│       ├── controller/
│       │   ├── AuthController.java      # /api/auth/*
│       │   └── HabitController.java     # /api/habits/*
│       ├── service/
│       │   ├── AuthService.java         # register, login, refresh, logout
│       │   └── HabitService.java        # CRUD + streaks + heatmap
│       ├── repository/                  # Spring Data JPA
│       ├── entity/                      # User, Habit, HabitEntry, RefreshToken
│       ├── dto/                         # All request/response DTOs
│       ├── security/
│       │   ├── JwtService.java          # Token generation & validation
│       │   └── JwtAuthFilter.java       # Per-request auth filter
│       └── exception/                   # AppException + GlobalExceptionHandler
│
├── frontend/                       # React + Vite + TypeScript
│   └── src/
│       ├── pages/
│       │   ├── LoginPage.tsx
│       │   ├── RegisterPage.tsx
│       │   ├── DashboardPage.tsx        # Stats + mini heatmap + today's habits
│       │   ├── HabitsPage.tsx           # CRUD management
│       │   └── HeatmapPage.tsx          # Full year heatmap + breakdown
│       ├── components/
│       │   ├── layout/AppLayout.tsx     # Sidebar navigation
│       │   ├── habits/
│       │   │   ├── HabitCard.tsx        # Habit tile with toggle
│       │   │   └── HabitFormModal.tsx   # Create/edit form
│       │   ├── heatmap/
│       │   │   ├── MiniHeatmap.tsx      # 26-week compact view
│       │   │   └── FullHeatmap.tsx      # Full year grid + tooltip
│       │   └── ui/StatsCard.tsx
│       ├── store/
│       │   ├── authStore.ts             # Zustand auth state
│       │   └── habitsStore.ts           # Zustand habits state
│       ├── services/api.ts              # Axios + token refresh interceptor
│       └── types/index.ts
│
├── docker-compose.yml              # Postgres + Backend + Frontend
├── .github/workflows/ci-cd.yml    # GitHub Actions
└── .env.example
```

---

## 🚀 Quick Start

### Prerequisites
- Java 17+
- Node 20+
- Docker & Docker Compose (for full stack)
- PostgreSQL 16 (if running without Docker)

---

### 🐳 Run with Docker (Recommended)

```bash
# 1. Clone
git clone https://github.com/yourname/habit-heatmap
cd habit-heatmap

# 2. Set env
cp .env.example .env
# Edit .env — set a strong DB_PASSWORD and JWT_SECRET

# 3. Start everything
docker compose up -d

# App → http://localhost
# API → http://localhost:8080
```

---

### 🛠️ Local Development

**Backend:**
```bash
cd backend

# Start Postgres (or use Docker)
docker run -d -p 5432:5432 \
  -e POSTGRES_DB=habitmap \
  -e POSTGRES_PASSWORD=postgres \
  postgres:16-alpine

# Run Spring Boot
./mvnw spring-boot:run
# API runs at http://localhost:8080
```

**Frontend:**
```bash
cd frontend
cp .env.example .env.local
npm install
npm run dev
# App runs at http://localhost:3000
```

---

## 🔐 Authentication Flow

```
Register/Login → Access Token (15 min) + Refresh Token (7 days)
                      ↓
API Request  → Authorization: Bearer <access_token>
                      ↓
Token Expired → POST /auth/refresh → new token pair (rotation)
                      ↓
Logout       → all refresh tokens revoked in DB
```

**Security features:**
- BCrypt password hashing (cost 12)
- JWT RS256 with expiration
- Refresh token rotation (old invalidated on use)
- Account lockout after 5 failed attempts (15 min)
- CORS configured per environment
- HTTPS-ready (set behind reverse proxy)

---

## 📡 API Reference

### Auth
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/auth/register` | ❌ | Create account |
| POST | `/api/auth/login` | ❌ | Login, get tokens |
| POST | `/api/auth/refresh` | ❌ | Refresh access token |
| POST | `/api/auth/logout` | ✅ | Revoke tokens |
| GET  | `/api/auth/me` | ✅ | Current user |

### Habits
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET  | `/api/habits` | List all habits |
| POST | `/api/habits` | Create habit |
| PUT  | `/api/habits/{id}` | Update habit |
| DELETE | `/api/habits/{id}` | Soft-delete habit |
| POST | `/api/habits/{id}/complete` | Mark done |
| DELETE | `/api/habits/{id}/complete` | Unmark |
| GET  | `/api/habits/heatmap?year=2024` | Heatmap data |
| GET  | `/api/habits/dashboard` | Dashboard stats |

---

## 🗄️ Database Schema

```sql
-- Users
CREATE TABLE users (
  id UUID PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR NOT NULL,
  name VARCHAR(100) NOT NULL,
  role VARCHAR(20) DEFAULT 'USER',
  failed_login_attempts INT DEFAULT 0,
  locked_until TIMESTAMP,
  created_at TIMESTAMP
);

-- Habits
CREATE TABLE habits (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  name VARCHAR(100) NOT NULL,
  description VARCHAR(500),
  icon VARCHAR(10) DEFAULT '🎯',
  color VARCHAR(20) DEFAULT '#22c55e',
  target_days_per_week INT DEFAULT 7,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP
);

-- Habit Entries (powers the heatmap)
CREATE TABLE habit_entries (
  id UUID PRIMARY KEY,
  habit_id UUID REFERENCES habits(id),
  date DATE NOT NULL,
  status VARCHAR(10) DEFAULT 'DONE',  -- DONE | SKIPPED
  note VARCHAR(300),
  UNIQUE (habit_id, date)
);

-- Refresh Tokens
CREATE TABLE refresh_tokens (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  token VARCHAR(512) UNIQUE NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  is_revoked BOOLEAN DEFAULT false
);
```

---

## 🎨 Frontend Stack

| Tool | Purpose |
|------|---------|
| React 18 + Vite | UI framework + fast builds |
| TypeScript | Type safety |
| Tailwind CSS | Utility-first styling |
| Zustand | Lightweight state management |
| Axios | HTTP client + interceptors |
| React Router v6 | Client-side routing |
| date-fns | Date utilities for heatmap |
| react-hot-toast | Notifications |
| Lucide React | Icon set |

**Design System:**
- Dark theme with `#07060f` background
- `Sora` font for UI, `JetBrains Mono` for numbers
- Accent: `#7c5cfc` (purple), Success: `#22c55e` (green)
- GitHub-style heatmap with 5-level intensity scale

---

## ⚙️ Environment Variables

### Backend (`application.yml` or env)
```
DB_URL              jdbc:postgresql://localhost:5432/habitmap
DB_USERNAME         postgres
DB_PASSWORD         (required)
JWT_SECRET          (base64 encoded, min 32 chars)
CORS_ORIGINS        http://localhost:3000
PORT                8080
```

### Frontend (`.env`)
```
VITE_API_URL        http://localhost:8080/api
```

---

## 🚀 Deployment

**Frontend → Vercel:**
```bash
cd frontend
vercel deploy --prod
```

**Backend → Railway / Render:**
1. Connect GitHub repo
2. Set environment variables
3. Auto-deploy on push to `main`

**Self-hosted (VPS):**
```bash
# On your server
git clone ...
cp .env.example .env && nano .env
docker compose up -d
```

---

## 🔁 CI/CD Pipeline (GitHub Actions)

```
Push to main
    ↓
Backend Tests (JUnit + H2)
Frontend Build + Lint
    ↓
Docker Build & Push to GHCR
    ↓
SSH Deploy to VPS
```

Secrets needed in GitHub repo settings:
- `DEPLOY_HOST`, `DEPLOY_USER`, `DEPLOY_KEY`

---

## 📈 Future Enhancements

- [ ] Google OAuth login
- [ ] Email verification
- [ ] Push notifications / reminders
- [ ] Weekly email reports
- [ ] Gamification (badges, levels)
- [ ] Redis caching for heatmap
- [ ] AI habit suggestions
- [ ] Mobile app (React Native)

---

## 📄 License

MIT © 2024 HabitMap
