// Ejecuta la compilacion real, sin abrir una consola ni dejar procesos activos.
const { spawn } = require('node:child_process');
const { once } = require('node:events');
const net = require('node:net');
const path = require('node:path');

async function main() {
  const server = net.createServer();
  server.listen(0, '127.0.0.1');
  await once(server, 'listening');
  const port = server.address().port;
  await new Promise((resolve) => server.close(resolve));
  const child = spawn(process.execPath, ['dist/main.js'], {
    cwd: path.resolve(__dirname, '..'),
    env: { ...process.env, PORT: String(port), SWAGGER_ENABLED: 'true' },
    stdio: 'ignore', windowsHide: true,
  });
  try {
    let live;
    for (let attempt = 0; attempt < 50; attempt++) {
      if (child.exitCode !== null) throw new Error('NestJS termino antes de responder');
      try {
        live = await fetch(`http://127.0.0.1:${port}/api/v1/health/live`);
        if (live.ok) break;
      } catch { /* espera limitada de arranque */ }
      await new Promise((resolve) => setTimeout(resolve, 100));
    }
    if (!live?.ok) throw new Error('NestJS no respondio');
    const doc = await fetch(`http://127.0.0.1:${port}/api/docs-json`);
    const spec = await doc.json();
    if (!doc.ok || !spec.paths['/api/v1/health/ready']) throw new Error('OpenAPI no disponible');
    const ready = await fetch(`http://127.0.0.1:${port}/api/v1/health/ready`);
    if (![200, 503].includes(ready.status)) throw new Error('Estado readiness inesperado');
    console.log(`OK: NestJS compilado responde, OpenAPI generado; readiness HTTP ${ready.status}.`);
  } finally {
    if (child.exitCode === null) {
      child.kill();
      await once(child, 'exit');
    }
  }
}
main().catch((error) => { console.error(error.message); process.exitCode = 1; });
