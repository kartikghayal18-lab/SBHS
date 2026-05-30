# SBHS Portal Backend Setup

This project still works without any backend. When you are ready, add your own Supabase and Cloudinary values to `.env.local` or to Vercel environment variables.

## 1. Database

Use Supabase SQL editor and run:

```sql
-- docs/database.sql
```

Paste the full contents of `docs/database.sql`.

This creates one shared `erp_state` record. Admin, teacher, and student panels read and write the same JSON payload, so updates stay connected across panels after `VITE_USE_REMOTE_ERP=true`.

## 2. Environment

Create `.env.local` from `.env.example`.

```env
VITE_USE_REMOTE_ERP=true
VITE_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
VITE_SUPABASE_ANON_KEY=YOUR_SUPABASE_ANON_KEY
VITE_ERP_STATE_ID=sbhs-main
VITE_CLOUDINARY_CLOUD_NAME=YOUR_CLOUD_NAME
VITE_CLOUDINARY_UPLOAD_PRESET=YOUR_UNSIGNED_UPLOAD_PRESET
```

For Vercel, add the same variables in Project Settings -> Environment Variables.

## 3. Cloudinary

Create an unsigned upload preset in Cloudinary:

- Signing Mode: `Unsigned`
- Folder: optional, the app sends `sbhs-portal/homework` and `sbhs-portal/resources`
- Allowed formats: `pdf,jpg,jpeg,png,webp`

The teacher panel saves:

- `attachmentName`
- `attachmentUrl`
- `attachmentPublicId`

## 4. Sync Behavior

Current fallback:

- If env values are empty or `VITE_USE_REMOTE_ERP=false`, data stays in browser storage.

After enabling remote:

- Admin changes save to Supabase.
- Teacher attendance/homework/resource changes save to Supabase.
- Student dashboard hydrates from Supabase and shows latest records.
- Same-browser tabs update instantly through local storage events.

## 5. Build

```bash
npm run build
```

Deploy the generated Vite app normally on Vercel.
