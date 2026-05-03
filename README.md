# Customer Care Ticketing System

A full-stack ticketing system designed for efficient customer support management. This project features a robust backend API built with Fastify, PostgreSQL, and Redis, and a modern frontend client built with Angular.

## Project Structure

- `server/`: Node.js backend API, workers, and socket server.
- `client/`: Angular frontend application.

## Getting Started

The easiest way to get the entire system up and running is using Docker Compose.

### Quick Start with Docker

1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   cd customer-care-ticketing
   ```

2. **Start the system:**
   ```bash
   docker compose up
   ```
   This command will:
   - Start the PostgreSQL database and Redis.
   - Run database migrations and seed sample data.
   - Start the API server (`http://localhost:8000`).
   - Start the Worker service (for background jobs like bulk replies).
   - Start the Socket server (`http://localhost:8080`).
   - Start the Angular frontend (`http://localhost:4200`).

3. **Access the Application:**
   Open your browser and navigate to `http://localhost:4200`.

---

### Local Development (Alternative)

If you prefer to run the components manually for development:

#### 1. Prerequisites
- Node.js (version 22 or later)
- Docker (for database and Redis)

#### 2. Infrastructure Setup
Start the database and Redis:
```bash
docker compose up -d db redis
```

#### 3. Backend Setup (`server/`)
1. **Install Dependencies:**
   ```bash
   cd server
   npm install
   ```
2. **Environment Variables:**
   Create a `.env` file in `server/`:
   ```env
   PGHOST=localhost
   PGPORT=5432
   PGUSER=api
   PGPASSWORD=apiPassword
   PGDATABASE=api
   REDIS_HOST=localhost
   REDIS_PORT=6379
   ```
3. **Migrate and Seed:**
   ```bash
   npm run migrate:up
   npm run seed
   ```
4. **Start the services:**
   - **API:** `npm run serve` (Available at `http://localhost:8000`)
   - **Worker:** `npx ts-node src/workers/index.ts`
   - **Socket:** `npx ts-node src/sockets/index.ts` (Available at `http://localhost:8080`)

#### 4. Frontend Setup (`client/`)
1. **Install Dependencies:**
   ```bash
   cd client
   npm install
   ```
2. **Run the Application:**
   ```bash
   npm start
   ```
   Accessible at `http://localhost:4200`.

## Features

- **Ticketing Management:** Create, view, and resolve customer support tickets.
- **Messaging System:** Real-time conversation flow between customers and operators.
- **Bulk Replies:** Process multiple ticket responses in the background using BullMQ.
- **Real-time Notifications:** Live job progress updates via WebSockets.
- **Database Seeding:** Quick setup with realistic sample data.

## Key Technologies

- **Backend:** Node.js, Fastify, PostgreSQL, Redis, BullMQ, pgtyped, node-pg-migrate.
- **Frontend:** Angular, TypeScript, Socket.io-client.
- **Infrastructure:** Docker & Docker Compose.

