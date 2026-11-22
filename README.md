# My Wall

A nostalgic 2008-style public profile wall built with Next.js, React, TypeScript, Tailwind CSS, and Supabase.

## Setup

1. Copy `.env.local.example` to `.env.local`.
2. Add the Supabase project URL and publishable key.
3. Run the SQL in `supabase/schema.sql` in the Supabase SQL editor.
4. Enable Realtime for the `public.posts` table in Supabase.
5. Start the app:

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## Supabase

The app reads the latest 50 posts, inserts public wall messages, and subscribes to new `posts` inserts. Optional post photos are uploaded to the public `wall-photos` Storage bucket, and their URLs are saved in `posts.photo_url`. Run `supabase/schema.sql` to add the column, bucket, and access policies. The browser client accepts `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` and also supports `NEXT_PUBLIC_SUPABASE_ANON_KEY`.

Post photo uploads accept JPEG, PNG, and WebP files up to 5 MB. The wall is public and has no authentication, so anyone can publish posts and photos.

## Scripts

- `npm run dev` - start the development server
- `npm run build` - create a production build
- `npm run lint` - run ESLint
