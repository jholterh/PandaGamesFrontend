# Panda Gang Mini-Apps Platform — Architecture

**Version:** 3.0.0
**Date:** March 15, 2026
**Authors:** Jakob & Isa
**Stack:** Rails 8.1.2 API | React Frontend | PostgreSQL | JWT Auth

## Executive Summary

The Panda Gang Mini-Apps Platform is a collaborative web application where two developers independently create, publish, and share mini-apps and games within a unified ecosystem.

**Core Philosophy:** Convention over configuration. Each mini-app is a Rails Engine — fully isolated, independently developed, but sharing platform services.

**Key Goals:**
- Enable parallel development without blocking each other
- Provide shared services (auth, leaderboards, storage, notifications)
- Support rapid prototyping and one-command deployment
- Scale gracefully from 2 to 100+ mini-apps

## Repository Structure

| Repo | Name | Purpose |
|---|---|---|
| Frontend | panda-gang-frontend | React SPA, game UIs, all views |
| Backend | panda-gang-backend | Rails API, Engines, Database, ActionCable |

### How They Communicate

```
┌─────────────────────────┐         ┌─────────────────────────┐
│   panda-gang-frontend   │  HTTP   │   panda-gang-backend    │
│                         │ ──────► │                         │
│  React + TypeScript     │  JSON   │  Rails API (api_only)   │
│  Tailwind CSS           │ ◄────── │  PostgreSQL             │
│  Vite                   │   WS    │  Solid Queue/Cable      │
└─────────────────────────┘ ◄─────► └─────────────────────────┘
                              ActionCable
```

### Environment Variables

**Frontend needs:**
```
VITE_API_URL=http://localhost:3000
```

**Backend needs:**
```
FRONTEND_URL=http://localhost:5173
DATABASE_URL=...
RAILS_MASTER_KEY=...
```

## Technology Stack

| Layer | Technology | Purpose |
|---|---|---|
| Language | Ruby 3.3+ | Server-side logic |
| Framework | Rails 8.1.2 (API-only) | JSON API + Engines |
| Frontend | React + TypeScript + Vite | SPA, game UIs |
| Styling | Tailwind CSS 4 | Utility-first CSS (frontend repo) |
| Auth | Devise + JWT (jwt gem) | Stateless token authentication |
| Database | PostgreSQL 14+ | Primary data store |
| Cache | Solid Cache | Database-backed cache (no Redis) |
| Background Jobs | Solid Queue | Database-backed job queue (no Redis) |
| Real-time | ActionCable + Solid Cable | Live leaderboards (no Redis) |
| File Storage | ActiveStorage + S3 | Images, uploads |
| Testing | Minitest + fixtures | Default Rails testing |
| CI/CD | GitHub Actions | Auto-test + auto-deploy |
| Deployment | Kamal + Docker | Container-based deploys |
| CORS | rack-cors | Cross-origin frontend access |

**Key difference from original plan:** No Redis dependency. Rails 8 Solid adapters (Cache, Queue, Cable) use the database instead, simplifying infrastructure.

