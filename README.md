# Backlify

> **Enterprise-grade database backup and restore solution** — Automated PostgreSQL backups with a modern, scalable architecture.

[![Node.js](https://img.shields.io/badge/Node.js-v20-green)](https://nodejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.3+-blue)](https://www.typescriptlang.org/)
[![License](https://img.shields.io/badge/license-ISC-blue.svg)](LICENSE)

## Overview

Backlify is a comprehensive database backup and restore platform built for SaaS applications. It provides reliable, automated PostgreSQL backup management with a separation of concerns between API, job processing, and data layers.

### Key Features

- 🔄 **Automated Backups** — Schedule and manage PostgreSQL database backups seamlessly
- ♻️ **Restore Operations** — Restore databases to any previous backup state
- 📦 **Scalable Architecture** — Async job processing with Redis queues
- 🛡️ **Type-Safe** — End-to-end TypeScript for reliability
- 📊 **Status Tracking** — Real-time monitoring of backup and restore jobs
- 🔌 **Modular Design** — Shared packages for database schemas, constants, and utilities

---

## 📋 Project Structure

```
backlify/
├── app/
│   ├── api/              # Next.js API endpoints
│   └── worker/           # Async job processor (pg_dump, pg_restore)
├── package/
│   ├── db/               # Database layer (Drizzle ORM, migrations)
│   └── shared/           # Shared types, constants, utilities
└── README.md             # This file
```

### Architecture Overview

```
┌─────────────────────┐
│   Next.js API       │
│   (app/api)         │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│   Redis Queue       │
│   (Job Queue)       │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│   Worker Process    │
│   (app/worker)      │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│  pg_dump/pg_restore │
│  PostgreSQL         │
└─────────────────────┘
```

---

## 🚀 Quick Start

### Prerequisites

- Node.js 20+
- PostgreSQL 12+
- Redis (for job queuing)
- npm or yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/backlify.git
cd backlify

# Install dependencies for all workspaces
npm install

# Set up environment variables
cp .env.example .env.local
```

### Environment Setup

Create a `.env.local` file in the root directory:

```env
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/backlify

# Redis
REDIS_URL=redis://localhost:6379

# API
NEXT_PUBLIC_API_URL=http://localhost:3000
```

### Development

```bash
# Run all services in development mode
npm run dev

# Or run services individually:
# API
npm --prefix app/api run dev

# Worker
npm --prefix app/worker run dev

# Database studio
npm --prefix package/db run drizzle-studio
```

### Production Build

```bash
# Build all packages
npm run build

# Start worker
npm --prefix app/worker start

# Start API
npm --prefix app/api start
```

---

## 📦 Workspace Packages

### `app/api` — REST API Server

The main API layer built with Next.js. Handles:
- Backup job creation and management
- Restore job scheduling
- Job status queries
- Backup history retrieval

**Key Endpoints:**
- `POST /api/backups` — Create a new backup job
- `GET /api/backups` — List all backups
- `POST /api/restores` — Create a restore job
- `GET /api/jobs/:id` — Get job status

### `app/worker` — Async Job Processor

Background job processor powered by BullMQ. Handles:
- PostgreSQL backup execution (`pg_dump`)
- PostgreSQL restore execution (`pg_restore`)
- Job retry logic
- Backup file management
- Status updates

**See [app/worker/README.md](app/worker/README.md) for detailed documentation.**

```bash
npm --prefix app/worker run dev
```

### `package/db` — Database Layer

Drizzle ORM configuration with PostgreSQL schema definitions.

**Contents:**
- Database client initialization
- Schema definitions (backup jobs, restore jobs, backup files)
- Drizzle migrations

**Commands:**
```bash
# Generate migrations
npm --prefix package/db run drizzle-generate

# Apply migrations
npm --prefix package/db run drizzle-push

# Open Drizzle Studio
npm --prefix package/db run drizzle-studio

# Drop all tables
npm --prefix package/db run drizzle-drop
```

**Schema:**
- `backup_jobs` — Stores backup job records
- `backup_files` — Stores backup file metadata
- `restore_jobs` — Stores restore job records

### `package/shared` — Shared Constants & Types

Common utilities and constants used across the application.

**Contents:**
- `BackupJobStatus` — Job status enum and types
- Shared validation schemas
- Common utilities

---

## 🔧 Configuration

### Database Migrations

Migrations are version-controlled and applied automatically:

```bash
npm --prefix package/db run drizzle-push
```

Check `package/db/migration/` for SQL migration files.

### Redis Configuration

BullMQ uses Redis for job queuing. Configure via `REDIS_URL` environment variable:

```env
REDIS_URL=redis://:password@host:port/db
```

---

## 📊 Job Status Lifecycle

```
pending
  ↓
processing
  ├→ success
  │   └→ completed
  └→ failed
      └→ retry_pending → processing
```

---

## 🧪 Testing

```bash
# Run tests for worker
npm --prefix app/worker run test

# Run tests for API
npm --prefix app/api run test
```

---

## 📝 Development Guidelines

### TypeScript

All code is written in TypeScript. Build before deployment:

```bash
npm --prefix app/worker run build
```

### Linting

```bash
npm --prefix app/worker run lint
```

### Local Development

Each package can be developed independently:

```bash
# Worker development with auto-reload
npm --prefix app/worker run dev

# Database schema development
npm --prefix package/db run drizzle-studio
```

---

## 🚢 Deployment

### Scaling the Worker

The worker is designed to run in multiple instances for horizontal scaling:

```bash
# Run multiple worker instances
npm --prefix app/worker start &
npm --prefix app/worker start &
npm --prefix app/worker start &
```

All instances connect to the same Redis queue and coordinate job processing.

### Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `DATABASE_URL` | ✅ | PostgreSQL connection string |
| `REDIS_URL` | ✅ | Redis connection URL |
| `NODE_ENV` | ❌ | Environment (development, production) |
| `LOG_LEVEL` | ❌ | Logger level (debug, info, warn, error) |

---

## 📚 Additional Resources

- [Worker Documentation](app/worker/README.md)
- [Database Migrations](package/db/migration/)
- [Shared Constants](package/shared/constants/)

---

## 🤝 Contributing

1. Create a feature branch
2. Make your changes
3. Run tests and linting
4. Submit a pull request

---

## 📄 License

ISC

---

## 📧 Support

For issues, questions, or feature requests, please [open an issue](https://github.com/yourusername/backlify/issues).
