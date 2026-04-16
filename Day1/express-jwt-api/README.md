# Express + TypeScript JWT API (Mongo)

Minimal REST API with:
- Express (TypeScript)
- `helmet`, `cors`, `morgan`
- MongoDB (Mongoose)
- Auth: JWT + bcrypt
- Validation: Zod
- Global error handler (400/401/403/500)
- Request ID on every request (`x-request-id`)

## Setup

```bash
npm i
```

Create `.env` in project root (already present in this repo locally). Required keys:

```env
PORT=3000
MONGODB_URI=...
DB_NAME=practice_phase3_auth
JWT_SECRET=change_me
JWT_EXPIRES_IN=1d
```

Run:

```bash
npm run build
npm start
```

Server runs on `http://localhost:3000`.

## Auth

### POST `/auth/register`
Body:

```json
{
  "email": "user@example.com",
  "password": "Password123",
  "name": "User"
}
```

Response:

```json
{ "token": "..." }
```

### POST `/auth/login`
Body:

```json
{
  "email": "user@example.com",
  "password": "Password123"
}
```

Response:

```json
{ "token": "..." }
```

## Private routes (JWT)

Send header in Postman:
- `Authorization: Bearer <token>`

### GET `/me`
Response:

```json
{
  "id": "...",
  "email": "user@example.com",
  "name": "User"
}
```

## Tasks (owner-only)

### POST `/tasks`
Body:

```json
{ "title": "first task" }
```

Response:

```json
{ "id": "...", "title": "first task", "status": "todo" }
```

### GET `/tasks`
Response:

```json
[
  { "id": "...", "title": "first task", "status": "todo" }
]
```

### PATCH `/tasks/:id`
Body (any one field is required):

```json
{ "status": "done" }
```

or

```json
{ "title": "updated title" }
```

Response:

```json
{ "id": "...", "title": "updated title", "status": "done" }
```

### DELETE `/tasks/:id`
Response: `204 No Content`

## Errors + requestId

- Every response includes header: `x-request-id`
- Error JSON includes `requestId`

Common status codes:
- **400**: validation errors, invalid `:id`, duplicate email
- **401**: missing/invalid token, invalid credentials
- **403**: trying to update/delete someone else’s task
- **500**: unexpected server error

## Postman quick test flow

1. `POST /auth/register` → copy `token`
2. Set `Authorization: Bearer <token>` in Postman
3. `GET /me`
4. `POST /tasks`
5. `GET /tasks`
6. `PATCH /tasks/:id`
7. `DELETE /tasks/:id`

