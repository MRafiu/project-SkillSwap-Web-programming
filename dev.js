import { spawn } from 'child_process';
import net from 'net';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Check if MySQL is listening on port 3306
function checkMySQL() {
  return new Promise((resolve) => {
    const socket = new net.Socket();
    socket.setTimeout(1500);

    socket.on('connect', () => {
      socket.destroy();
      resolve(true);
    });

    socket.on('error', () => {
      resolve(false);
    });

    socket.on('timeout', () => {
      socket.destroy();
      resolve(false);
    });

    socket.connect(3306, '127.0.0.1');
  });
}

async function start() {
  console.log('\x1b[36m%s\x1b[0m', '================================================');
  console.log('\x1b[36m%s\x1b[0m', '      SkillSwap Full-Stack Orchestrator         ');
  console.log('\x1b[36m%s\x1b[0m', '================================================');

  const mysqlReady = await checkMySQL();
  if (!mysqlReady) {
    console.log('\x1b[33m%s\x1b[0m', '⚠️  WARNING: MySQL does not appear to be running on port 3306.');
    console.log('\x1b[33m%s\x1b[0m', '   Please ensure MySQL is started in XAMPP Control Panel.');
    console.log('\x1b[33m%s\x1b[0m', '   Continuing to launch servers...\n');
  } else {
    console.log('\x1b[32m%s\x1b[0m', '✓ MySQL is connected and listening on port 3306 (XAMPP).');
  }

  const isWindows = process.platform === 'win32';
  const npmCmd = isWindows ? 'npm.cmd' : 'npm';

  // Spawn backend (Express REST API on port 5000)
  console.log('\x1b[34m%s\x1b[0m', 'Starting SkillSwap Backend (Port 5000)...');
  const backend = spawn(npmCmd, ['run', 'dev'], {
    cwd: path.join(__dirname, 'skillswap-backend'),
    shell: true,
    stdio: 'inherit'
  });

  // Spawn frontend (Vite React on port 5173)
  console.log('\x1b[35m%s\x1b[0m', 'Starting SkillSwap Frontend (Port 5173)...');
  const frontend = spawn(npmCmd, ['run', 'dev'], {
    cwd: path.join(__dirname, 'skillswap-frontend'),
    shell: true,
    stdio: 'inherit'
  });

  // Handle graceful exit
  const cleanup = () => {
    console.log('\n\x1b[33m%s\x1b[0m', 'Shutting down SkillSwap servers gracefully...');
    if (backend && !backend.killed) backend.kill('SIGINT');
    if (frontend && !frontend.killed) frontend.kill('SIGINT');
    process.exit(0);
  };

  process.on('SIGINT', cleanup);
  process.on('SIGTERM', cleanup);
}

start();
