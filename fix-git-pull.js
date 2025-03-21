// Script to fix git pull issues
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('Fixing git pull issues...');

try {
  // Check if public/index.html exists
  console.log('Checking if public/index.html exists...');
  if (fs.existsSync(path.join(process.cwd(), 'public', 'index.html'))) {
    console.log('public/index.html exists, backing it up...');
    
    // Create a backup directory if it doesn't exist
    const backupDir = path.join(process.cwd(), 'backup');
    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir, { recursive: true });
    }
    
    // Backup the file
    fs.copyFileSync(
      path.join(process.cwd(), 'public', 'index.html'),
      path.join(backupDir, 'index.html.backup')
    );
    
    console.log('✅ Backup created at backup/index.html.backup');
    
    // Remove the file
    fs.unlinkSync(path.join(process.cwd(), 'public', 'index.html'));
    console.log('✅ public/index.html removed');
  } else {
    console.log('public/index.html does not exist, no need to back up');
  }
  
  // Pull the latest changes
  console.log('\nPulling latest changes from GitHub...');
  execSync('git pull origin main', { stdio: 'inherit' });
  console.log('✅ Successfully pulled latest changes');
  
  // Run the update-enhanced-server.js script
  console.log('\nUpdating to enhanced server...');
  execSync('node update-enhanced-server.js', { stdio: 'inherit' });
  
  // Add sample articles
  console.log('\nAdding sample articles...');
  execSync('node add-sample-article.js', { stdio: 'inherit' });
  
  console.log('\n✅ All done! Your website should now be fully functional.');
  console.log('You can access the website at http://yourdomain.com/');
  console.log('Admin login: http://yourdomain.com/login');
  console.log('Username: admin');
  console.log('Password: admin123');
} catch (err) {
  console.error('❌ Error:', err.message);
  
  // Provide manual instructions
  console.log('\nIf the automatic fix failed, you can try these manual steps:');
  console.log('1. Remove the problematic file:');
  console.log('   rm -f public/index.html');
  console.log('2. Pull the latest changes:');
  console.log('   git pull origin main');
  console.log('3. Update to the enhanced server:');
  console.log('   node update-enhanced-server.js');
  console.log('4. Add sample articles:');
  console.log('   node add-sample-article.js');
}
