# Implementation Plan — My Wall React App

## 1. Project Overview

Build a nostalgic 2008–2009 Facebook-style profile wall using **Next.js 15, React 19, TypeScript, Tailwind CSS, and Supabase**.

Visitors can write a short public message, submit it, and see it appear at the top of the wall. Posts are stored in Supabase and remain available after refresh. The feed should also update automatically when another visitor publishes a post.

### Primary goal

Meet all three required acceptance criteria:

1. A visitor can enter a message and click **Share**.
2. The message is persisted in the Supabase `posts` table.
3. The wall displays posts newest first and retains them after a page refresh.

### Optional enhancements

- Enforce a 280-character message limit.
- Subscribe to Supabase Realtime for automatic feed updates.
- Add photo uploads through Supabase Storage, only after the core wall works.

Realtime is included in the planned implementation because it is explicitly described in the challenge. Photo upload is treated as a stretch goal so it cannot delay the required functionality.

---

## 2. Technology Stack

| Area             | Technology                                                     |
| ---------------- | -------------------------------------------------------------- |
| Framework        | Next.js 15 (App Router)                                        |
| UI               | React 19 + TypeScript                                          |
| Styling          | Tailwind CSS                                                   |
| Components       | shadcn/ui where useful; avoid unnecessary component complexity |
| Backend/database | Supabase PostgreSQL                                            |
| Live updates     | Supabase Realtime                                              |
| Hosting          | Vercel                                                         |
| Source control   | Public GitHub repository                                       |

Use the current stable compatible package versions when creating the project. Keep the application small and easy to review.

---

## 3. User Experience and Visual Direction

Recreate the feel of an old Facebook profile wall rather than a modern social-media dashboard.

### Layout

- Center the application in a fixed-width or max-width profile layout.
- Use a light blue/gray page background and a white content surface.
- Include a simple profile header with a placeholder profile photo, display name, and short profile details.
- Add a **Wall** section beneath the profile header.
- Place the message composer above the feed.
- Display each post as a distinct wall entry, with the author's name, message, and readable timestamp.
- Keep the layout responsive on mobile.

### Composer

- Multiline text area for the message.
- Character counter showing `0 / 280`.
- Disable Share when the message is empty, whitespace-only, or currently submitting.
- Place the **Share** button immediately below the text area.
- Show a clear loading state while saving.
- Show a friendly error message if the insert fails.
- Clear the text area only after a successful insert.

### Feed

- Show the newest posts first.
- Fetch the latest 50 posts on initial page load.
- Show a loading state while fetching.
- Show a helpful empty state when there are no posts.
- Format timestamps in a readable local date/time format.
- Keep long messages readable and prevent them from overflowing the layout.

### Fixed author name

No authentication is required. Use one clearly defined fixed display name for posts (for example, `Ryan Kim`) and keep it separate from the message body. The author name is presentation data, not proof of a verified identity.

---

## 4. Proposed Project Structure

```text
my-wall/
├── public/
│   └── images/
│       └── profile-placeholder.png
├── src/
│   ├── app/
│   │   ├── globals.css
│   │   ├── layout.tsx
│   │   └── page.tsx
│   ├── components/
│   │   ├── wall/
│   │   │   ├── ProfileHeader.tsx
│   │   │   ├── WallComposer.tsx
│   │   │   ├── WallFeed.tsx
│   │   │   └── WallPost.tsx
│   │   └── ui/
│   ├── lib/
│   │   └── supabase/
│   │       ├── client.ts
│   │       └── posts.ts
│   └── types/
│       └── post.ts
├── .env.local.example
├── .gitignore
├── README.md
└── package.json
```

Keep components focused:

- `ProfileHeader`: profile presentation only.
- `WallComposer`: message input, character count, validation, and submit interaction.
- `WallFeed`: initial loading, feed state, and Realtime subscription.
- `WallPost`: renders one post.
- `posts.ts`: contains database operations so Supabase queries are not scattered across UI components.
- `client.ts`: creates the browser Supabase client.

The exact structure may be simplified if the generated Next.js project uses a different source directory convention.

---

## 5. Supabase Database Design

Create a Supabase project, then run the following SQL in the Supabase SQL Editor.

```sql
create table public.posts (
  id bigint generated by default as identity primary key,
  user_name text not null default 'Ryan Kim',
  message text not null,
  created_at timestamptz not null default now(),

  constraint posts_message_length
    check (char_length(message) between 1 and 280),

  constraint posts_message_not_blank
    check (length(trim(message)) > 0)
);

alter table public.posts enable row level security;

create policy "Anyone can read wall posts"
on public.posts
for select
to anon, authenticated
using (true);

create policy "Anyone can publish wall posts"
on public.posts
for insert
to anon, authenticated
with check (
  user_name = 'Ryan Kim'
  and char_length(message) between 1 and 280
  and length(trim(message)) > 0
);

grant select, insert on public.posts to anon, authenticated;
grant usage, select on sequence public.posts_id_seq to anon, authenticated;
```

