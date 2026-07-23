This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## Pre-launch waitlist mode

Production currently runs in waitlist mode: only the landing page (`/`) and the sign-up form
(`/waitlist`) are reachable. Everything else — the app, signin, signup, tracks — redirects to
`/waitlist`, and the landing CTAs point there instead of signup.

It's a single environment variable, read by [`src/lib/flags.ts`](src/lib/flags.ts) and enforced
in [`src/proxy.ts`](src/proxy.ts) (Next 16 renamed the `middleware` convention to `proxy`):

```
NEXT_PUBLIC_WAITLIST_MODE=1   # production — landing + waitlist only
NEXT_PUBLIC_WAITLIST_MODE=0   # dev — full app (default when unset)
```

It's inlined at build time, so **changing it requires a rebuild/redeploy**, not just a restart.
To launch, set it to `0` and redeploy — no code changes needed.

Waitlist sign-ups land in the `waitlist_entries` table via `POST /waitlist` on the backend, and
are read in the admin panel under **Wait List** (with CSV export).
