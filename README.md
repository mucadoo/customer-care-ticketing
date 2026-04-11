# Customer Care Ticketing System

A full-stack ticketing system designed for efficient customer support management. This project features a robust backend API built with Fastify and PostgreSQL, and a modern frontend client.

## Project Structure

- `server/`: Node.js backend API.
- `client/`: Angular frontend application.

## Getting Started

### Prerequisites

- Node.js (version 22 or later)
- Docker and Docker Compose (for database management)
- PostgreSQL (if not using Docker)

### Backend Setup (`server/`)

1. **Install Dependencies:**
   ```bash
   cd server
   npm install
   ```

2. **Environment Variables:**
   Create a `.env` file in the `server` directory and configure your PostgreSQL connection:
   ```env
   PGHOST=localhost
   PGPORT=5432
   PGUSER=api
   PGPASSWORD=apiPassword
   PGDATABASE=api
   ```

3. **Start the Database:**
   Use Docker Compose to spin up a PostgreSQL instance:
   ```bash
   docker compose up -d db
   ```

4. **Run Migrations:**
   Apply database schema changes:
   ```bash
   npm run migrate:up
   ```

5. **Seed Data (Optional):**
   Populate the database with sample ticketing data:
   ```bash
   npm run seed
   ```

6. **Run the Server:**
   Start the API in development mode:
   ```bash
   npm run serve
   ```
   The server will be available at `http://localhost:8000`.

### Frontend Setup (`client/`)

1. **Install Dependencies:**
   ```bash
   cd client
   npm install
   ```

2. **Run the Application:**
   Start the Angular development server:
   ```bash
   npm start
   ```
   The application will be accessible at `http://localhost:4200`.

## Features

- **Ticketing Management:** Create, view, and resolve customer support tickets.
- **Messaging System:** Real-time (simulated) conversation flow between customers and operators.
- **Database Seeding:** Quick setup with realistic sample data for testing and development.
- **Modern Tech Stack:** Built with Fastify, Angular, and PostgreSQL for high performance.

## Key Technologies

- **Backend:** Node.js, Fastify, PostgreSQL, pgtyped, node-pg-migrate.
- **Frontend:** Angular, TypeScript.
- **Infrastructure:** Docker.

## License

This project is licensed under the UNLICENSED license.
