import { spawn } from 'node:child_process';
import { createRequire } from 'node:module';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const frontend = fileURLToPath(new URL('../admin/frontend/', import.meta.url));
const backend = fileURLToPath(new URL('../admin/backend/', import.meta.url));
const frontendRequire = createRequire(new URL('../admin/frontend/package.json', import.meta.url));
const vite = join(dirname(frontendRequire.resolve('vite/package.json')), 'bin/vite.js');
const processes = [
  spawn(process.execPath, ['--watch', 'src/index.js'], { cwd: backend, stdio: 'inherit' }),
  spawn(process.execPath, [vite, '--host', '127.0.0.1'], { cwd: frontend, stdio: 'inherit' }),
];
let stopping = false;
function stop(code = 0) {
  if (stopping) return;
  stopping = true;
  for (const child of processes) child.kill();
  process.exit(code);
}
process.on('SIGINT', () => stop());
process.on('SIGTERM', () => stop());
for (const child of processes) child.on('exit', code => stop(code || 0));
