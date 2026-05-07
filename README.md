# ✂️ Snip — Smart URL Shortener

A full-stack URL shortener built with **Next.js 14** (frontend) and **Spring Boot 3.2** (backend).  
Built as a skill assessment project for a Full-Stack Developer role.

## 🌐 Live Demo

> ⚠️ **Important — Please follow this order to avoid errors:**
>
> **Step 1 — Wake up the backend first (Required)**
> Open this URL in browser and wait until you see `[]` response:
> 👉 https://smart-url-shortener-a29p.onrender.com/api/urls
>
> **Step 2 — Then open the frontend**
> 👉 https://smart-url-shortener-1-ofq2.onrender.com

| Service | URL |
|---------|-----|
| 🖥️ **Frontend (Live App)** | https://smart-url-shortener-1-ofq2.onrender.com |
| ⚙️ **Backend API** | https://smart-url-shortener-a29p.onrender.com |
| 📁 **GitHub Repo** | https://github.com/Vikash2K21/Smart-URL-Shortener |

> 💤 **Note:** Hosted on Render free tier — first load may take 
> **20–30 seconds** to wake up from sleep. This is a free hosting 
> limitation, not a code issue. If you see a JSON error, wait 
> 30 seconds and try again.

### Test the Live API
\```
GET  https://smart-url-shortener-a29p.onrender.com/api/urls
POST https://smart-url-shortener-a29p.onrender.com/api/shorten
\```


> **No zip extraction needed.** Just clone, set up PostgreSQL, and run.

---

## 📦 Prerequisites

| Tool | Version | Download |
|------|---------|----------|
| Java (JDK) | 17 or higher | https://adoptium.net |
| IntelliJ IDEA | Community or Ultimate | https://www.jetbrains.com/idea |
| Node.js | 18 or higher | https://nodejs.org |
| PostgreSQL | 14 or higher | https://www.postgresql.org/download |
| Git | Latest | https://git-scm.com |

---

## 📥 Step 1 — Clone the Repository

**Option A — via IntelliJ (recommended):**

1. Launch IntelliJ IDEA
2. Click **"Get from VCS"** on the welcome screen
3. Paste the URL:
   ```
   https://github.com/Vikash2K21/Smart-URL-Shortener.git
   ```
4. Choose a local directory → click **Clone**

**Option B — via terminal:**

```bash
git clone https://github.com/Vikash2K21/Smart-URL-Shortener.git
cd Smart-URL-Shortener
```

---

## 🗄️ Step 2 — Set Up PostgreSQL

1. Open **pgAdmin** or **psql** and create the database:

```sql
CREATE DATABASE snip_db;
```

2. Copy the backend environment file:

```bash
cd backend
cp .env.example .env
```

3. Edit `backend/.env` with your PostgreSQL credentials:

```env
DB_URL=jdbc:postgresql://localhost:5432/snip_db
DB_USERNAME=postgres
DB_PASSWORD=your_password_here
BASE_URL=http://localhost:3000
PORT=8080
```

> Spring Boot will **auto-create the tables** on first run — no SQL scripts needed.

---

## ⚙️ Step 3 — Run the Backend (Spring Boot)

### In IntelliJ:

1. Open `backend/` as the project root in IntelliJ
2. Wait for Maven to finish downloading dependencies *(2–5 min, first time only)*
3. In the left panel navigate to:
   ```
   src → main → java → com → snip → SnipApplication.java
   ```
4. Right-click `SnipApplication.java` → **"Run 'SnipApplication'"**
5. Wait for this line in the Run panel:
   ```
   Started SnipApplication in X.X seconds
   ```

### Or via terminal:

```bash
cd backend
./mvnw spring-boot:run
```

> ✅ **Backend running at:** `http://localhost:8080`

---

## 🌐 Step 4 — Run the Frontend (Next.js)

Open a **new terminal**:

```bash
cd frontend
npm install
npm run dev
```


```bash
/src/lib/api.ts
./src/app/_components/ShortenForm.tsx
This error occurred during the build process and can only be dismissed by fixing the error.

Easy fix — uuid package is missing. Run this in your frontend folder:

npm install uuid
npm install --save-dev @types/uuid

Then restart the dev server:

npm run dev

That's it — the error will be gone.
```