## System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                      Panda Gang Platform                        │
│                    (Rails 8 API-only app)                        │
├─────────────────────────────────────────────────────────────────┤
│   ┌──────────────┐   ┌──────────────┐   ┌───────────────┐      │
│   │  JWT Auth    │   │  Devise      │   │  JSON API     │      │
│   │  (stateless) │   │  (users)     │   │  /api/v1/*    │      │
│   └──────────────┘   └──────────────┘   └───────────────┘      │
├─────────────────────────────────────────────────────────────────┤
│                       Platform Services                         │
│   • PlatformApi      • Leaderboards     • ActiveStorage        │
│   • JwtService       • ActionCable      • Background Jobs      │
│   • User Management  • App Data (JSONB) • Notifications        │
└─────────────────────────────────────────────────────────────────┘
         │                    │                     │
   ┌─────▼──────┐      ┌──────▼─────┐      ┌──────▼──────┐
   │ Snake Game │      │ Tic-Tac-Toe│      │  Your App   │
   │   Engine   │      │   Engine   │      │   Engine    │
   └────────────┘      └────────────┘      └─────────────┘
              Rails Engines — API-only, Isolated
```

## Backend Project Structure

```
panda-gang-backend/
├── app/
│   ├── channels/
│   │   ├── application_cable/
│   │   │   ├── channel.rb
│   │   │   └── connection.rb
│   │   └── leaderboard_channel.rb
│   ├── controllers/
│   │   ├── application_controller.rb    # ActionController::API + JWT auth
│   │   └── api/v1/
│   │       ├── base_controller.rb       # Shared auth + helpers
│   │       ├── sessions_controller.rb   # POST sign_in
│   │       ├── registrations_controller.rb  # POST sign_up
│   │       ├── users_controller.rb      # GET/PUT /users/me
│   │       ├── apps_controller.rb       # GET /apps, /apps/:slug
│   │       ├── scores_controller.rb     # POST /apps/:slug/scores
│   │       ├── leaderboards_controller.rb   # GET /apps/:slug/leaderboard
│   │       └── app_data_controller.rb   # GET/PUT /apps/:slug/data
│   ├── models/
│   │   ├── user.rb
│   │   ├── mini_app.rb
│   │   ├── leaderboard_entry.rb
│   │   └── user_app_data.rb
│   └── services/
│       ├── platform_api.rb              # Shared service contract for engines
│       └── jwt_service.rb               # JWT encode/decode
│
├── engines/                             # All mini-apps (API-only)
│   ├── _template/                       # Copy this to start a new app
│   │   ├── app/controllers/
│   │   ├── app/models/
│   │   ├── config/routes.rb
│   │   ├── manifest.json
│   │   └── _template.gemspec
│   └── snake_game/                      # First engine
│       ├── app/controllers/snake_game/
│       │   ├── application_controller.rb
│       │   └── game_controller.rb       # POST /score
│       ├── config/routes.rb
│       ├── manifest.json
│       ├── lib/snake_game.rb
│       ├── lib/snake_game/engine.rb
│       └── snake_game.gemspec
│
├── config/
│   ├── routes.rb                        # API routes + engine mounts
│   ├── initializers/
│   │   ├── cors.rb                      # CORS for frontend
│   │   └── devise.rb                    # Devise config (API mode)
│   └── database.yml
│
├── db/
│   ├── migrate/                         # 4 migrations
│   ├── schema.rb
│   └── seeds.rb                         # 3 sample mini-apps
│
├── test/                                # Minitest + fixtures
│   ├── models/
│   ├── fixtures/
│   └── test_helper.rb
│
├── .github/workflows/
│   └── ci.yml
├── Gemfile
└── Dockerfile
```

## Database Schema

```sql
-- Users (managed by Devise + JWT)
CREATE TABLE users (
  id              SERIAL PRIMARY KEY,
  username        VARCHAR(50)  UNIQUE NOT NULL,
  email           VARCHAR(255) UNIQUE NOT NULL,
  encrypted_password VARCHAR(255) NOT NULL,
  avatar_url      VARCHAR(500),
  total_score     INTEGER DEFAULT 0,
  created_at      TIMESTAMP DEFAULT NOW(),
  updated_at      TIMESTAMP DEFAULT NOW()
);

-- App Registry
CREATE TABLE mini_apps (
  id              SERIAL PRIMARY KEY,
  slug            VARCHAR(100) UNIQUE NOT NULL,
  name            VARCHAR(100) NOT NULL,
  description     TEXT,
  author          VARCHAR(100),
  category        VARCHAR(50),
  tags            TEXT[],
  thumbnail_url   VARCHAR(500),
  route_prefix    VARCHAR(100),
  version         VARCHAR(20),
  is_published    BOOLEAN DEFAULT false,
  play_count      INTEGER DEFAULT 0,
  created_at      TIMESTAMP DEFAULT NOW(),
  updated_at      TIMESTAMP DEFAULT NOW()
);

-- Per-user, per-app flexible data store
CREATE TABLE user_app_data (
  id              SERIAL PRIMARY KEY,
  user_id         INTEGER REFERENCES users(id) ON DELETE CASCADE,
  mini_app_id     INTEGER REFERENCES mini_apps(id) ON DELETE CASCADE,
  data            JSONB DEFAULT '{}',
  high_score      INTEGER DEFAULT 0,
  play_count      INTEGER DEFAULT 0,
  last_played_at  TIMESTAMP,
  UNIQUE(user_id, mini_app_id)
);

-- Global leaderboard entries
CREATE TABLE leaderboard_entries (
  id              SERIAL PRIMARY KEY,
  mini_app_id     INTEGER REFERENCES mini_apps(id) ON DELETE CASCADE,
  user_id         INTEGER REFERENCES users(id) ON DELETE CASCADE,
  score           INTEGER NOT NULL,
  metadata        JSONB DEFAULT '{}',
  achieved_at     TIMESTAMP NOT NULL,
  created_at      TIMESTAMP DEFAULT NOW(),
  updated_at      TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_leaderboard_app_score ON leaderboard_entries(mini_app_id, score DESC);
```

## Authentication Flow

The backend is API-only. Authentication uses JWT tokens — no cookies, no sessions.

```
Frontend                              Backend
───────                              ───────
POST /api/v1/auth/sign_up    ──────►  Create user
  { username, email, password }       Return { token, user }
                              ◄──────

Store token in localStorage/memory

GET /api/v1/users/me         ──────►  Decode JWT from header
  Authorization: Bearer <token>       Return { user }
                              ◄──────
```

**JWT details:**
- Signed with `Rails.application.credentials.secret_key_base`
- 24-hour expiry
- Stateless (no denylist table)
- Frontend sends `Authorization: Bearer <token>` on every authenticated request

## Platform Services (PlatformApi)

Every engine calls these shared services. Never reinvent them inside an engine.

```ruby
# app/services/platform_api.rb
module PlatformApi
  def self.submit_score(user:, app_slug:, score:, metadata: {})
  def self.leaderboard(app_slug:, limit: 10)
  def self.save_data(user:, app_slug:, data:)
  def self.load_data(user:, app_slug:)
  def self.notify(user:, message:, type: :info)  # placeholder
end
```

`submit_score` also broadcasts to ActionCable's `LeaderboardChannel`.

## Rails Engine Pattern (Mini-App Contract)

Every mini-app is a Rails Engine mounted at `/apps/:slug`. Engines provide API-only endpoints — all game UI lives in the React frontend.

### Engine Structure

```
engines/snake_game/
├── app/controllers/snake_game/
│   ├── application_controller.rb    # inherits ::ApplicationController
│   └── game_controller.rb          # API endpoints
├── app/models/snake_game/           # engine-specific models (optional)
├── config/routes.rb
├── manifest.json
├── lib/
│   ├── snake_game.rb
│   └── snake_game/engine.rb
└── snake_game.gemspec
```

### Adding a New Engine

1. Copy `engines/_template/` → `engines/your_app/`
2. Update module name, gemspec, `manifest.json`
3. Add `gem "your_app", path: "engines/your_app"` to Gemfile
4. Mount in `config/routes.rb`: `mount YourApp::Engine, at: "/apps/your-app"`
5. Build the corresponding React component in the frontend repo

## Real-Time (ActionCable)

Live leaderboard updates via WebSocket:

```ruby
# Backend broadcasts on score submit
ActionCable.server.broadcast(
  "leaderboard_#{app_slug}",
  { action: "new_score", username: user.username, score: score }
)
```

```javascript
// React frontend subscribes
import { createConsumer } from "@rails/actioncable"
const cable = createConsumer("ws://localhost:3000/cable")
cable.subscriptions.create(
  { channel: "LeaderboardChannel", app_slug: "snake-game" },
  { received(data) { /* update UI */ } }
)
```

Powered by Solid Cable — no Redis required.

## API Routes

```ruby
# config/routes.rb
namespace :api do
  namespace :v1 do
    # Auth
    post "auth/sign_in",  to: "sessions#create"
    post "auth/sign_up",  to: "registrations#create"

    # Current user
    get  "users/me",      to: "users#me"
    put  "users/me",      to: "users#update_me"

    # Apps
    get  "apps",          to: "apps#index"
    get  "apps/:slug",    to: "apps#show"

    # Per-app resources
    post "apps/:app_slug/scores",       to: "scores#create"
    get  "apps/:app_slug/leaderboard",  to: "leaderboards#index"
    get  "apps/:app_slug/data",         to: "app_data#show"
    put  "apps/:app_slug/data",         to: "app_data#update"
  end
