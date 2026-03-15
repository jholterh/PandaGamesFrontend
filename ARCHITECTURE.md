# Panda Gang Mini-Apps Platform — Rails Architecture Plan

**Version:** 2.0.0
**Date:** March 15, 2026
**Authors:** Jakob & Isa
**Stack:** Ruby on Rails 7+ | Hotwire | Tailwind CSS | PostgreSQL | Redis

## Executive Summary

This document outlines the complete technical architecture for the Panda Gang Mini-Apps Platform — a collaborative web application where two developers can independently create, publish, and share mini-apps and games within a unified ecosystem.

**Core Philosophy:** Convention over configuration. Each mini-app is a Rails Engine — fully isolated, independently developed, but sharing platform services and a consistent UI.

**Key Goals:**
- Enable parallel development without blocking each other
- Maintain consistent UX across all mini-apps
- Provide shared services (auth, leaderboards, storage, notifications)
- Support rapid prototyping and one-command deployment
- Scale gracefully from 2 to 100+ mini-apps

## Repository Structure

The platform is split into two separate GitHub repositories:

| Repo | Name | Purpose |
|---|---|---|
| Frontend | panda-gang-frontend | Hotwire, Stimulus, Tailwind, ViewComponents, all views |
| Backend | panda-gang-backend | Rails API, Engines, Database, Sidekiq, ActionCable |

### How They Communicate

```
┌─────────────────────────┐         ┌─────────────────────────┐
│   panda-gang-frontend   │  HTTP   │   panda-gang-backend    │
│                         │ ──────► │                         │
│  Hotwire + Stimulus     │  JSON   │  Rails API + Engines    │
│  Tailwind + Views       │ ◄────── │  PostgreSQL + Redis     │
│  ViewComponents         │         │  Sidekiq + ActionCable  │
└─────────────────────────┘         └─────────────────────────┘
     Render.com (static)                 Render.com (web)
```

**Note on Hotwire:** Since Hotwire (Turbo) traditionally runs server-side, the backend will still render HTML partials via Turbo Stream responses. The frontend repo holds all view templates and assets, while the backend handles all data and logic. They are deployed separately but work together.

### Environment Variables

**Frontend needs:**
```
BACKEND_URL=https://api.panda-gang.com
```

**Backend needs:**
```
FRONTEND_URL=https://panda-gang.com
DATABASE_URL=...
REDIS_URL=...
RAILS_MASTER_KEY=...
```

## Team & Collaboration Model

### Who Owns What

| Developer | Primary Repo | Can also work on |
|---|---|---|
| Jakob | panda-gang-backend | Frontend views for their engines |
| Isa | panda-gang-frontend | Backend logic for their engines |

This split works naturally — one person owns the API and data layer, the other owns the UI and components. Both collaborate on engines since each engine touches both repos.

### Phase 1 — Build Core Together (Week 1–2)

Both developers work together (pair programming or screen share). The core is the foundation everything depends on — you both need to understand it deeply before splitting.

**Build together:**
- Rails app scaffold + GitHub repo + branch protection rules
- PostgreSQL + Redis configuration
- Devise authentication (register, login, sessions, profile)
- App registry + dashboard (lists all mini-apps)
- Base Rails Engine template (cookie cutter for new apps)
- Tailwind shared layout (navbar, footer, design tokens)
- Platform Services API (what engines can call)
- Deploy to Render.com — live URL from day one

### Phase 2 — Branch Off (Week 3+)

Once core is solid and both understand the Engine contract:

```
main
├── feature/snake-game          ← Developer A
└── feature/tic-tac-toe         ← Developer B
```

Each developer:
1. Copies the Engine template
2. Builds their mini-app independently
3. Opens a Pull Request → other person reviews
4. Merge to main → auto-deploys via GitHub Actions

### Before Splitting — Must Agree On

| Decision | Why it matters |
|---|---|
| Engine folder structure | All apps look and feel the same |
| Manifest format | How apps register themselves |
| Platform API methods | What shared services engines can call |
| Shared UI components | Visual consistency across apps |
| Naming conventions | Routes, models, classes, DB tables |
| Git workflow | Branch naming, PR rules, review process |

