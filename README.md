# Panda Gang Frontend

React + TypeScript + Vite frontend for Panda Gang.

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v18 or higher recommended)

### Setup

1. Install dependencies:

   ```sh
   npm install
   ```

2. Copy the example env file and configure it:

   ```sh
   cp .env.example .env
   ```

   Update `VITE_API_URL` if your backend runs on a different host/port (defaults to `http://localhost:3000`).

3. Start the dev server:

   ```sh
   npm run dev
   ```

   The app will be available at `http://localhost:5173`.

### Other Commands

| Command           | Description                |
| ----------------- | -------------------------- |
| `npm run build`   | Type-check and build for production |
| `npm run preview` | Preview the production build locally |
| `npm run lint`    | Run ESLint                 |
