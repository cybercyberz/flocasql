// Script to update ecosystem.config.js to use the basic server
const fs = require('fs');
const path = require('path');

console.log('Updating ecosystem.config.js to use the basic server...');

try {
  const ecosystemPath = path.join(process.cwd(), 'ecosystem.config.js');
  
  if (fs.existsSync(ecosystemPath)) {
    const newContent = `module.exports = {
  apps: [{
    name: 'websitecursor',
    script: 'basic-server.js',
    cwd: '/home/flocaclo/public_html',
    instances: 1,
    exec_mode: 'fork',
    autorestart: true,
    watch: false,
    max_memory_restart: '512M',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    }
  }]
};`;
    
    fs.writeFileSync(ecosystemPath, newContent);
    console.log('✅ ecosystem.config.js updated to use basic-server.js');
  } else {
    console.error('❌ ecosystem.config.js not found');
  }
} catch (err) {
  console.error('Error updating ecosystem.config.js:', err.message);
}

console.log('\nTo apply the changes, run:');
console.log('pm2 restart websitecursor');