> ✅ **Frontend running at:** `http://localhost:3000`

---

## 🚀 Open the App

Visit **[http://localhost:3000](http://localhost:3000)** in your browser.

---

## 🔁 Quick Start Summary

| Step | Action | Result |
|------|--------|--------|
| 1 | Clone repo | Project on your machine |
| 2 | Create `snip_db` in PostgreSQL, fill `.env` | DB ready |
| 3 | Run `SnipApplication.java` in IntelliJ | API on `http://localhost:8080` |
| 4 | `cd frontend && npm install && npm run dev` | UI on `http://localhost:3000` |

---

## 🧪 Running Tests

Tests use **H2 in-memory database** — no PostgreSQL required for tests.

```bash
cd backend
./mvnw test
```

| Test Class | Coverage |
|-----------|----------|
| `UrlValidatorServiceTest` | Valid URLs pass; blank, no-scheme, ftp://, own-domain URLs rejected |
| `RateLimiterServiceTest` | First 5 requests allowed; 6th throws 429; different IPs are independent |
| `UrlShortenerIntegrationTest` | Full lifecycle (shorten → list → resolve → delete); 400/404/429 error cases |

---

## 🏗️ Tech Stack

| Layer | Technology | Why |
|-------|-----------|-----|
| Frontend | Next.js 14 (App Router) + TypeScript | Required by task. App Router gives clean layouts and server/client separation. |
| Styling | Tailwind CSS | Utility-first — fast to iterate, consistent design tokens. |
| Backend | Spring Boot 3.2 (Java 17) | Java is my strongest backend language. Spring Boot's auto-configuration keeps setup minimal. |
| ORM | Spring Data JPA + Hibernate | Clean data access layer with repository pattern; no boilerplate SQL. |
| Database | PostgreSQL | Production-grade relational DB with strong UNIQUE constraint enforcement — critical for concurrency safety. |
| Validation | Bean Validation (Jakarta) | Declarative, keeps controllers clean. |
| Testing | JUnit 5 + MockMvc + H2 (test scope) | Spring's native test stack; H2 allows tests to run without a real DB. |

---

## 🗺️ Architecture Overview

```
Browser
  │
  ├─► GET /abc123              ← Next.js dynamic route [shortCode]/page.tsx
  │       │                       calls GET /api/resolve/abc123 → redirects client
  │
  ├─► POST /api/shorten      ─┐
  ├─► GET  /api/urls          ├─ next.config.js rewrites proxy these to
  ├─► DELETE /api/urls/:code  ┤  Spring Boot on localhost:8080
  └─► GET /api/resolve/:code  ┘
                               │
                       Spring Boot (port 8080)
                               │
                       UrlShortenerController   ← thin: extract IP, session header, delegate
                               │
                       UrlShortenerService      ← business logic: validate, generate, retry
                       RateLimiterService       ← sliding-window rate limiter (in-memory)
                       UrlValidatorService      ← URL validation rules
                               │
                       UrlMappingRepository     ← Spring Data JPA
                               │
                         PostgreSQL (snip_db)
```

**Data flow — shorten:**
User types a URL → `ShortenForm` calls `POST /api/shorten` with `X-Session-Id` header → Next.js proxies to Spring Boot → `UrlShortenerController` extracts IP + session ID, calls `RateLimiterService.checkLimit()`, delegates to `UrlShortenerService` → service calls `UrlValidatorService.validate()`, generates a 6-char code, saves to PostgreSQL → returns `ShortenResponse` JSON → frontend displays the short link.

**Data flow — redirect:**
User visits `/abc123` → Next.js renders `[shortCode]/page.tsx` (client component) → calls `GET /api/resolve/abc123` → Spring Boot runs an atomic `UPDATE click_count + 1`, returns original URL → browser does `window.location.replace(originalUrl)`.

---

## 🔒 How I Handled Concurrency

Short codes are generated randomly from a 54-character alphabet at 6 characters long (~24 billion combinations). After generating a candidate code, the service attempts to `INSERT` a new row. The `short_code` column has a **`UNIQUE` constraint** in PostgreSQL, so if two concurrent requests somehow generate the same code, only one `INSERT` succeeds — the other throws a `DataIntegrityViolationException`. The service catches this exception and **retries with a freshly generated code** (up to 5 attempts). The DB constraint is the ultimate correctness guard; the retry loop handles the astronomically rare collision case. Click counts are incremented with an atomic SQL `UPDATE url_mappings SET click_count = click_count + 1` rather than a read-modify-write in Java, so concurrent visitors can never lose a click.

---

## ⏱️ How I Handled Rate Limiting

I built a **sliding-window rate limiter from scratch** using `ConcurrentHashMap<String, Deque<Instant>>` — one entry per client key (IP + session ID).

**How it works:**
1. On each `POST /api/shorten`, look up the client's deque of request timestamps.
2. Evict timestamps older than 60 seconds from the front (sliding the window forward).
3. If the remaining count is ≥ 5 → throw `RateLimitExceededException` → HTTP 429 with a friendly message.
4. Otherwise, add the current timestamp to the back and allow the request.

**Thread safety:** `ConcurrentHashMap.computeIfAbsent` is atomic at the map level. `synchronized(deque)` makes the evict → count → add sequence atomic per client. Different clients never block each other.

**Limitations (honest):**
- State is in-memory — a server restart resets all counters.
- Does not work across multiple server instances (Redis `INCR` + TTL would be the production fix).
- No cleanup of stale IP entries — in production, a Caffeine cache with TTL would prevent unbounded memory growth.

---

## 🔮 What I Would Do With More Time

- **User authentication** — replace `localStorage` session ID with JWT-based auth (Spring Security + OAuth2). The architecture is ready: `sessionId` is already isolated per-user in the service layer.
- **Expiry dates** — add an `expiresAt` column and a `@Scheduled` job that marks expired URLs inactive.
- **Redis rate limiting** — replace `ConcurrentHashMap` with Redis `INCR` + TTL for distributed, persistent, multi-instance rate limiting.
- **QR code generation** — use the `zxing` library on the backend to generate a QR code per short URL.
- **Pagination** — the list view fetches all session URLs at once; add server-side pagination for users with many links.
- **Better test coverage** — add concurrency tests (multiple threads hitting `/shorten` simultaneously) and frontend tests with Playwright.
- **Deploy** — Vercel (frontend) + Railway or Render (Spring Boot + PostgreSQL).

---

## 🤖 AI Usage Disclosure

I used **Claude (Anthropic)** as a pair-programming assistant during this project:

- It helped me structure the `RateLimiterService` sliding-window logic and suggested `synchronized(deque)` for per-IP atomicity, which I validated before including.
- It suggested the `DataIntegrityViolationException` retry pattern for concurrency safety, which I cross-checked in the Spring docs.
- It generated boilerplate (DTOs, exception classes, Tailwind config) that I reviewed line by line.
- Architecture decisions (controller/service/repository separation, PostgreSQL choice, session ID approach) are my own.

I understand every line of code in this submission and can explain any part of it in the follow-up interview.

---

## 🛠️ Troubleshooting

**Backend won't start — `Connection refused` to PostgreSQL?**
- Make sure PostgreSQL is running: `pg_ctl status` or check Services on Windows
- Confirm `snip_db` database exists and your `.env` credentials are correct

**Port 8080 already in use?**
```bash
# macOS/Linux:
lsof -ti:8080 | xargs kill -9

# Windows (PowerShell):
netstat -ano | findstr :8080
taskkill /PID <PID> /F
```

**Maven not downloading dependencies?**
- In IntelliJ: **View → Tool Windows → Maven** → click the 🔄 Reload button

**Java version error?**
- **File → Project Structure → SDK** — must be JDK 17+

**`npm install` fails?**
- Check Node version: `node -v` (must be 18+)
- Try: `rm -rf node_modules && npm install`

---

## 📬 API Reference

| Method | Endpoint | Header | Description |
|--------|----------|--------|-------------|
| `POST` | `/api/shorten` | `X-Session-Id` | Shorten a URL (rate limited) |
| `GET` | `/api/urls` | `X-Session-Id` | List all URLs for this session |
| `GET` | `/api/resolve/:code` | — | Increment click count + return original URL |
| `DELETE` | `/api/urls/:code` | `X-Session-Id` | Delete a URL (own session only) |