## System Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                      Panda Gang Platform                        │
│                       (Main Rails App)                          │
├─────────────────────────────────────────────────────────────────┤
│   ┌─────────────┐   ┌──────────────┐   ┌───────────────┐       │
│   │ Turbo Router│   │    Devise    │   │  JSON API     │       │
│   │  + Frames   │   │     Auth     │   │  (mini-apps)  │       │
│   └─────────────┘   └──────────────┘   └───────────────┘       │
├─────────────────────────────────────────────────────────────────┤
│                       Platform Services                         │
│   • User Management    • Leaderboards     • ActiveStorage       │
│   • Notifications      • Analytics        • Permissions         │
│   • ActionCable        • Background Jobs  • Shared UI           │
└─────────────────────────────────────────────────────────────────┘
         │                    │                     │
   ┌─────▼──────┐      ┌──────▼─────┐      ┌──────▼──────┐
   │ Snake Game │      │ Tic-Tac-Toe│      │  Your App   │
   │   Engine   │      │   Engine   │      │   Engine    │
   └────────────┘      └────────────┘      └─────────────┘
              Rails Engines — Isolated & Mountable
```

## Technology Stack

| Layer | Technology | Purpose |
|---|---|---|
| Language | Ruby 3.2+ | Server-side logic |
| Framework | Rails 7.1+ | Full-stack web framework |
| Frontend | Hotwire (Turbo + Stimulus) | Reactive UI without a JS framework |
| Imports | Importmap-rails | No Node.js build step needed |
| Styling | Tailwind CSS 3+ | Utility-first CSS |
| UI Components | ViewComponent | Reusable, testable components |
| Auth | Devise + cookie sessions | Login, register, sessions — works natively with Hotwire/Turbo |
| Database | PostgreSQL 14+ | Primary data store |
| Cache/Queue | Redis | Sessions, ActionCable, Sidekiq |
| Background Jobs | Sidekiq | Async tasks (score updates, emails) |
| File Storage | ActiveStorage + S3 | Images, uploads |
| Real-time | ActionCable | Multiplayer, live leaderboards |
| Testing | RSpec + Capybara + FactoryBot | Full test suite |
| CI/CD | GitHub Actions | Auto-test + auto-deploy |
| Hosting | Render.com | Simple, affordable, PostgreSQL included |

## Project Structure

### Backend Repo — panda-gang-backend

```
panda-gang-backend/
├── app/
│   ├── assets/
│   │   └── stylesheets/
│   │       ├── application.tailwind.css
│   │       └── tokens.css              # Design tokens (colors, spacing)
│   ├── components/                     # ViewComponents
│   │   ├── app_card_component.rb
│   │   ├── app_card_component.html.erb
│   │   ├── leaderboard_component.rb
│   │   └── notification_component.rb
│   ├── controllers/
│   │   ├── application_controller.rb
│   │   ├── dashboard_controller.rb     # App gallery homepage
│   │   ├── apps_controller.rb          # App registry
│   │   └── leaderboards_controller.rb
│   ├── javascript/
│   │   ├── application.js
│   │   └── controllers/               # Stimulus controllers
│   │       ├── index.js
│   │       ├── modal_controller.js
│   │       └── notification_controller.js
│   ├── models/
│   │   ├── user.rb
│   │   ├── mini_app.rb
│   │   ├── leaderboard_entry.rb
│   │   └── user_app_data.rb
│   ├── views/
│   │   ├── layouts/
│   │   │   ├── application.html.erb   # Main layout
│   │   │   └── _navbar.html.erb
│   │   ├── dashboard/
│   │   │   └── index.html.erb         # App gallery grid
│   │   └── shared/
│   │       ├── _flash.html.erb
│   │       └── _footer.html.erb
│   └── services/                      # Platform service objects
│       ├── platform_api.rb
│       ├── score_service.rb
│       └── notification_service.rb
│
├── engines/                           # All mini-apps (backend logic only)
│   ├── _template/                     # Copy this to start a new app
│   │   ├── app/
│   │   │   ├── controllers/
│   │   │   ├── models/
│   │   │   ├── views/
│   │   │   └── javascript/
│   │   ├── config/
│   │   │   └── routes.rb
│   │   ├── manifest.json
│   │   └── [engine_name].gemspec
│   ├── snake_game/
│   ├── tic_tac_toe/
│   └── memory_cards/
│
├── config/
│   ├── routes.rb                      # Mounts all engines
│   ├── database.yml
│   └── initializers/
│       └── mini_apps.rb               # Auto-loads engine manifests
│
├── db/
│   ├── migrate/
│   └── schema.rb
│
├── spec/                              # RSpec tests
│   ├── models/
│   ├── controllers/
│   ├── system/                        # Capybara end-to-end
│   └── engines/                       # Per-engine tests
│
├── .github/
│   └── workflows/
│       ├── ci.yml                     # Run tests on every PR
│       └── deploy.yml                 # Deploy on merge to main
│
├── Gemfile
├── Procfile                           # Puma + Sidekiq
└── README.md
```

## Database Schema

```sql
-- Users (managed by Devise)
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

