# Handcraft Frontend

React + Vite frontend for the Handcraft marketplace.

## Backend connection

The frontend is set up to talk to the Spring backend in two ways:

- Development: requests to `/api/*` are proxied by Vite to `http://localhost:8080`
- Production: set `VITE_API_URL` to the deployed backend URL

Copy `.env.example` to `.env` if you want to override the default backend target locally.

## Local run

1. Start the Spring backend from `../handcraft_backend` on port `8080`
2. Install frontend dependencies:

```bash
npm install
```

3. Start the frontend:

```bash
npm run dev
```

## Current live integrations

- Login and registration use the backend `/user` endpoints
- Home and products pages load products from `/Product/all`
- Artisan dashboard creates, updates, deletes, and lists products from the backend
- Admin dashboard now reads product listings from the backend