end

# Engine mounts
mount SnakeGame::Engine, at: "/apps/snake-game"
```

## Git Workflow

```
main (prod) ← protected, auto-deploys
├── feature/snake-game     ← Developer A
└── feature/tic-tac-toe    ← Developer B
```

**Rules:**
- `main` is protected — no direct pushes
- All work on feature branches → PR → review → merge
- CI must be green before merge

**Commit convention:**
```
feat(snake):     add game-over API endpoint
fix(platform):   correct score not saving on timeout
chore(deps):     bump rails to 8.1.2
test(models):    add leaderboard entry validations
```

## CI/CD

CI runs via `bin/ci`:
- `bin/rubocop` — style checks
- `bin/bundler-audit` — gem security audit
- `bin/brakeman` — static security analysis
- `bin/rails test` — Minitest suite
- `db:seed:replant` — seed validation

Deployment via Kamal + Docker (configured in `config/deploy.yml`).

## Team & Collaboration

| Developer | Owns | Also works on |
|---|---|---|
| Jakob | Backend (Rails API, engines) | Frontend game components |
| Isa | Frontend (React, UI) | Backend engine logic |

### Phase 1 — Core Platform (done)
- [x] Rails API scaffold + GitHub repo
- [x] JWT authentication
- [x] Database schema + migrations
- [x] PlatformApi service
- [x] API endpoints (auth, apps, scores, leaderboards, data)
- [x] Engine template
- [x] Snake Game engine (API)
- [x] ActionCable leaderboard channel
- [x] CORS configuration
- [x] CI pipeline

### Phase 2 — Build Mini-Apps
- [ ] Snake Game frontend (React)
- [ ] Tic-Tac-Toe engine + frontend
- [ ] Memory Cards engine + frontend
- [ ] Live leaderboard (ActionCable consumer in React)

### Phase 3 — Polish
- [ ] Avatar upload (ActiveStorage)
- [ ] Total score aggregation
- [ ] Notification system
- [ ] Password reset API endpoint

---

Built by Panda Gang — Jakob & Isa, one platform, infinite mini-apps.
