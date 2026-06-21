const { spawn } = require('child_process');
const path = require('path');

const rootDir = path.join(__dirname, '..');

console.log(`\n======================================================`);
console.log(`Starting DSA Pattern Tracker AI Workspace...`);
console.log(`======================================================\n`);

// Helper to spawn and pipe process output
const startProcess = (name, command, args, dir) => {
  const proc = spawn(command, args, {
    cwd: path.join(rootDir, dir),
    shell: true
  });

  proc.stdout.on('data', (data) => {
    const lines = data.toString().trim().split('\n');
    lines.forEach(line => {
      console.log(`[${name}] ${line}`);
    });
  });

  proc.stderr.on('data', (data) => {
    const lines = data.toString().trim().split('\n');
    lines.forEach(line => {
      console.error(`[${name} ERROR] ${line}`);
    });
  });

  proc.on('close', (code) => {
    console.log(`[${name}] process exited with code ${code}`);
  });

  return proc;
};

// Start Backend Server
const backendProc = startProcess('Backend', 'npm', ['run', 'dev'], 'backend');

// Start Frontend Dev Server
const frontendProc = startProcess('Frontend', 'npm', ['run', 'dev'], 'frontend');

// Handle process termination cleanly
process.on('SIGINT', () => {
  console.log('\nShutting down workspace...');
  backendProc.kill();
  frontendProc.kill();
  process.exit(0);
});
