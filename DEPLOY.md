# Deployment notes for friendsmf.com on Cloudflare

This is a full Node.js 22+ server application with SQLite (node:sqlite). It is **not** a static site.

## Cloudflare options

1. **Cloudflare Containers** (recommended for minimal changes): Run the Node process in a container. Point the domain to the container service. Keep the existing SQLite data volume.
2. **Cloudflare Workers + D1**: Requires adapting the database layer from node:sqlite to D1, and running under the Workers runtime (nodejs_compat). Significant rewrite; keeps zero third-party packages if you stick to the Web APIs.
3. **Hybrid**: Serve the public site (port 3001) as a static export or via Pages/Workers for the read-only routes, and host the member area (port 3000) elsewhere (VPS, Containers, etc.). The two apps already share one DB.
4. **Traditional VPS** behind Cloudflare (proxy): Simplest for the current code. Set TRUST_PROXY=1, HTTPS, SMTP_URL, and a 32-byte DATA_ENCRYPTION_KEY (backed up separately).

## Domain

Register or transfer friendsmf.com to Cloudflare Registrar (or another registrar and change nameservers). Add the site in the Cloudflare dashboard, then point DNS to your chosen host (Container, Worker, or origin server).

## Before going live

- Replace all placeholders in config/society.json and config/public.json (name, ABN, address, bank details, privacy contact).
- Set NODE_ENV=production, BASE_URL=https://friendsmf.com, PUBLIC_URL=https://friendsmf.com (or separate public host), SMTP_URL, MAIL_FROM.
- Generate and securely store DATA_ENCRYPTION_KEY.
- Confirm GST treatments and retention periods with an accountant.
- Leave charity status on "none" until DGR endorsement is confirmed.

See HANDOVER.md and README.md for the full constraints and rules that must not be weakened.
