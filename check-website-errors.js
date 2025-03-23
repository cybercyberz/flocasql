// Script to check website status and diagnose errors
const fs = require('fs');
const path = require('path');
const http = require('http');
const { execSync } = require('child_process');

// Function to execute a command and return the output
function executeCommand(command) {
  try {
    const output = execSync(command, { encoding: 'utf8' });
    return { success: true, output };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

// Function to check if a file exists
function fileExists(filePath) {
  return fs.existsSync(filePath);
}

// Function to check if a directory exists
function directoryExists(dirPath) {
  return fs.existsSync(dirPath) && fs.statSync(dirPath).isDirectory();
}

// Function to check if a port is in use
function isPortInUse(port) {
  try {
    const server = http.createServer();
    
    return new Promise((resolve) => {
      server.once('error', (err) => {
        if (err.code === 'EADDRINUSE') {
          resolve(true);
        } else {
          resolve(false);
        }
      });
      
      server.once('listening', () => {
        server.close();
        resolve(false);
      });
      
      server.listen(port);
    });
  } catch (error) {
    console.error(`Error checking port ${port}:`, error);
    return false;
  }
}

// Function to check PM2 status
function checkPM2Status() {
  console.log('🔍 Checking PM2 status...');
  
  const result = executeCommand('pm2 list');
  
  if (result.success) {
    console.log('✅ PM2 is running');
    console.log(result.output);
    return true;
  } else {
    console.error('❌ Error checking PM2 status:', result.error);
    return false;
  }
}

// Function to check file structure
function checkFileStructure() {
  console.log('\n🔍 Checking file structure...');
  
  const requiredFiles = [
    'public/index.html',
    'public/article.html',
    'public/admin.html',
    'public/.htaccess',
    'enhanced-server.js',
    'simple-server.js',
    'ecosystem.config.js'
  ];
  
  const requiredDirs = [
    'public',
    'public/images'
  ];
  
  let allFilesExist = true;
  let allDirsExist = true;
  
  // Check directories
  for (const dir of requiredDirs) {
    const dirPath = path.join(process.cwd(), dir);
    if (!directoryExists(dirPath)) {
      console.error(`❌ Required directory not found: ${dir}`);
      allDirsExist = false;
    } else {
      console.log(`✅ Directory exists: ${dir}`);
    }
  }
  
  // Check files
  for (const file of requiredFiles) {
    const filePath = path.join(process.cwd(), file);
    if (!fileExists(filePath)) {
      console.error(`❌ Required file not found: ${file}`);
      allFilesExist = false;
    } else {
      console.log(`✅ File exists: ${file}`);
    }
  }
  
  return allFilesExist && allDirsExist;
}

// Function to check ecosystem.config.js
function checkEcosystemConfig() {
  console.log('\n🔍 Checking ecosystem.config.js...');
  
  const ecosystemPath = path.join(process.cwd(), 'ecosystem.config.js');
  
  if (!fileExists(ecosystemPath)) {
    console.error(`❌ ecosystem.config.js not found at ${ecosystemPath}`);
    return false;
  }
  
  try {
    const ecosystemContent = fs.readFileSync(ecosystemPath, 'utf8');
    
    // Check which script is being used
    const scriptMatch = ecosystemContent.match(/script: ['"]([^'"]+)['"]/);
    
    if (scriptMatch) {
      const scriptPath = scriptMatch[1];
      console.log(`ℹ️ Current script in ecosystem.config.js: ${scriptPath}`);
      
      // Check if the script file exists
      if (!fileExists(path.join(process.cwd(), scriptPath))) {
        console.error(`❌ Script file not found: ${scriptPath}`);
        return false;
      } else {
        console.log(`✅ Script file exists: ${scriptPath}`);
      }
    } else {
      console.error(`❌ Could not find script path in ecosystem.config.js`);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error(`❌ Error reading ecosystem.config.js:`, error.message);
    return false;
  }
}

// Function to check .htaccess file
function checkHtaccessFile() {
  console.log('\n🔍 Checking .htaccess file...');
  
  const htaccessPath = path.join(process.cwd(), 'public', '.htaccess');
  
  if (!fileExists(htaccessPath)) {
    console.error(`❌ .htaccess file not found at ${htaccessPath}`);
    return false;
  }
  
  try {
    const htaccessContent = fs.readFileSync(htaccessPath, 'utf8');
    
    // Check if RewriteEngine is enabled
    if (!htaccessContent.includes('RewriteEngine On')) {
      console.error(`❌ RewriteEngine not enabled in .htaccess`);
      return false;
    } else {
      console.log(`✅ RewriteEngine is enabled in .htaccess`);
    }
    
    // Check if article rewrite rule exists
    if (!htaccessContent.includes('article/')) {
      console.error(`❌ Article rewrite rule not found in .htaccess`);
      return false;
    } else {
      console.log(`✅ Article rewrite rule found in .htaccess`);
    }
    
    return true;
  } catch (error) {
    console.error(`❌ Error reading .htaccess file:`, error.message);
    return false;
  }
}

// Function to check port usage
async function checkPortUsage() {
  console.log('\n🔍 Checking port usage...');
  
  const ports = [80, 443, 3000];
  
  for (const port of ports) {
    const inUse = await isPortInUse(port);
    
    if (inUse) {
      console.log(`✅ Port ${port} is in use (this is good if it's your server)`);
    } else {
      console.log(`❌ Port ${port} is not in use (your server might not be running)`);
    }
  }
}

// Function to check server logs
function checkServerLogs() {
  console.log('\n🔍 Checking server logs...');
  
  const result = executeCommand('pm2 logs --lines 20');
  
  if (result.success) {
    console.log('✅ Server logs retrieved successfully');
    console.log(result.output);
    return true;
  } else {
    console.error('❌ Error retrieving server logs:', result.error);
    return false;
  }
}

// Function to provide recommendations
function provideRecommendations(fileStructureOk, ecosystemConfigOk, htaccessOk) {
  console.log('\n📋 Recommendations:');
  
  if (!fileStructureOk) {
    console.log('1. Run the update-website.js script to restore missing files:');
    console.log('   node update-website.js');
  }
  
  if (!ecosystemConfigOk) {
    console.log('2. Update ecosystem.config.js to use simple-server.js:');
    console.log('   node fix-website.js');
  }
  
  if (!htaccessOk) {
    console.log('3. Create/update the .htaccess file:');
    console.log('   node fix-website.js');
  }
  
  console.log('\n4. Restart the server:');
  console.log('   pm2 restart ecosystem.config.js');
  
  console.log('\n5. If you are still experiencing issues, try the following:');
  console.log('   - Check your server logs for more information: pm2 logs');
  console.log('   - Make sure your domain is properly configured to point to your server');
  console.log('   - Check if your hosting provider has any specific requirements');
  console.log('   - Try using the simple-server.js directly: node simple-server.js');
}

// Main function to check website status
async function checkWebsiteStatus() {
  console.log('🚀 Starting website status check...');
  
  // Check PM2 status
  checkPM2Status();
  
  // Check file structure
  const fileStructureOk = checkFileStructure();
  
  // Check ecosystem.config.js
  const ecosystemConfigOk = checkEcosystemConfig();
  
  // Check .htaccess file
  const htaccessOk = checkHtaccessFile();
  
  // Check port usage
  await checkPortUsage();
  
  // Check server logs
  checkServerLogs();
  
  // Provide recommendations
  provideRecommendations(fileStructureOk, ecosystemConfigOk, htaccessOk);
  
  console.log('\n✅ Website status check completed!');
}

// Run the check
checkWebsiteStatus();
