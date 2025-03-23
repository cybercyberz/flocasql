// Script to push changes to GitHub
const { execSync } = require('child_process');

// Function to execute a command and return the output
function executeCommand(command) {
  try {
    console.log(`Executing: ${command}`);
    const output = execSync(command, { encoding: 'utf8' });
    return { success: true, output };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

// Function to check git status
function checkGitStatus() {
  console.log('🔍 Checking git status...');
  
  const result = executeCommand('git status');
  
  if (result.success) {
    console.log('✅ Git status checked successfully');
    return result.output;
  } else {
    console.error('❌ Error checking git status:', result.error);
    return null;
  }
}

// Function to add files to git
function addFiles() {
  console.log('\n📂 Adding files to git...');
  
  // List of files to add
  const filesToAdd = [
    'enhanced-server-updated.js',
    'public/index-updated.html',
    'public/article-updated.html',
    'public/admin-updated.html',
    'update-website.js',
    'fix-git-pull.js',
    'fix-website.js',
    'check-website-errors.js',
    'push-to-github.js'
  ];
  
  // Add each file
  for (const file of filesToAdd) {
    const result = executeCommand(`git add ${file}`);
    
    if (result.success) {
      console.log(`✅ Added ${file} to git`);
    } else {
      console.error(`❌ Error adding ${file} to git:`, result.error);
    }
  }
}

// Function to commit changes
function commitChanges() {
  console.log('\n💾 Committing changes...');
  
  const commitMessage = 'Add website fixes and enhancements';
  const result = executeCommand(`git commit -m "${commitMessage}"`);
  
  if (result.success) {
    console.log('✅ Changes committed successfully');
    return true;
  } else {
    console.error('❌ Error committing changes:', result.error);
    return false;
  }
}

// Function to push changes to GitHub
function pushToGitHub() {
  console.log('\n🚀 Pushing changes to GitHub...');
  
  const result = executeCommand('git push origin main');
  
  if (result.success) {
    console.log('✅ Changes pushed to GitHub successfully');
    console.log(result.output);
    return true;
  } else {
    console.error('❌ Error pushing changes to GitHub:', result.error);
    return false;
  }
}

// Main function to push changes to GitHub
async function pushChangesToGitHub() {
  console.log('🚀 Starting push to GitHub...');
  
  // Check git status
  const status = checkGitStatus();
  
  if (status && status.includes('nothing to commit')) {
    console.log('ℹ️ No changes to commit');
    return;
  }
  
  // Add files to git
  addFiles();
  
  // Commit changes
  const commitSuccess = commitChanges();
  
  if (!commitSuccess) {
    console.error('❌ Failed to commit changes. Aborting push.');
    return;
  }
  
  // Push changes to GitHub
  const pushSuccess = pushToGitHub();
  
  if (pushSuccess) {
    console.log('\n✅ Changes pushed to GitHub successfully!');
    console.log('\nTo pull these changes on your hosting server, run:');
    console.log('  git pull origin main');
    console.log('\nThen run the fix script:');
    console.log('  node fix-website.js');
    console.log('\nAnd restart the server:');
    console.log('  pm2 restart ecosystem.config.js');
  } else {
    console.error('\n❌ Failed to push changes to GitHub.');
    console.log('\nYou can try pushing manually with:');
    console.log('  git push origin main');
  }
}

// Run the push
pushChangesToGitHub();
