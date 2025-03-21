// Script to rebuild the Next.js application with the correct configuration
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('Starting rebuild process...');

// Check if next.config.js has the correct configuration
try {
  console.log('Checking next.config.js...');
  const nextConfigPath = path.join(process.cwd(), 'next.config.js');
  const nextConfig = fs.readFileSync(nextConfigPath, 'utf8');
  
  if (!nextConfig.includes("output: 'standalone'")) {
    console.error('❌ next.config.js does not have output: "standalone" set');
    console.log('Please update next.config.js to include output: "standalone"');
    process.exit(1);
  }
  
  console.log('✅ next.config.js has the correct configuration');
} catch (err) {
  console.error('Error checking next.config.js:', err.message);
  process.exit(1);
}

// Clean the .next directory
try {
  console.log('Cleaning .next directory...');
  if (fs.existsSync(path.join(process.cwd(), '.next'))) {
    execSync('rm -rf .next');
  }
  console.log('✅ .next directory cleaned');
} catch (err) {
  console.error('Error cleaning .next directory:', err.message);
  // Continue anyway
}

// Install dependencies
try {
  console.log('Installing dependencies...');
  execSync('npm install', { stdio: 'inherit' });
  console.log('✅ Dependencies installed');
} catch (err) {
  console.error('Error installing dependencies:', err.message);
  process.exit(1);
}

// Build the application
try {
  console.log('Building the application...');
  execSync('npm run build', { stdio: 'inherit' });
  console.log('✅ Application built successfully');
} catch (err) {
  console.error('Error building the application:', err.message);
  process.exit(1);
}

// Check if the standalone directory was created
try {
  console.log('Checking for standalone directory...');
  if (fs.existsSync(path.join(process.cwd(), '.next', 'standalone'))) {
    console.log('✅ .next/standalone directory created successfully');
  } else {
    console.error('❌ .next/standalone directory was not created');
    console.log('Please check the build logs for errors');
    process.exit(1);
  }
} catch (err) {
  console.error('Error checking for standalone directory:', err.message);
  process.exit(1);
}

// Restart PM2
try {
  console.log('Restarting PM2 process...');
  execSync('pm2 restart websitecursor', { stdio: 'inherit' });
  console.log('✅ PM2 process restarted');
} catch (err) {
  console.error('Error restarting PM2 process:', err.message);
  process.exit(1);
}

console.log('\n✅ Rebuild process completed successfully');
console.log('You can now check if the website is working correctly');
