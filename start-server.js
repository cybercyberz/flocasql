// Simple script to start the Next.js development server in production mode
const { spawn } = require('child_process');
const path = require('path');

// Start the Next.js development server
console.log('Starting Next.js development server in production mode...');
const nextDev = spawn('npx', ['next', 'dev', '-p', '3000'], {
  cwd: process.cwd(),
  env: {
    ...process.env,
    NODE_ENV: 'production'
  },
  stdio: 'inherit'
});

// Handle process exit
nextDev.on('close', (code) => {
  console.log(`Next.js development server exited with code ${code}`);
  process.exit(code);
});

// Handle process errors
nextDev.on('error', (err) => {
  console.error('Failed to start Next.js development server:', err);
  process.exit(1);
});

// Handle SIGINT and SIGTERM signals
process.on('SIGINT', () => {
  console.log('Received SIGINT signal, shutting down...');
  nextDev.kill('SIGINT');
});

process.on('SIGTERM', () => {
  console.log('Received SIGTERM signal, shutting down...');
  nextDev.kill('SIGTERM');
});
