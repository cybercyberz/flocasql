// Script to fix git pull issues by backing up and removing conflicting files
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Function to create directory if it doesn't exist
function ensureDirectoryExists(directory) {
  if (!fs.existsSync(directory)) {
    try {
      fs.mkdirSync(directory, { recursive: true });
      console.log(`✅ Created directory: ${directory}`);
    } catch (error) {
      console.error(`❌ Error creating directory ${directory}:`, error.message);
      return false;
    }
  }
  return true;
}

// Function to execute a command and return the output
function executeCommand(command) {
  try {
    const output = execSync(command, { encoding: 'utf8' });
    return { success: true, output };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

// Function to backup a file
function backupFile(filePath) {
  try {
    if (fs.existsSync(filePath)) {
      const backupDir = path.join(process.cwd(), 'backup');
      ensureDirectoryExists(backupDir);
      
      const fileName = path.basename(filePath);
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const backupPath = path.join(backupDir, `${fileName}.${timestamp}.bak`);
      
      fs.copyFileSync(filePath, backupPath);
      console.log(`✅ Backed up ${filePath} to ${backupPath}`);
      return true;
    } else {
      console.log(`ℹ️ File ${filePath} does not exist, no backup needed`);
      return false;
    }
  } catch (error) {
    console.error(`❌ Error backing up ${filePath}:`, error.message);
    return false;
  }
}

// Main function to fix git pull issues
async function fixGitPull() {
  console.log('🔧 Starting git pull fix...');
  
  // List of files that might cause conflicts
  const potentialConflictFiles = [
    'public/index.html',
    'public/article.html',
    'public/admin.html',
    'enhanced-server.js'
  ];
  
  // Backup and remove conflicting files
  for (const file of potentialConflictFiles) {
    const filePath = path.join(process.cwd(), file);
    if (fs.existsSync(filePath)) {
      console.log(`🔍 Found potentially conflicting file: ${file}`);
      
      // Backup the file
      backupFile(filePath);
      
      // Remove the file
      try {
        fs.unlinkSync(filePath);
        console.log(`✅ Removed ${file}`);
      } catch (error) {
        console.error(`❌ Error removing ${file}:`, error.message);
      }
    }
  }
  
  // Try to pull from git
  console.log('\n🔄 Attempting git pull...');
  const pullResult = executeCommand('git pull origin main');
  
  if (pullResult.success) {
    console.log('✅ Git pull successful!');
    console.log(pullResult.output);
    
    // Run the update script to apply our changes
    console.log('\n🚀 Running website update script...');
    try {
      require('./update-website');
    } catch (error) {
      console.error('❌ Error running update script:', error.message);
      console.log('\nℹ️ You can manually run the update script with:');
      console.log('  node update-website.js');
    }
  } else {
    console.error('❌ Git pull failed:');
    console.error(pullResult.error);
    console.log('\nℹ️ You may need to resolve conflicts manually.');
  }
}

// Run the fix
fixGitPull();
