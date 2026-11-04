'use strict';
// Runs the member area and the public site together, as two separate apps on two ports, plus the background jobs.
const cfg = require('./config');
const { createMembersApp } = require('./server');
const { createPublicApp } = require('./public-site');

async function main() {
  const members = createMembersApp();
  const pub = createPublicApp();
  require('./jobs').start();
  const host = process.env.HOST || '127.0.0.1';
  const servers = await Promise.all([members.listen(cfg.port, host), pub.listen(cfg.publicPort, host)]);
  console.log(`Member area: ${cfg.baseUrl}\nPublic site: ${cfg.publicUrl}`);
  if (!cfg.isProd && !cfg.adminEmail) console.log('Tip: set ADMIN_EMAIL=you@example.org to create the first finance team sign-in, or run: npm run seed');
  const stop = () => { servers.forEach((s) => s.close()); setTimeout(() => process.exit(0), 500).unref(); };
  process.on('SIGINT', stop);
  process.on('SIGTERM', stop);
}

main().catch((e) => { console.error(e); process.exit(1); });
