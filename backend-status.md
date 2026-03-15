# Backend Status — API-Only Backend
**Last updated: 2026-03-15** Branch: `emdash/feat-setup-2sh` (PR #6)

## Architecture
This is an API-only Rails 8.1.2 backend. There are no HTML views — all UI is handled by a separate React frontend. The backend returns JSON and authenticates via JWT tokens in the `Authorization` header.

CORS is configured to accept requests from `FRONTEND_URL` (defaults to `http://localhost:5173`).

## Authentication (JWT)

### Sign Up
```
POST /api/v1/auth/sign_up
Body: { username: "jakob", email: "jakob@example.com", password: "secret123", password_confirmation: "secret123" }
Response 201: { token: "eyJhbG...", user: { id: 1, username: "jakob", email: "...", avatar_url: null, total_score: 0 } }
Response 422: { errors: ["Username has already been taken"] }
```

### Sign In
```
POST /api/v1/auth/sign_in
Body: { email: "jakob@example.com", password: "secret123" }
Response 200: { token: "eyJhbG...", user: { id: 1, username: "jakob", ... } }
Response 401: { error: "Invalid email or password" }
```

### Using the Token
Include in all authenticated requests:
```
Authorization: Bearer eyJhbG...
```
Tokens expire after 24 hours. On 401, the frontend should redirect to sign-in.

## API Endpoints

### Auth

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/api/v1/auth/sign_up` | No | Register a new user |
| POST | `/api/v1/auth/sign_in` | No | Login, get JWT token |

### Users

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/v1/users/me` | Yes | Current user profile |
| PUT | `/api/v1/users/me` | Yes | Update username, avatar_url |

Response:
```json
{ "user": { "id": 1, "username": "jakob", "email": "jakob@example.com", "avatar_url": null, "total_score": 0 } }
```

### Apps

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/v1/apps` | No | List all published apps (for dashboard) |
| GET | `/api/v1/apps/:slug` | No | Single app details |

Response (index):
```json
[{ "slug": "snake-game", "name": "Snake Game", "description": "...", "author": "Jakob", "category": "game", "tags": ["arcade","solo"], "thumbnail_url": null, "route_prefix": "/apps/snake-game", "version": "0.1.0", "is_published": true, "play_count": 42 }]
```

### Scores & Leaderboards

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/api/v1/apps/:app_slug/scores` | Yes | Submit a score |
| GET | `/api/v1/apps/:app_slug/leaderboard?limit=10` | No | Get top scores |

Submit score body: `{ score: 150, metadata: { level: 3 } }`

Leaderboard response:
```json
[{ "rank": null, "username": "jakob", "score": 250, "achieved_at": "2026-03-15T12:00:00Z" }]
```

### App Data (per-user storage)

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/v1/apps/:app_slug/data` | Yes | Load saved data |
| PUT | `/api/v1/apps/:app_slug/data` | Yes | Save data |

Load response: `{ "data": { "level": 3, "settings": { "sound": true } } }`
Save body: `{ "data": { ... } }` → Response: `{ "status": "ok" }`

### Engine Endpoints

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/apps/snake-game/score` | Yes | Submit snake game score |

Body: `{ score: 150, food_eaten: 15 }`

## Database Schema

### users

| Column | Type | Notes |
|--------|------|-------|
| username | string | unique, required, max 50 chars |
| email | string | unique, required (Devise) |
| avatar_url | string | nullable |
| total_score | integer | default 0, not auto-updated yet |

### mini_apps

| Column | Type | Notes |
|--------|------|-------|
| slug | string | unique, e.g. "snake-game" |
| name | string | display name |
| description | text | |
| author | string | |
| category | string | "game", "tool", "utility" |
| tags | text[] | postgres array |
| thumbnail_url | string | nullable |
| route_prefix | string | e.g. "/apps/snake-game" |
| version | string | |
| is_published | boolean | default false |
| play_count | integer | default 0 |

### user_app_data
Per-user, per-app flexible storage. Unique on `[user_id, mini_app_id]`.

| Column | Type | Notes |
|--------|------|-------|
| user_id | FK → users | |
| mini_app_id | FK → mini_apps | |
| data | jsonb | any app-specific data |
| high_score | integer | default 0 |
| play_count | integer | default 0 |
| last_played_at | datetime | |

### leaderboard_entries

| Column | Type | Notes |
|--------|------|-------|
| mini_app_id | FK → mini_apps | |
| user_id | FK → users | |
| score | integer | required |
| metadata | jsonb | level, mode, etc. |
| achieved_at | datetime | required |

Indexed on `[mini_app_id, score DESC]` for fast leaderboard queries.

## PlatformApi Service
Backend-internal service used by engines and controllers:

```ruby
PlatformApi.submit_score(user:, app_slug:, score:, metadata: {})
PlatformApi.leaderboard(app_slug:, limit: 10)
PlatformApi.save_data(user:, app_slug:, data:)
PlatformApi.load_data(user:, app_slug:)
PlatformApi.notify(user:, message:, type:)  # logs only for now
```

`submit_score` also broadcasts to ActionCable.

## ActionCable — Live Leaderboard
When a score is submitted, the backend broadcasts:

- **Channel:** `LeaderboardChannel`
- **Stream:** `"leaderboard_#{app_slug}"`
- **Payload:** `{ action: "new_score", username: "jakob", score: 250 }`

The React frontend can subscribe using `@rails/actioncable`:

```javascript
import { createConsumer } from "@rails/actioncable"
const consumer = createConsumer("ws://localhost:3000/cable")
consumer.subscriptions.create(
  { channel: "LeaderboardChannel", app_slug: "snake-game" },
  { received(data) { /* update leaderboard UI */ } }
)
```

## Engine Pattern
Each mini-app is a Rails Engine providing API-only endpoints. No views — game UI lives in the React frontend.

### Snake Game Engine (`engines/snake_game/`)
```
engines/snake_game/
├── app/controllers/snake_game/game_controller.rb   # POST /score
├── app/models/                                      # (empty for now)
├── config/routes.rb
├── lib/snake_game.rb
├── lib/snake_game/engine.rb
├── manifest.json
└── snake_game.gemspec
```

### Engine Template (`engines/_template/`)
Copy to start a new engine. Update module name, gemspec, manifest.json, add to Gemfile, mount in routes.

## Seeds
3 mini-apps seeded (`bin/rails db:seed`):

- **Snake Game** — published, has engine
- **Tic-Tac-Toe** — published, no engine yet
- **Memory Cards** — published, no engine yet

## Error Responses
All errors follow a consistent format:
```json
{ "error": "Unauthorized" }           // 401
{ "error": "Not found" }              // 404 (ActiveRecord::RecordNotFound)
{ "errors": ["Email is invalid"] }    // 422
```

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `FRONTEND_URL` | `http://localhost:5173` | CORS allowed origin |
| `DATABASE_URL` | (from database.yml) | PostgreSQL connection |
| `RAILS_MASTER_KEY` | (from credentials) | Decrypts credentials, used for JWT signing |

## What's NOT Built Yet
- No avatar upload — column exists, `PUT /users/me` accepts `avatar_url` but no file upload
- No `total_score` aggregation — column exists, not auto-updated
- No notification system — `PlatformApi.notify` just logs
- Tic-Tac-Toe / Memory Cards engines — seeded but not built
- No password reset API endpoint — Devise mailer is configured but no API route exposed
