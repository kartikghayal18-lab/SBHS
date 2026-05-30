# SBHS ERP Portal

Run locally:

```bash
npm install
npm start -- --host 127.0.0.1 --port 8014
```

Build for deployment:

```bash
npm run build
```

Backend setup:

- Copy `.env.example` to `.env.local`.
- Keep `VITE_USE_REMOTE_ERP=false` while developing without a backend.
- When ready, create the Supabase table from `docs/database.sql`.
- Add your Supabase and Cloudinary values to `.env.local` or Vercel environment variables.
- Set `VITE_USE_REMOTE_ERP=true` after your database is ready.

Detailed setup is in `docs/backend-setup.md`.