-- App Registry (one row per mini-app engine)
CREATE TABLE mini_apps (
  id              SERIAL PRIMARY KEY,
  slug            VARCHAR(100) UNIQUE NOT NULL,  -- 'snake-game'
  name            VARCHAR(100) NOT NULL,          -- 'Snake Game'
  description     TEXT,
  author          VARCHAR(100),
  category        VARCHAR(50),                    -- 'game', 'tool', 'utility'
  tags            TEXT[],
  thumbnail_url   VARCHAR(500),
  route_prefix    VARCHAR(100),                   -- '/apps/snake-game'
  version         VARCHAR(20),
  is_published    BOOLEAN DEFAULT false,
  play_count      INTEGER DEFAULT 0,
  created_at      TIMESTAMP DEFAULT NOW()
);

-- Per-user, per-app flexible data store
CREATE TABLE user_app_data (
  id              SERIAL PRIMARY KEY,
  user_id         INTEGER REFERENCES users(id) ON DELETE CASCADE,
  mini_app_id     INTEGER REFERENCES mini_apps(id) ON DELETE CASCADE,
  data            JSONB DEFAULT '{}',             -- Any app-specific data
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
  metadata        JSONB DEFAULT '{}',             -- Level, mode, etc.
  achieved_at     TIMESTAMP DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_leaderboard_app_score ON leaderboard_entries(mini_app_id, score DESC);
CREATE INDEX idx_user_app_data_user    ON user_app_data(user_id);
CREATE INDEX idx_user_app_data_app     ON user_app_data(mini_app_id);
```

## Rails Engine Pattern (Mini-App Contract)

Every mini-app is a Rails Engine mounted at `/apps/:slug`. This is the contract both developers must follow.

### Engine Structure

```
engines/snake_game/
├── app/
│   ├── controllers/
│   │   └── snake_game/
│   │       └── game_controller.rb
│   ├── models/
│   │   └── snake_game/
│   │       └── game_session.rb       # Engine-specific models (optional)
│   ├── views/
│   │   └── snake_game/
│   │       └── game/
│   │           └── show.html.erb
│   └── javascript/
│       └── snake_game/
│           └── game_controller.js    # Stimulus controller
├── config/
│   └── routes.rb
├── manifest.json
├── lib/
│   ├── snake_game.rb
│   └── snake_game/
│       └── engine.rb
└── snake_game.gemspec
```

### manifest.json

```json
{
  "id": "snake-game",
  "name": "Snake Game",
  "version": "1.0.0",
  "author": "Jakob",
  "description": "Classic snake game. Eat, grow, don't crash.",
  "category": "game",
  "tags": ["arcade", "solo", "keyboard"],
  "thumbnail": "snake_thumbnail.png",
  "route_prefix": "/apps/snake-game",
  "permissions": ["scores", "storage"],
  "supports_multiplayer": false,
  "min_platform_version": "1.0.0"
}
```

### Engine Ruby File

```ruby
# engines/snake_game/lib/snake_game/engine.rb
module SnakeGame
  class Engine < ::Rails::Engine
    isolate_namespace SnakeGame

    initializer "snake_game.register" do
      # Auto-registers with platform on boot
      PlatformRegistry.register(
        File.join(root, "manifest.json")
      )
    end
  end
end
```

### Mounting Engines

```ruby
# config/routes.rb
Rails.application.routes.draw do
  devise_for :users

  root "dashboard#index"

  namespace :apps do
    # Auto-mounted from engines/ directory
    mount SnakeGame::Engine,   at: "snake-game"
    mount TicTacToe::Engine,   at: "tic-tac-toe"
    mount MemoryCards::Engine, at: "memory-cards"
  end

  # Platform API
  namespace :api do
    namespace :v1 do
      resources :scores,        only: [:create, :index]
      resources :leaderboards,  only: [:index]
      resources :app_data,      only: [:show, :update]
    end
  end
end
```

## Platform Services API

Every engine can call these shared services. Both developers must use these — never reinvent them inside an engine.

```ruby
# app/services/platform_api.rb
module PlatformAPI

  # --- Scores & Leaderboards ---

  def self.submit_score(user:, app_slug:, score:, metadata: {})
    app = MiniApp.find_by!(slug: app_slug)
    LeaderboardEntry.create!(
      user: user,
      mini_app: app,
      score: score,
      metadata: metadata,
      achieved_at: Time.current
    )
    update_high_score(user: user, app: app, score: score)
  end

  def self.leaderboard(app_slug:, limit: 10)
    MiniApp.find_by!(slug: app_slug)
      .leaderboard_entries
      .order(score: :desc)
      .limit(limit)
      .includes(:user)
  end

  # --- User App Data (save/load any JSON) ---

  def self.save_data(user:, app_slug:, data:)
    app = MiniApp.find_by!(slug: app_slug)
    record = UserAppData.find_or_initialize_by(user: user, mini_app: app)
    record.update!(data: data, last_played_at: Time.current)
  end

  def self.load_data(user:, app_slug:)
    app = MiniApp.find_by!(slug: app_slug)
    UserAppData.find_by(user: user, mini_app: app)&.data || {}
  end

  # --- Notifications ---

  def self.notify(user:, message:, type: :info)
    NotificationService.send(user: user, message: message, type: type)
  end

  private

  def self.update_high_score(user:, app:, score:)
    record = UserAppData.find_or_initialize_by(user: user, mini_app: app)
    if score > (record.high_score || 0)
      record.update!(high_score: score)
    end
  end
end
```

## Shared UI Components (ViewComponent)

Both developers use these. Do not write duplicate UI inside engines.

```ruby
# app/components/leaderboard_component.rb
class LeaderboardComponent < ViewComponent::Base
  def initialize(app_slug:, limit: 10)
    @entries = PlatformAPI.leaderboard(app_slug: app_slug, limit: limit)
  end
end
```

```erb
<%# app/components/leaderboard_component.html.erb %>
<div class="bg-white rounded-xl shadow p-4">
  <h3 class="font-bold text-lg mb-3">Leaderboard</h3>
  <% @entries.each_with_index do |entry, i| %>
    <div class="flex justify-between py-1 border-b">
      <span><%= i + 1 %>. <%= entry.user.username %></span>
      <span class="font-mono font-bold"><%= entry.score %></span>
    </div>
  <% end %>
</div>
```

**Available shared components:**
- `LeaderboardComponent` — top scores for any app
- `AppCardComponent` — card shown on the dashboard
- `NotificationComponent` — flash/toast messages
- `ScoreDisplayComponent` — live score during gameplay
- `GameOverModalComponent` — end-of-game overlay

## Authentication Flow

Devise handles everything with cookies — no token management needed.

```ruby
# Gemfile
gem 'devise'

# User model gets standard Devise modules
class User < ApplicationRecord
  devise :database_authenticatable,
         :registerable,
         :recoverable,
         :rememberable,
         :validatable
end
```

Because the session is a cookie, Turbo and ActionCable both pick it up automatically — no Authorization headers, no token refresh logic, no extra middleware.

```erb
<%# Works out of the box with Turbo %>
<%= link_to "Sign out", destroy_user_session_path, data: { turbo_method: :delete } %>
```

**Why not JWT here:**
- JWT is designed for decoupled SPAs calling a pure JSON API
- Hotwire is server-rendered — the session cookie is already there on every request
- ActionCable authentication with JWT requires custom middleware; with sessions it's one line
- Fewer moving parts = faster development for a two-person team

## Real-Time Features (ActionCable)

For live leaderboards and future multiplayer support:

```ruby
# app/channels/leaderboard_channel.rb
class LeaderboardChannel < ApplicationCable::Channel
  def subscribed
    stream_from "leaderboard_#{params[:app_slug]}"
  end
end
```

```javascript
// Stimulus controller in any engine
import { Controller } from "@hotwired/stimulus"
import consumer from "channels/consumer"

export default class extends Controller {
  connect() {
    this.subscription = consumer.subscriptions.create(
      { channel: "LeaderboardChannel", app_slug: this.appSlugValue },
      { received: (data) => this.updateLeaderboard(data) }
    )
  }

  updateLeaderboard(data) {
    // Turbo Stream will handle the DOM update
    Turbo.renderStreamMessage(data.html)
  }
}
```

## Git Workflow & Branch Strategy

Both repos follow the same branch strategy independently.

### Backend — panda-gang-backend

```
main  (prod) <- protected, auto-deploys to production
└── dev   (staging) <- protected, auto-deploys to staging
    ├── feature/snake-game-api      <- Jakob
    ├── feature/tic-tac-toe-api     <- Isa
    └── fix/score-not-saving        <- whoever
```

### Frontend — panda-gang-frontend

```
main  (prod) <- protected, auto-deploys to production
└── dev   (staging) <- protected, auto-deploys to staging
    ├── feature/snake-game-ui       <- Jakob
    ├── feature/tic-tac-toe-ui      <- Isa
    └── fix/navbar-mobile           <- whoever
```

### The Full Flow

```
feature branch  →  PR into dev   →  code review  →  merge
                                                          ↓
                                                    auto-deploy
                                                    to staging

test on staging (both developers)

dev  →  PR into main  →  code review  →  merge
                                               ↓
                                         auto-deploy
                                         to production
```

### Environments on Render.com

| Environment | Branch | Backend URL | Frontend URL |
|---|---|---|---|
| Staging | dev | api-staging.pandagames.com | staging.pandagames.com |
| Production | main | api.pandagames.com | pandagames.com |

### Branch Rules (both repos)

- `main` and `dev` are protected — no direct pushes ever
- All work happens on feature branches
- PRs always go into `dev` first, never directly into `main`
- The other developer must review before merge
- CI must be green before merge
- `main` only receives PRs from `dev` — never from feature branches

### Syncing Both Repos for a Feature

When building a mini-app like Snake, you open two PRs at the same time:

```
panda-gang-backend:  feature/snake-game-api  →  dev
panda-gang-frontend: feature/snake-game-ui   →  dev
```

Merge backend first, then frontend — so the API exists before the UI calls it.

### Commit Convention

```
feat(snake):     add game-over API endpoint
feat(ui/snake):  add game-over screen
fix(platform):   correct score not saving on timeout
chore(deps):     bump rails to 7.1.3
test(tic-tac):   add win condition spec
```

## CI/CD Pipeline (GitHub Actions)

```yaml
# .github/workflows/ci.yml
name: CI

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres:14
        env:
          POSTGRES_PASSWORD: postgres
      redis:
        image: redis:7

    steps:
      - uses: actions/checkout@v4
      - uses: ruby/setup-ruby@v1
        with:
          bundler-cache: true
      - run: bin/rails db:create db:schema:load
      - run: bundle exec rspec
      - run: bundle exec rubocop
```

```yaml
# .github/workflows/deploy.yml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: curl -X POST ${{ secrets.RENDER_DEPLOY_HOOK }}
```

## First Session Checklist

When you sit down together for the very first time:

### Setup (do once together)

- [ ] Create GitHub repo, add both as collaborators
- [ ] Enable branch protection on main
- [ ] Run `rails new panda-gang --database=postgresql --css=tailwind`
- [ ] Add Devise, ViewComponent, Redis, Sidekiq to Gemfile
- [ ] Run migrations for users, mini_apps, user_app_data, leaderboard_entries
- [ ] Build dashboard index page (grid of app cards)
- [ ] Create the _template engine folder
- [ ] Write the PlatformAPI service
- [ ] Deploy to Render.com — confirm it's live
- [ ] Both clone the repo, run locally, confirm it works on both machines

### Before splitting

- [ ] Both understand the Engine template structure
- [ ] Both understand how to call PlatformAPI
- [ ] Agree on manifest.json format
- [ ] Agree on branch naming and PR process
- [ ] Each person picks their first mini-app to build

## Implementation Roadmap

**Week 1 — Platform Core (Together)**
- Rails new + GitHub repo
- Auth with Devise
- Database schema + migrations
- Dashboard page
- PlatformAPI service
- Engine _template folder
- Deploy to Render

**Week 2 — Platform Polish (Together)**
- ViewComponents (AppCard, Leaderboard, GameOver)
- ActionCable setup
- Sidekiq + Redis
- CI/CD with GitHub Actions
- First engine built together (simple example app)

**Week 3+ — Mini-Apps (Split)**
- Each developer builds their own engines
- PRs reviewed by the other developer
- Engines merged and deployed continuously

**Ongoing**
- Weekly sync: review each other's engines
- Monthly: platform improvements and shared component additions

## Deployment on Render.com

```yaml
# render.yaml
services:
  - type: web
    name: panda-gang
    env: ruby
    buildCommand: "./bin/render-build.sh"
    startCommand: "bundle exec puma -C config/puma.rb"
    envVars:
      - key: DATABASE_URL
        fromDatabase:
          name: panda-gang-db
          property: connectionString
      - key: REDIS_URL
        fromService:
          name: panda-gang-redis
          property: connectionString
      - key: RAILS_MASTER_KEY
        sync: false

  - type: worker
    name: panda-gang-worker
    env: ruby
    startCommand: "bundle exec sidekiq"

databases:
  - name: panda-gang-db
    plan: free

redis:
  - name: panda-gang-redis
    plan: free
```

---

Built by Panda Gang — Jakob & Isa, one platform, infinite mini-apps.
