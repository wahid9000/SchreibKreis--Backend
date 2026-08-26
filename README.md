# Schreibkreis API

A production-minded blog backend built with TypeScript and Express. The project focuses on clean API design and logic, reliable error handling, secure authentication, and automation-ready workflows.

## Highlights

- Modular REST APIs for posts, comments, analytics, authentication, and email digests
- Centralized error handling for validation, database, missing-route, and malformed-JSON errors
- Consistent JSON response shapes with useful HTTP status codes
- Redis-backed rate limiting for authentication, public requests, and write operations
- PostgreSQL persistence through Prisma ORM
- Weekly email digest that selects the most-viewed published posts
- Protected internal digest endpoint designed to be triggered by an n8n workflow
- Zod request validation and Better Auth integration

## Tech Stack

TypeScript, Express 5, Prisma 7, PostgreSQL, Redis, Better Auth, Zod, Nodemailer, and n8n.

## Getting Started

```bash
pnpm install
pnpm prisma generate
pnpm dev
```

Create a `.env` file with the database, Redis, authentication, mail, application URL, and `INTERNAL_API_KEY` values required by your environment. The API runs locally with the development server, and production builds are available through `pnpm build` followed by `pnpm start`.

## API Surface

```text
/api/auth
/api/posts
/api/comments
/api/analytics
/api/emailDigest
```

This project demonstrates backend engineering practices that scale beyond a basic CRUD application: clear module boundaries, defensive input handling, operational safeguards, and integrations that connect the API to real-world automation.
