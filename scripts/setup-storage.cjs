const { randomBytes } = require('node:crypto');
const { readFileSync, writeFileSync, existsSync, chmodSync } = require('node:fs');
const { resolve } = require('node:path');
const { parse } = require('dotenv');
const file = resolve(__dirname, '../.env');
let source = existsSync(file) ? readFileSync(file, 'utf8') : readFileSync(resolve(__dirname, '../.env.example'), 'utf8');
const values = parse(source);
const defaults = {
  MINIO_ROOT_USER: 'superkanes-root', MINIO_ROOT_PASSWORD: randomBytes(32).toString('hex'),
  S3_ENABLED: 'true', S3_ENDPOINT: 'http://localhost:9000', S3_REGION: 'us-east-1', S3_BUCKET: 'superkanes',
  S3_ACCESS_KEY: 'superkanes-app', S3_SECRET_KEY: randomBytes(32).toString('hex'),
};
for (const [key, value] of Object.entries(defaults)) {
  if (values[key] && !values[key].startsWith('REPLACE_') && !(key === 'S3_ENABLED' && values[key] === 'false')) continue;
  const line = `${key}=${value}`;
  const pattern = new RegExp(`^${key}=.*$`, 'm');
  source = pattern.test(source) ? source.replace(pattern, line) : `${source.trimEnd()}\n${line}\n`;
}
writeFileSync(file, source, { mode: 0o600 });
chmodSync(file, 0o600);
console.log('MinIO configurado en .env. Ejecuta docker compose up -d minio minio-init.');
