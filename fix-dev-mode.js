// Script to fix development mode issues
const fs = require('fs');
const path = require('path');

console.log('Starting fix for development mode issues...');

// Update start-server.js to use production mode instead of development mode
try {
  console.log('Updating start-server.js...');
  const startServerPath = path.join(process.cwd(), 'start-server.js');
  
  if (fs.existsSync(startServerPath)) {
    let content = fs.readFileSync(startServerPath, 'utf8');
    
    // Check if the file is using 'next dev'
    if (content.includes("['next', 'dev'")) {
      console.log('Changing from development mode to production mode...');
      
      // Replace 'next dev' with 'next start'
      content = content.replace("['next', 'dev'", "['next', 'start'");
      
      // Write the updated content back to the file
      fs.writeFileSync(startServerPath, content);
      
      console.log('✅ start-server.js updated to use production mode');
    } else {
      console.log('start-server.js is not using development mode, no changes needed');
    }
  } else {
    console.error('❌ start-server.js not found');
  }
} catch (err) {
  console.error('Error updating start-server.js:', err.message);
}

// Create a production-ready server script
try {
  console.log('Creating production server script...');
  const prodServerPath = path.join(process.cwd(), 'prod-server.js');
  
  const prodServerContent = `// Production server script for Next.js
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Check if .next/standalone exists
if (!fs.existsSync(path.join(process.cwd(), '.next', 'standalone'))) {
  console.error('❌ .next/standalone directory not found');
  console.error('Please run "npm run build" first');
  process.exit(1);
}

// Start the production server
console.log('Starting Next.js production server...');
try {
  // Use the standalone server
  require('./.next/standalone/server.js');
} catch (err) {
  console.error('Error starting production server:', err);
  process.exit(1);
}
`;
  
  fs.writeFileSync(prodServerPath, prodServerContent);
  console.log('✅ prod-server.js created');
} catch (err) {
  console.error('Error creating production server script:', err.message);
}

// Update ecosystem.config.js to use the production server
try {
  console.log('Updating ecosystem.config.js...');
  const ecosystemPath = path.join(process.cwd(), 'ecosystem.config.js');
  
  if (fs.existsSync(ecosystemPath)) {
    let content = fs.readFileSync(ecosystemPath, 'utf8');
    
    // Check if the file is using start-server.js
    if (content.includes("script: 'start-server.js'")) {
      console.log('Changing from start-server.js to prod-server.js...');
      
      // Replace start-server.js with prod-server.js
      content = content.replace("script: 'start-server.js'", "script: 'prod-server.js'");
      
      // Write the updated content back to the file
      fs.writeFileSync(ecosystemPath, content);
      
      console.log('✅ ecosystem.config.js updated to use prod-server.js');
    } else {
      console.log('ecosystem.config.js is not using start-server.js, no changes needed');
    }
  } else {
    console.error('❌ ecosystem.config.js not found');
  }
} catch (err) {
  console.error('Error updating ecosystem.config.js:', err.message);
}

console.log('\n✅ Fix for development mode issues completed');
console.log('Please run "node rebuild.js" to rebuild the application and restart PM2');
