# IEEE TAMUSA Cloudflare setup

This version adds:
- About and Sponsorship pages.
- Automatic event loading from one or more ICS feeds, including Google Calendar and compatible Jagsync feeds.
- RSVP/event links taken from each calendar event's `URL` field or a URL in its description.
- Turnstile-protected contact form with server-side validation.
- D1-backed official portal at `/Admin` for posting/deleting resources and reading contact messages.

## 1. D1
Create a D1 database and apply `migrations/0001_initial.sql`.

Bind it to Pages/Workers as `DB`.

## 2. Turnstile
Create a Turnstile widget for your production hostname. Replace `YOUR_TURNSTILE_SITE_KEY` in `Contact/index.html` with the public site key.

Set the private secret as:
`wrangler pages secret put TURNSTILE_SECRET`

The secret must never be placed in HTML or JavaScript.

## 3. Calendar
Set `CALENDAR_FEEDS` to one or more ICS URLs separated by commas or newlines.

Google Calendar: use the calendar's iCal/ICS subscription address. If you want RSVP links to be preserved, the event should have a public event/registration URL.

The supplied College Station IEEE feed is:
https://portal.ieeetamu.org/api/v1/calendar

For TAMUSA, replace it with the Jagsync/Google Calendar subscription URL for the branch. The site does not hard-code the College Station feed because that would publish College Station events on the TAMUSA site.

## 4. Official portal
Set a strong random one-time setup token:
`wrangler pages secret put SETUP_TOKEN`

Then, after deployment, create the first admin account by POSTing JSON to:
`/api/admin/setup`
with header:
`Authorization: Bearer YOUR_SETUP_TOKEN`

Body:
`{"username":"officer","password":"use-a-long-random-password"}`

The setup endpoint refuses to run after the first admin exists.

Officials then use:
`/Admin`

They do not need Cloudflare dashboard access. Authentication is handled by the site's own D1-backed login/session system.

## Security notes
- Passwords are PBKDF2-SHA-256 hashed with a unique salt.
- Sessions are random, HttpOnly, Secure, SameSite cookies and expire after 7 days.
- Contact submissions require server-side Turnstile verification.
- A honeypot field is included as an additional spam filter.
- Resource URLs are restricted to HTTP/HTTPS.
- D1 stores resource metadata/links and contact messages. For large binary files, use an object store such as R2 rather than putting file blobs in D1.
