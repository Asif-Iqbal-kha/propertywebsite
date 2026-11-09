# Prem Housing — Site Office Website (MERN)

Property website for **Prem Housing Site Office, Mardan** (+92 342 9423521), built with
**MongoDB · Express · React · Node.js**.

## Quick start (development)

```bash
npm install          # first time only (also downloads a portable MongoDB 7)
npm run seed         # creates site content + the admin account (see server/.env)
npm run dev          # starts database + API + website
```

- Website: http://localhost:5173
- Admin panel: http://localhost:5173/admin (email/password from `server/.env`)

`npm run dev` starts a **portable MongoDB** automatically (data kept in `server/.dev-db`).
If a working MongoDB is already running on port 27017, it uses that instead.

> **Note:** the MongoDB 8.3 installed on this PC cannot start on this Windows 10 build
> (Windows error `0xC0000139`, a missing system function). That is why the Windows
> "MongoDB" service shows as *Stopped*. Use the portable database above, install
> MongoDB **7.0** instead, or use a free MongoDB Atlas cluster (set `MONGODB_URI`).

### Preview with sample listings

```bash
npm run seed:samples     # adds 6 listings marked "Sample listing" on the website
npm run remove:samples   # removes them (also possible from the Admin dashboard)
```

## Production

```bash
npm run build            # builds the React app into client/dist
NODE_ENV=production npm start
```

The Express server then serves the website, API and uploaded photos from one port.
Set these in `server/.env` (see `server/.env.example`): `MONGODB_URI`, `JWT_SECRET`,
`SITE_URL` (your real domain, used for SEO and WhatsApp link previews) and
`TRUST_PROXY=true` behind Nginx or a hosting proxy.

## What's included

**Public website**: home (animated hero, search, featured listings, plot sizes, Mardan facts,
tools, buyer checklist), property listings with filters / sorting / pagination, property detail
(gallery, installment plan, inquiry form, WhatsApp share), society page, payment plans,
gallery, about, contact / book a site visit, 404.

**Admin panel** (`/admin`): dashboard with a "publish verified content" checklist, listings
(photos auto-compressed to WebP), inquiries inbox (status + private notes), gallery, all site
text (business details, hero, society, payment plans, about, Mardan facts, buyer checklist,
SEO) and password change.

**Speed & SEO**: code-split pages prefetched on hover, cached API responses, compressed
responses, long-cache static assets, responsive WebP images, server-rendered meta tags and
Open Graph previews for every listing, JSON-LD, `sitemap.xml` and `robots.txt`.

## Content policy: verified information only

The website ships with **only verified facts**:

| Content | Source |
| --- | --- |
| Name "Prem Housing Site Office", phone +92 342 9423521 | Client's contact card |
| Mardan facts (2nd-largest city in KP, 368,302 residents, universities, medical college) | [Wikipedia: Mardan](https://en.wikipedia.org/wiki/Mardan) (2023 Census) |
| "Verify the society's legal status and NOC" | [ProPakistani, 29 Dec 2025](https://propakistani.pk/2025/12/29/kp-launches-crackdown-on-illegal-housing-societies/) |

Society overview, approvals, amenities, prices, payment plans, master plan and photos are
**empty by default** and are entered by the site office in the Admin panel. Empty sections are
hidden on the website, so nothing unverified is ever shown.
