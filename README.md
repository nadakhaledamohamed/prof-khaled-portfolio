# Prof. Khaled Abd El Fatah Mohamed — Academic Portfolio

Bilingual (English / Arabic) portfolio for Prof. Khaled Abd El Fatah Mohamed, Professor of
Information Science at Fayoum University and Knowledge & Digital Solutions Consultant at the
Mohammed Bin Rashid Al Maktoum Knowledge Foundation, with an admin panel for editing every part
of the site.

Built with Next.js 15 (App Router), TypeScript, Tailwind CSS 4, Framer Motion, next-themes and
Lucide icons. Hosted on Vercel with a Neon Postgres database and Vercel Blob for uploads (all on
free plans).

## Getting started

```bash
npm install
vercel env pull .env.local   # copies DATABASE_URL, BLOB_READ_WRITE_TOKEN, … from Vercel
npm run dev
```

Open http://localhost:3000 (English), http://localhost:3000/ar (Arabic) or
http://localhost:3000/admin (admin).

```bash
npm run build   # production build
npm run start   # serve the production build
npm run lint
```

## Admin panel

Go to `/admin` and sign in.

| Page | What it edits |
| --- | --- |
| Dashboard | Overview, latest messages, quick links |
| Profile & stats | Photo, CV, citation metrics, profile links |
| Books | Books with cover, optional PDF or external link, English/Arabic titles |
| Publications | Publication list (the citation dashboard is calculated from it) |
| Gallery | Images and PDFs with English/Arabic titles and captions |
| Collaborators | Co-authors and their affiliations |
| Site text | Every text section, English and Arabic side by side |
| Messages | Contact-form inbox |
| Media library | Uploaded files; unused ones can be deleted |
| Account | Change password |

Saving updates the live site immediately. Forgot the password? Run:

```bash
npm run admin:password -- <username>
```

### Where content is stored

- **Postgres (Neon)**: tables are created on first run: `web_content` (all content as one JSON
  document), `web_media` (uploaded files), `web_messages` (contact messages) and `admin_users`.
  Passwords use the ASP.NET Identity v3 hash format, so accounts from the previous ASP.NET site
  can be copied over unchanged.
- **Uploads**: the browser uploads straight to Vercel Blob (images up to 10 MB, PDFs up to 25 MB).
- **Defaults**: `src/content/en.ts`, `src/content/ar.ts` and `src/data/site.ts` seed the database
  on first run, and are served if the database is unreachable.

### Content imported from the previous site

`npm run import:legacy -- <extracted khaled-website-local folder>` converts the previous site's
export (`data/db.json` and `data/assets/`) into `src/data/legacy.json` and copies every file into
`public/content/`, the Arabic fonts into `src/fonts/` and the share image into `public/`.
It is safe to re-run. The visitor consultation requests in that export are personal data: they are
written to `scripts/legacy-consult-requests.json` (git-ignored) and loaded into the admin inbox
with `npm run import:requests`.

## Pages

| Path | Content |
| --- | --- |
| `/` | Home: profile, impact, career, research areas, books, publications, articles, talks, videos, library, awards, gallery, contact |
| `/cv` | Full CV with a section index |
| `/publications`, `/publications/[id]` | Research & studies with filters and search |
| `/books`, `/books/[id]`, `/books/[id]/read` | Books, full-PDF reader with contents, full-text e-book reader |
| `/articles`, `/articles/[id]` | Articles with full text and figures |
| `/talks` | Courses and talks with their slide decks |
| `/videos` | Videos (YouTube plays on the page) |
| `/systems` | Comparative review of library systems and the evaluation report |
| `/open-library` | Open repositories by group |
| `/gallery` | Photo gallery with a lightbox |
| `/consult` | Consultation request form |

Every page exists in Arabic under `/ar/…`.

## Languages and routing

- `/` serves English and `/ar` serves Arabic (right-to-left, Arabic typefaces).
- `src/middleware.ts` maps the routes, remembers the visitor's last language in a cookie, and
  protects `/admin`.

## Environment variables

| Variable | Purpose |
| --- | --- |
| `NEXT_PUBLIC_SITE_URL` | Public URL, used for canonical links, sitemap and Open Graph |
| `DATABASE_URL` | Postgres connection string (set by the Vercel Neon integration) |
| `BLOB_READ_WRITE_TOKEN` | Vercel Blob token (set when a Blob store is connected) |
| `ADMIN_SESSION_SECRET` | 32+ random characters; signs admin sessions |
| `RESEND_API_KEY` | Optional [Resend](https://resend.com) key to also email contact messages |
| `CONTACT_TO_EMAIL` | Inbox that receives those emails |
| `CONTACT_FROM_EMAIL` | Optional verified sender address |

Contact messages are always saved to the admin inbox; email is an extra.

## Project structure

```
src/
  app/[locale]/        pages, layout, 404 (per language)
  app/admin/           admin panel (login, editors, server actions)
  app/api/admin/       upload tokens for Vercel Blob
  app/api/contact/     contact form endpoint
  app/api/og/          social share image
  server/              database, auth, content, media and messages (server-only)
  components/admin/    admin UI and editors
  components/sections/ page sections
  components/layout/   navbar, footer, section shell, toggles
  components/motion/   reveal, counter, parallax, magnetic helpers
  components/effects/  loader, cursor, background, scroll progress
  components/ui/       button, badge, inputs, spotlight card
  content/             en / ar dictionaries
  data/                language-independent data
```

## Deploying

Every push to `main` deploys to production on Vercel. The project needs a Neon database and a
Blob store connected (Vercel → Project → Storage) and `ADMIN_SESSION_SECRET` set.
