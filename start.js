#!/usr/bin/env node

/**
 * Sahabat Nusantara - Production Starter
 * Starts the application with proper configuration
 */

const { spawn } = require('child_process');
const path = require('path');

// Change to backend directory and start the server
const backendPath = path.join(__dirname, 'backend');
const server = spawn('node', ['index.js'], {
  cwd: backendPath,
  stdio: 'inherit',
  env: { ...process.env }
});

server.on('error', (error) => {
  console.error('Failed to start server:', error);
  process.exit(1);
});

server.on('close', (code) => {
  console.log(`Server process exited with code ${code}`);
  process.exit(code);
});

// Handle process termination
process.on('SIGINT', () => {
  console.log('\nShutting down server...');
  server.kill('SIGINT');
});

process.on('SIGTERM', () => {
  console.log('\nShutting down server...');
  server.kill('SIGTERM');
});
