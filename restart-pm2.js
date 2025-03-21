// Script to completely restart PM2 with the basic server
const { execSync } = require('child_process');

console.log('Completely restarting PM2 with the basic server...');

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
  // Start a new PM2 process with the basic server
  console.log('Starting new PM2 process with basic-server.js...');
  execSync('pm2 start basic-server.js --name websitecursor', { stdio: 'inherit' });
  console.log('✅ New PM2 process started with basic-server.js');
} catch (err) {
  console.error('Error starting new PM2 process:', err.message);
  process.exit(1);
}

console.log('\n✅ PM2 completely restarted with basic-server.js');
console.log('You can now check if the website is working correctly:');
console.log('curl http://localhost:3000');