If the identity sequence has a different generated name in the Supabase database, inspect the table's sequence and grant access to that sequence instead.

### Database notes

- `id`: unique post identifier.
- `user_name`: fixed display name, separate from the message.
- `message`: message text, limited to 280 characters.
- `created_at`: timestamp generated by PostgreSQL.

The database constraint is important: client-side validation improves the experience, but database validation protects the stored data even if a visitor bypasses the UI.

### Security considerations

- Use the Supabase **publishable/anon key** in the browser. It is designed for client-side use when Row Level Security is correctly configured.
- Never expose the Supabase `service_role` key in frontend code or a `NEXT_PUBLIC_` environment variable.
- RLS must remain enabled.
- The public insert policy means anyone can publish messages. This is intentional for the no-login challenge, but it is not abuse-resistant. A production version should add rate limiting, moderation, spam controls, and stronger author identity.
- A fixed author name is not authentication. Do not represent it as verified identity.

### Enable Realtime

In the Supabase dashboard, enable Realtime for the `posts` table. If using SQL publication management, ensure `posts` is included in the `supabase_realtime` publication. Verify this in the dashboard before testing live updates.

---

## 6. Environment Configuration

Create `.env.local` in the project root:

```env
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT_ID.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=YOUR_SUPABASE_PUBLISHABLE_OR_ANON_KEY
```

Create `.env.local.example` with placeholder values and commit that example file, not the real `.env.local`.

Ensure `.env.local` is ignored by Git. Add the same two environment variables to the Vercel project's Production environment (and Preview/Development if needed).

Do not add a service-role key.

---

## 7. Implementation Steps

### Phase 1 — Initialize the Next.js project

1. Create a Next.js project with TypeScript and the App Router.
2. Configure Tailwind CSS.
3. Add the Supabase JavaScript client package.
4. Add shadcn/ui only for components that genuinely help; native form elements are acceptable.
5. Create the initial page and responsive profile-wall layout.
6. Confirm the project runs locally.

**Checkpoint:** The page renders with the profile header, composer, and placeholder feed.

### Phase 2 — Configure Supabase

1. Create a Supabase project.
2. Run the SQL schema and RLS policies above.
3. Confirm the `posts` table exists.
4. Enable Realtime for `posts`.
5. Copy the project URL and publishable/anon key.
6. Add them to `.env.local`.
7. Create the Supabase browser client in `src/lib/supabase/client.ts`.

**Checkpoint:** The app can initialize a Supabase client without exposing privileged credentials.

### Phase 3 — Implement post data operations

Implement typed functions in `src/lib/supabase/posts.ts`:

- `getLatestPosts(limit = 50)`: select the required post fields, order by `created_at` descending, and limit the result.
- `createPost(message)`: trim and validate the message, then insert the fixed author name and message. Return the inserted row.
- Handle Supabase errors explicitly and return useful error information to the UI.

Use a shared `Post` TypeScript type:

```ts
export type Post = {
  id: number;
  user_name: string;
  message: string;
  created_at: string;
};
```

**Checkpoint:** A test post can be inserted and retrieved from Supabase.

### Phase 4 — Build the composer

1. Store the message in React state.
2. Display the current character count out of 280.
3. Trim the message before submission.
4. Reject empty or whitespace-only messages.
5. Prevent submission when the message exceeds 280 characters.
6. Set a submitting state to prevent duplicate clicks.
7. Call `createPost`.
8. On success, clear the input and add the returned post to the feed (or let the Realtime event add it, while avoiding duplicates).
9. On failure, preserve the user's message and show an error.

**Checkpoint:** Clicking Share saves a valid message and gives clear feedback.

### Phase 5 — Build the feed

1. Fetch the latest 50 posts when the wall loads.
2. Display a loading state until the request completes.
3. Render an empty state if no posts exist.
4. Render each item with author, message, and timestamp.
5. Keep the feed sorted newest first.
6. Handle fetch errors without crashing the page.

**Checkpoint:** Refreshing the browser still shows previously published posts, with the newest at the top.

### Phase 6 — Add Supabase Realtime

1. Subscribe to `INSERT` events on `public.posts`.
2. When a new post arrives, add it to the feed.
3. Prevent duplicate entries when the submitting browser receives both the insert response and the Realtime event.
4. Keep the list sorted newest first and capped at 50 items.
5. Unsubscribe when the component unmounts.
6. Display a graceful fallback if the Realtime connection fails; posting and manual refresh should still work.

