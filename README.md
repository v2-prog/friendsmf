# Friends SMF — Quaker Hub

Financial and administrative hub for Friends SMF (friendsmf.com), a small Quaker society in Australia. Two separate apps share one SQLite database:

- **Member area** (port 3000): sign-in, giving, invoices, discernment, library, and the finance team's tools.
- **Public site** (port 3001): society overview, ways to give, community projects. No login, no cookies, read-only. It can run on its own host.

No third-party packages. It uses Node 22.13+ (`node:sqlite`, `node:http`), so `npm install` is not needed.

## Run it

```bash
cp .env.example .env             # then edit ADMIN_EMAIL to your own address
set -a; . ./.env; set +a
npm run seed                     # adds the documents library (real ATO / ACNC / OAIC links)
npm run seed -- --demo           # optional: fictional people, gifts, invoices and proposals (refused in production)
npm start                        # member area on :3000, public site on :3001
npm test                         # 34 end-to-end tests against a throwaway database
```

The first start creates `ADMIN_EMAIL` as a finance team user. In development there is no mail server, so the sign-in link appears on screen after you enter the email, and every email is also written to `data/outbox/`.

Full source follows the original HANDOVER.md rules. See DEPLOY.md for Cloudflare hosting options for friendsmf.com.
