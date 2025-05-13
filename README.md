# dpin-uptime Monorepo

A modular, full-stack uptime monitoring platform built with Bun, TypeScript, TurboRepo, and Docker.  
This monorepo contains backend services, a Next.js frontend, and shared packages for a scalable, maintainable architecture.

---

## Table of Contents

- [Project Structure](#project-structure)
- [Requirements](#requirements)
- [Getting Started](#getting-started)
  - [Local Development (Bun)](#local-development-bun)
  - [Running with Docker](#running-with-docker)
- [Scripts](#scripts)
- [Environment Variables](#environment-variables)
- [Database](#database)
- [Production](#production)
- [Troubleshooting](#troubleshooting)
- [License](#license)

---

## Project Structure

```
.
├── apps/
│   ├── frontend/   # Next.js frontend
│   ├── hub/        # Main backend service (WebSocket server, API)
│   ├── poller/     # Polls websites, processes transactions
│   └── validator/  # Validates data, connects to hub via WebSocket
├── packages/
│   ├── common/             # Shared utilities
│   ├── db/                 # Database client, Prisma schema, migrations
│   ├── typescript-config/  # Shared tsconfig
│   ├── ui/                 # Shared UI components
│   └── eslint-config/      # Shared lint config
├── docker/
│   ├── local/       # Dockerfiles for local dev
│   └── production/  # Dockerfiles for production
├── docker-compose.yml
├── package.json
└── ...
```

---

## Requirements

- [Bun](https://bun.sh/) (v1.2.7+)
- [Node.js](https://nodejs.org/) (v18+)
- [Docker](https://www.docker.com/) & [Docker Compose](https://docs.docker.com/compose/)
- [TurboRepo](https://turbo.build/) (installed via devDependencies)
- [PostgreSQL](https://www.postgresql.org/) (runs in Docker by default)

---

## Getting Started

### Local Development (Bun)

1. **Install dependencies:**

   ```sh
   bun install
   ```

2. **Set up environment variables:**

   - Copy `.env.example` to `.env.local` in each app (see [Environment Variables](#environment-variables)).
   - Adjust values as needed.

3. **Start the database (Postgres) and pgAdmin:**

   ```sh
   docker-compose up -d postgres pgadmin
   ```

4. **Run database migrations:**

   ```sh
   bun run db:generate
   bun run db:push
   ```

5. **Start all apps in dev mode:**

   ```sh
   bun run dev
   ```

   Or run a specific app:

   ```sh
   bun run hub
   bun run validator
   bun run poller
   bun run frontend
   ```

6. **Access the frontend:**  
   Open [http://localhost:3000](http://localhost:3000)

---

### Running with Docker

1. **Build and start all services:**

   ```sh
   docker-compose up --build
   ```

2. **Services:**

   - **Frontend:** [http://localhost:3000](http://localhost:3000)
   - **Hub:** [http://localhost:8081](http://localhost:8081)
   - **Validator, Poller:** Internal services
   - **Postgres:** [localhost:5432](http://localhost:5432)
   - **pgAdmin:** [http://localhost:5050](http://localhost:5050) (login: admin@admin.com / admin)

3. **Stopping services:**
   ```sh
   docker-compose down
   ```

---

## Scripts

From the root `package.json`:

| Script                  | Description                              |
| ----------------------- | ---------------------------------------- |
| `bun run dev`           | Start all apps in dev mode (TurboRepo)   |
| `bun run build`         | Build all apps                           |
| `bun run lint`          | Lint all apps and packages               |
| `bun run format`        | Format code with Prettier                |
| `bun run check-types`   | Type-check all apps/packages             |
| `bun run hub`           | Start only the hub app in dev mode       |
| `bun run validator`     | Start only the validator app in dev mode |
| `bun run poller`        | Start only the poller app in dev mode    |
| `bun run frontend`      | Start only the frontend in dev mode      |
| `bun run frontend:prod` | Build and start frontend in prod         |
| `bun run db:generate`   | Generate Prisma client (db package)      |
| `bun run db:migrate`    | Run DB migrations (db package)           |
| `bun run db:push`       | Push schema to DB (db package)           |
| `bun run db:deploy`     | Deploy DB migrations (db package)        |
| `bun run db:studio`     | Open Prisma Studio (db package)          |

---

## Environment Variables

Each app expects a `.env.local` file in its directory.  
**Common variables:**

- `DATABASE_URL` – PostgreSQL connection string (see `docker-compose.yml`)
- `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_NAME` – for direct DB config
- `NODE_ENV` – `development` or `production`
- `HUB_URL` – (validator) WebSocket URL for hub

**Example (`apps/hub/.env.local`):**

```
DATABASE_URL=postgresql://user:password@localhost:5432/dpin?schema=public
NODE_ENV=development
```

**See each app's `.env.example` or `docker-compose.yml` for details.**

---

## Database

- **Postgres** runs in Docker by default.
- **Prisma** is used for schema and migrations (`packages/db`).
- Use `bun run db:push` or `bun run db:migrate` to sync schema.

---

## Production

- Use Dockerfiles in `docker/production/` for optimized images.
- Adjust environment variables and secrets for production.
- Consider using a managed Postgres instance.

---

## Troubleshooting

- **Ports in use:** Stop other services using 3000, 8081, 5432, or 5050.
- **Database connection errors:** Check `DATABASE_URL` and Postgres container health.
- **Node modules issues in Docker:** Remove `node_modules` volumes and rebuild:
  ```sh
  docker-compose down -v
  docker-compose up --build
  ```
- **Frontend not updating:** If using Docker, ensure volumes are mounted and Next.js cache is cleared.

---

## License

MIT