**Checkpoint:** Open the deployed wall in two browser tabs. Publish from one tab and confirm the other tab receives the post without refreshing.

### Phase 7 — Polish and responsive testing

- Match the nostalgic wall design.
- Check desktop and mobile layouts.
- Verify keyboard access and visible focus states.
- Ensure the Share button has disabled, loading, and error states.
- Check that timestamps and long messages render correctly.
- Remove placeholder posts before final submission unless clearly marked as sample content.

**Checkpoint:** The application is presentable and all required interactions work.

---

## 8. Error Handling

Handle these cases explicitly:

| Scenario                 | Expected behavior                                                          |
| ------------------------ | -------------------------------------------------------------------------- |
| Empty message            | Do not submit; show validation feedback                                    |
| Whitespace-only message  | Do not submit                                                              |
| More than 280 characters | Prevent submission and show the limit                                      |
| Supabase insert fails    | Show an error and preserve the typed message                               |
| Initial feed fetch fails | Show a retry-friendly error state                                          |
| No posts exist           | Show an empty state                                                        |
| Realtime disconnects     | Keep the existing feed usable; initial fetch and manual refresh still work |
| Double-click Share       | Prevent duplicate submissions while the request is in progress             |

Do not show raw database errors or secret configuration values to visitors.

---

## 9. Testing and Acceptance Criteria

### Required functional tests

- [ ] Wall page loads successfully.
- [ ] Visitor can type a message.
- [ ] Visitor can publish using Share.
- [ ] Empty and whitespace-only messages are rejected.
- [ ] Messages over 280 characters are rejected.
- [ ] Successful posts are saved in Supabase.
- [ ] Each post displays the author name separately from the message.
- [ ] Newest posts appear first.
- [ ] Latest 50 posts load on page refresh.
- [ ] Existing posts remain after refresh.
- [ ] Public visitor can read posts without signing in.
- [ ] Public visitor can publish without signing in.
- [ ] No service-role key is present in browser code or the deployed environment.

### Realtime tests

- [ ] Realtime is enabled for `posts`.
- [ ] A post created in one tab appears in another tab without a refresh.
- [ ] The same post is not displayed twice.
- [ ] Subscription is cleaned up when the feed unmounts.

### Deployment tests

- [ ] Production build completes successfully.
- [ ] Vercel Production environment variables are configured.
- [ ] Public Vercel URL loads without authentication.
- [ ] A post can be published on the production site.
- [ ] The post appears in the Supabase table.
- [ ] The post remains after refreshing the production site.

---

## 10. Deployment Plan — GitHub and Vercel

1. Create a public GitHub repository for the project.
2. Commit the source code and `.env.local.example`.
3. Confirm `.env.local` is not tracked or committed.
4. Push the project to GitHub.
5. Import the repository into Vercel.
6. Add:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
7. Deploy to Vercel.
8. Open the production URL and test the full posting flow.
9. Check the Vercel deployment logs if the build or runtime fails.
10. Make a final commit and redeploy after any fixes.

Use the public production URL for the application submission, not a temporary preview deployment URL.

---

## 11. Optional Enhancement — Photo Upload

Do this only after the required wall functionality and deployment are complete.

If implemented:

1. Create a Supabase Storage bucket named `wall-photos`.
2. Decide whether the bucket should be public (simpler for this public wall) or private with signed URLs.
3. Add Storage policies that permit only the intended upload and read operations.
4. Validate file type and file size in the UI and enforce appropriate server/storage restrictions where available.
5. Upload the image and store its resulting path or URL with the post.
6. Update the database schema and feed UI to display images.
7. Test upload failures and invalid files.

Do not assume that creating a bucket alone makes uploads work; Storage policies must also permit the required operations. Do not let optional photo upload block the core submission.

---

## 12. Submission Checklist

Submit through **https://apply.capm.us** and select **`2) Wall`** under the test selection.

Prepare:

- [ ] Public Vercel production URL.
- [ ] Public GitHub repository URL.
- [ ] Screenshot of the wall before posting (if useful).
- [ ] Screenshot showing at least one successfully published post.
- [ ] Optional public/unlisted demo video showing the posting flow and persistence after refresh.
- [ ] Optional reviewer note explaining the stack and any additional functionality.

### Suggested reviewer note

> Built with Next.js, React, TypeScript, Tailwind CSS, and Supabase. Visitors can publish messages without logging in. Posts are stored in Supabase, displayed newest first, and updated in real time through Supabase Realtime.

---

## 13. Definition of Done

The challenge is complete when a reviewer can open the public Vercel URL, type a message, click Share, see the new message at the top of the wall, refresh the page, and still see that message. The corresponding row must be present in Supabase.

Realtime and photo upload improve the submission, but reliable persistence, correct ordering, a polished interface, and a working public deployment take priority.
