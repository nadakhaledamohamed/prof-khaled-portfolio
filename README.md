# Prof. Khaled Abd El Fatah Mohamed — Academic Portfolio

Bilingual (English / Arabic) portfolio for Prof. Khaled Abd El Fatah Mohamed, Professor of
Information Science at Fayoum University and Knowledge & Digital Solutions Consultant at the
Mohammed Bin Rashid Al Maktoum Knowledge Foundation.

Built with Next.js 15 (App Router), TypeScript, Tailwind CSS 4, Framer Motion, next-themes and
Lucide icons.

## Getting started

```bash
npm install
npm run dev
```

Open http://localhost:3000 (English) or http://localhost:3000/ar (Arabic).

```bash
npm run build   # production build
npm run start   # serve the production build
npm run lint
```

## Admin panel

Go to `/admin` and sign in with an account from the `AdminUsers` table (the same accounts and
password format as the previous ASP.NET site).

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

- **SQL Server (`PortfolioDb`)**: the app creates three tables on first run: `WebContent` (all
  content as one JSON document), `WebMedia` (uploaded files) and `WebMessages` (contact
  messages). The original tables are only read (`AdminUsers`), never changed in structure.
- **Uploads**: files go to `MEDIA_DIR` (default `./storage/media`) and are served from `/media/…`.
  Back this folder up together with the database.
- **Defaults**: `src/content/en.ts`, `src/content/ar.ts` and `src/data/site.ts` seed the database
  on first run, and are served if the database is unreachable.

The SQL Server driver is `msnodesqlv8` (ODBC), so it needs the *ODBC Driver 17 or 18 for SQL
Server* on the machine and works with Windows authentication. The site must run on a server with
a persistent disk (not a serverless platform).

## Languages and routing

- `/` serves English and `/ar` serves Arabic (right-to-left, Arabic typefaces).
- `src/middleware.ts` maps the routes and remembers the visitor's last language in a cookie.

## Environment variables

Copy `.env.example` to `.env.local` and fill in:

| Variable | Purpose |
| --- | --- |
| `NEXT_PUBLIC_SITE_URL` | Public URL, used for canonical links, sitemap and Open Graph |
| `MSSQL_CONNECTION_STRING` | ODBC connection string for `PortfolioDb` |
| `ADMIN_SESSION_SECRET` | 32+ random characters; signs admin sessions (required in production) |
| `MEDIA_DIR` | Optional upload folder (default `./storage/media`) |
| `RESEND_API_KEY` | Optional [Resend](https://resend.com) key to also email contact messages |
| `CONTACT_TO_EMAIL` | Inbox that receives those emails |
| `CONTACT_FROM_EMAIL` | Optional verified sender address |

Contact messages are always saved to the admin inbox; email is an extra.

## Project structure

```
src/
  app/[locale]/        pages, layout, 404 (per language)
  app/admin/           admin panel (login, editors, server actions)
  app/media/           serves uploaded files
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

Run it on a Windows or Linux server with Node.js 20+, the ODBC driver and access to the database:

```bash
npm ci
npm run build
npm run start   # port 3000; put IIS, nginx or similar in front for HTTPS
```

Keep `MEDIA_DIR` on a persistent disk and include it in backups.
