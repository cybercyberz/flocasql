// Script to update PM2 to use the enhanced server
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('Updating PM2 to use the enhanced server...');

try {
  // Delete the PM2 process
  console.log('Deleting PM2 process...');
  execSync('pm2 delete websitecursor', { stdio: 'inherit' });
  console.log('✅ PM2 process deleted');
} catch (err) {
  console.log('No existing PM2 process to delete or error deleting:', err.message);
  // Continue anyway
}

try {
  // Start a new PM2 process with the enhanced server
  console.log('Starting new PM2 process with enhanced-server.js...');
  execSync('pm2 start enhanced-server.js --name websitecursor', { stdio: 'inherit' });
  console.log('✅ New PM2 process started with enhanced-server.js');
} catch (err) {
  console.error('Error starting new PM2 process:', err.message);
  process.exit(1);
}

console.log('\n✅ PM2 updated to use enhanced-server.js');
console.log('You can now access the website at http://localhost:3000');
console.log('Admin login: http://localhost:3000/login');
console.log('Username: admin');
console.log('Password: admin123');
