// Script to fix website "File not found" issues
const fs = require('fs');
const path = require('path');
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

// Function to create a basic .htaccess file
function createHtaccessFile() {
  const htaccessPath = path.join(process.cwd(), 'public', '.htaccess');
  const htaccessContent = `
# Enable the RewriteEngine
RewriteEngine On

# Set the base directory
RewriteBase /

# If the request is for a real file or directory, don't rewrite
RewriteCond %{REQUEST_FILENAME} -f [OR]
RewriteCond %{REQUEST_FILENAME} -d
RewriteRule ^ - [L]

# For article pages
RewriteRule ^article/([^/]+)/?$ /article.html [L]

# For admin pages
RewriteRule ^admin/?$ /admin.html [L]

# Redirect all other requests to index.html
RewriteRule ^ /index.html [L]
`;

  try {
    fs.writeFileSync(htaccessPath, htaccessContent);
    console.log(`✅ Created/Updated .htaccess file at ${htaccessPath}`);
    return true;
  } catch (error) {
    console.error(`❌ Error creating .htaccess file:`, error.message);
    return false;
  }
}

// Function to create a simple server.js file
function createSimpleServerFile() {
  const serverPath = path.join(process.cwd(), 'simple-server.js');
  const serverContent = `
// Simple HTTP server for static files
const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 3000;

// MIME types for different file extensions
const MIME_TYPES = {
  '.html': 'text/html',
  '.css': 'text/css',
  '.js': 'text/javascript',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon'
};

// Create HTTP server
const server = http.createServer((req, res) => {
  console.log(\`\${new Date().toISOString()} - \${req.method} \${req.url}\`);
  
  // Parse URL
  let url = req.url;
  
  // Handle root URL
  if (url === '/') {
    url = '/index.html';
  }
  
  // Handle article URLs
  if (url.startsWith('/article/')) {
    url = '/article.html';
  }
  
  // Handle admin URLs
  if (url === '/admin') {
    url = '/admin.html';
  }
  
  // Get file path
  const filePath = path.join(process.cwd(), 'public', url);
  
  // Check if file exists
  fs.access(filePath, fs.constants.F_OK, (err) => {
    if (err) {
      // File not found
      console.error(\`File not found: \${filePath}\`);
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('404 Not Found');
      return;
    }
    
    // Get file extension
    const ext = path.extname(filePath);
    
    // Get MIME type
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';
    
    // Read file
    fs.readFile(filePath, (err, data) => {
      if (err) {
        console.error(\`Error reading file: \${filePath}\`, err);
        res.writeHead(500, { 'Content-Type': 'text/plain' });
        res.end('500 Internal Server Error');
        return;
      }
      
      // Send response
      res.writeHead(200, { 'Content-Type': contentType });
      res.end(data);
    });
  });
});

// Start server
server.listen(PORT, () => {
  console.log(\`Server running at http://localhost:\${PORT}/\`);
});
`;

  try {
    fs.writeFileSync(serverPath, serverContent);
    console.log(`✅ Created simple-server.js file at ${serverPath}`);
    return true;
  } catch (error) {
    console.error(`❌ Error creating simple-server.js file:`, error.message);
    return false;
  }
}

// Function to update ecosystem.config.js to use the simple server
function updateEcosystemConfig() {
  const ecosystemPath = path.join(process.cwd(), 'ecosystem.config.js');
  
  if (!fileExists(ecosystemPath)) {
    console.error(`❌ ecosystem.config.js not found at ${ecosystemPath}`);
    return false;
  }
  
  try {
    let ecosystemContent = fs.readFileSync(ecosystemPath, 'utf8');
    
    // Replace the script path to use simple-server.js
    ecosystemContent = ecosystemContent.replace(
      /script: ['"]([^'"]+)['"]/,
      'script: "simple-server.js"'
    );
    
    fs.writeFileSync(ecosystemPath, ecosystemContent);
    console.log(`✅ Updated ecosystem.config.js to use simple-server.js`);
    return true;
  } catch (error) {
    console.error(`❌ Error updating ecosystem.config.js:`, error.message);
    return false;
  }
}

// Function to check and fix file permissions
function fixFilePermissions() {
  const publicDir = path.join(process.cwd(), 'public');
  
  if (!fileExists(publicDir)) {
    console.error(`❌ Public directory not found at ${publicDir}`);
    return false;
  }
  
  try {
    // Make public directory and its contents readable
    executeCommand(`chmod -R 755 ${publicDir}`);
    console.log(`✅ Fixed file permissions for public directory`);
    return true;
  } catch (error) {
    console.error(`❌ Error fixing file permissions:`, error.message);
    return false;
  }
}

// Function to check if all required files exist
function checkRequiredFiles() {
  const requiredFiles = [
    'public/index.html',
    'public/article.html',
    'public/admin.html'
  ];
  
  const missingFiles = [];
  
  for (const file of requiredFiles) {
    const filePath = path.join(process.cwd(), file);
    if (!fileExists(filePath)) {
      missingFiles.push(file);
    }
  }
  
  if (missingFiles.length > 0) {
    console.error(`❌ Missing required files: ${missingFiles.join(', ')}`);
    return false;
  }
  
  console.log(`✅ All required files exist`);
  return true;
}

// Main function to fix website issues
async function fixWebsite() {
  console.log('🔧 Starting website fix...');
  
  // Check if required files exist
  const filesExist = checkRequiredFiles();
  
  if (!filesExist) {
    console.log('\n🔄 Running update-website.js to restore missing files...');
    try {
      require('./update-website');
    } catch (error) {
      console.error(`❌ Error running update-website.js:`, error.message);
    }
  }
  
  // Create/update .htaccess file
  createHtaccessFile();
  
  // Create simple server file
  createSimpleServerFile();
  
  // Update ecosystem.config.js
  updateEcosystemConfig();
  
  // Fix file permissions (on Unix-like systems)
  if (process.platform !== 'win32') {
    fixFilePermissions();
  }
  
  console.log('\n✅ Website fix completed!');
  console.log('\nTo restart the server, run:');
  console.log('  pm2 restart ecosystem.config.js');
  console.log('\nIf you are still experiencing issues, please check your server logs for more information.');
}

// Run the fix
fixWebsite();
