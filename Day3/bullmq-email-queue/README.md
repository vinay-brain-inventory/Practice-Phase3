# Day 3 — BullMQ Email Queue + EventBus

## Setup

```bash
cd Day3/bullmq-email-queue
npm install
docker compose up -d
```

Create `.env` (or use defaults from `.env.example`).

## Run

```bash
npm run dev
```

- UI: `http://localhost:3010/admin/queues`
- Health: `http://localhost:3010/health`

The app enqueues 2 sample jobs on start:
- one successful email
- one failing email to demonstrate retry + DLQ

## Test

```bash
npm test
```

