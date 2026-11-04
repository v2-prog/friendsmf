'use strict';
// Field-level AES-256-GCM for sensitive records (bequest intentions, salary arrangements, supplier payment details).
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const cfg = require('./config');

let key = null;
let keyId = 'k1';

function loadKey() {
  if (key) return key;
  const fromEnv = process.env.DATA_ENCRYPTION_KEY;
  keyId = process.env.DATA_ENCRYPTION_KEY_ID || 'k1';
  if (fromEnv) {
    if (!/^[0-9a-fA-F]{64}$/.test(fromEnv)) throw new Error('DATA_ENCRYPTION_KEY must be 64 hex characters (32 bytes).');
    key = Buffer.from(fromEnv, 'hex');
    return key;
  }
  if (cfg.isProd) throw new Error('DATA_ENCRYPTION_KEY is required in production. Generate one with: node -e "console.log(require(\'crypto\').randomBytes(32).toString(\'hex\'))"');
  const file = path.join(cfg.DATA_DIR, 'dev-encryption.key');
  if (!fs.existsSync(file)) {
    fs.writeFileSync(file, crypto.randomBytes(32).toString('hex'), { mode: 0o600 });
    console.warn(`[crypto] Development only: generated a local encryption key at ${file}. Set DATA_ENCRYPTION_KEY for any real deployment.`);
  }
  key = Buffer.from(fs.readFileSync(file, 'utf8').trim(), 'hex');
  return key;
}

function encrypt(value, aad) {
  const k = loadKey();
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv('aes-256-gcm', k, iv);
  if (aad) cipher.setAAD(Buffer.from(aad));
  const ct = Buffer.concat([cipher.update(JSON.stringify(value), 'utf8'), cipher.final()]);
  const tag = cipher.getAuthTag();
  return ['v1', keyId, iv.toString('base64'), tag.toString('base64'), ct.toString('base64')].join(':');
}

function decrypt(blob, aad) {
  if (!blob) return null;
  const [v, , iv, tag, ct] = String(blob).split(':');
  if (v !== 'v1') throw new Error('Unknown ciphertext version');
  const d = crypto.createDecipheriv('aes-256-gcm', loadKey(), Buffer.from(iv, 'base64'));
  if (aad) d.setAAD(Buffer.from(aad));
  d.setAuthTag(Buffer.from(tag, 'base64'));
  const pt = Buffer.concat([d.update(Buffer.from(ct, 'base64')), d.final()]);
  return JSON.parse(pt.toString('utf8'));
}

module.exports = { encrypt, decrypt };
