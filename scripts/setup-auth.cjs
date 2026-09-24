// Genera una clave local una sola vez; nunca la imprime ni reemplaza una existente.
const { randomBytes } = require('node:crypto');
const { existsSync, readFileSync, appendFileSync } = require('node:fs');
const { resolve } = require('node:path');
const local = resolve(__dirname,'../.env');
const parent = resolve(__dirname,'../../.env');
const path = existsSync(local) ? local : existsSync(parent) ? parent : local;
const content=existsSync(path)?readFileSync(path,'utf8'):'';
if (require('dotenv').parse(content).AUTH_JWT_SECRET?.trim()) {
  console.log('AUTH_JWT_SECRET ya existe; no se modifica.');
} else {
  appendFileSync(path, '\nAUTH_JWT_SECRET='+randomBytes(64).toString('base64')+'\n', {mode:0o600});
  console.log('Clave JWT generada en el archivo .env local. No compartir ni versionar.');
}
