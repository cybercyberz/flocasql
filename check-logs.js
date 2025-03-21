// Script to check server logs and diagnose issues
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('Checking server logs and environment...');

// Check if PM2 is running
try {
  console.log('\n=== PM2 Process List ===');
  const pm2List = execSync('pm2 list').toString();
  console.log(pm2List);
} catch (err) {
  console.log('Could not get PM2 process list:', err.message);
}

// Check PM2 logs
try {
  console.log('\n=== Recent PM2 Logs ===');
  console.log('Last 20 lines of PM2 logs for websitecursor:');
  const pm2Logs = execSync('pm2 logs websitecursor --lines 20 --nostream').toString();
  console.log(pm2Logs);
} catch (err) {
  console.log('Could not get PM2 logs:', err.message);
  console.log('You can manually check logs with: pm2 logs websitecursor');
}

// Check Node.js version
try {
  console.log('\n=== Node.js Version ===');
  const nodeVersion = execSync('node --version').toString().trim();
  console.log(`Node.js version: ${nodeVersion}`);
} catch (err) {
  console.log('Could not get Node.js version:', err.message);
}

// Check npm version
try {
  console.log('\n=== npm Version ===');
  const npmVersion = execSync('npm --version').toString().trim();
  console.log(`npm version: ${npmVersion}`);
} catch (err) {
  console.log('Could not get npm version:', err.message);
}

// Check installed packages
try {
  console.log('\n=== Installed Packages ===');
  console.log('Checking for critical packages:');
  
  const packageJson = JSON.parse(fs.readFileSync(path.join(process.cwd(), 'package.json'), 'utf8'));
  const dependencies = { ...packageJson.dependencies, ...packageJson.devDependencies };
  
  const criticalPackages = [
    'next', 'react', 'react-dom', 'prisma', '@prisma/client', 'pg', 'express'
  ];
  
  for (const pkg of criticalPackages) {
    if (dependencies[pkg]) {
      console.log(`✅ ${pkg}: ${dependencies[pkg]}`);
    } else {
      console.log(`❌ ${pkg}: Not installed`);
    }
  }
} catch (err) {
  console.log('Could not check installed packages:', err.message);
}

// Check for .next directory
try {
  console.log('\n=== Next.js Build Output ===');
  if (fs.existsSync(path.join(process.cwd(), '.next'))) {
    console.log('✅ .next directory exists');
    
    // Check for standalone directory
    if (fs.existsSync(path.join(process.cwd(), '.next', 'standalone'))) {
      console.log('✅ .next/standalone directory exists');
    } else {
      console.log('❌ .next/standalone directory does not exist');
      console.log('   This may indicate that the build was not configured for standalone output');
      console.log('   Check next.config.js to ensure output: "standalone" is set');
    }
  } else {
    console.log('❌ .next directory does not exist');
    console.log('   This may indicate that the project has not been built');
    console.log('   Run: npm run build');
  }
} catch (err) {
  console.log('Could not check .next directory:', err.message);
}

// Check for out directory (static export)
try {
  if (fs.existsSync(path.join(process.cwd(), 'out'))) {
    console.log('✅ out directory exists (static export)');
  } else {
    console.log('❌ out directory does not exist');
    console.log('   This is expected if not using static export');
  }
} catch (err) {
  console.log('Could not check out directory:', err.message);
}

console.log('\n=== Troubleshooting Tips ===');
console.log('1. If PM2 shows errors, check the logs for specific error messages');
console.log('2. Make sure the database connection is working (run test-connection.js)');
console.log('3. Verify that all required packages are installed');
console.log('4. Check that the project has been built successfully');
console.log('5. Ensure the server.js file is correctly configured');
console.log('6. Check that the environment variables are set correctly in .env');
console.log('7. Try restarting the PM2 process: pm2 restart websitecursor');
