// Script to update the website files
const fs = require('fs');
const path = require('path');

// Function to copy a file
function copyFile(source, destination) {
  try {
    const content = fs.readFileSync(source);
    fs.writeFileSync(destination, content);
    console.log(`✅ Copied ${source} to ${destination}`);
    return true;
  } catch (error) {
    console.error(`❌ Error copying ${source} to ${destination}:`, error.message);
    return false;
  }
}

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

// Main function to update the website
function updateWebsite() {
  console.log('🚀 Starting website update...');
  
  // Define the files to update
  const filesToUpdate = [
    { source: 'enhanced-server-updated.js', destination: 'enhanced-server.js' },
    { source: 'public/index-updated.html', destination: 'public/index.html' },
    { source: 'public/article-updated.html', destination: 'public/article.html' },
    { source: 'public/admin-updated.html', destination: 'public/admin.html' }
  ];
  
  // Create public/images directory if it doesn't exist
  const imagesDir = path.join(process.cwd(), 'public', 'images');
  if (!ensureDirectoryExists(imagesDir)) {
    console.error('❌ Failed to create images directory. Aborting update.');
    return;
  }
  
  // Create a default logo if it doesn't exist
  const defaultLogoPath = path.join(imagesDir, 'default-logo.png');
  if (!fs.existsSync(defaultLogoPath)) {
    try {
      // Create a simple 1x1 transparent PNG
      const transparentPixel = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=', 'base64');
      fs.writeFileSync(defaultLogoPath, transparentPixel);
      console.log(`✅ Created default logo at ${defaultLogoPath}`);
    } catch (error) {
      console.error(`❌ Error creating default logo:`, error.message);
    }
  }
  
  // Update each file
  let successCount = 0;
  for (const file of filesToUpdate) {
    const sourcePath = path.join(process.cwd(), file.source);
    const destinationPath = path.join(process.cwd(), file.destination);
    
    if (fs.existsSync(sourcePath)) {
      if (copyFile(sourcePath, destinationPath)) {
        successCount++;
      }
    } else {
      console.error(`❌ Source file not found: ${sourcePath}`);
    }
  }
  
  // Update the ecosystem.config.js file to use the enhanced server
  try {
    const ecosystemPath = path.join(process.cwd(), 'ecosystem.config.js');
    if (fs.existsSync(ecosystemPath)) {
      let ecosystemContent = fs.readFileSync(ecosystemPath, 'utf8');
      
      // Replace the script path if it's not already using enhanced-server.js
      if (!ecosystemContent.includes('enhanced-server.js')) {
        ecosystemContent = ecosystemContent.replace(
          /script: ['"]([^'"]+)['"]/,
          'script: "enhanced-server.js"'
        );
        
        fs.writeFileSync(ecosystemPath, ecosystemContent);
        console.log('✅ Updated ecosystem.config.js to use enhanced-server.js');
        successCount++;
      } else {
        console.log('ℹ️ ecosystem.config.js already using enhanced-server.js');
      }
    }
  } catch (error) {
    console.error('❌ Error updating ecosystem.config.js:', error.message);
  }
  
  // Final status
  console.log(`\n📋 Update summary: ${successCount} of ${filesToUpdate.length + 1} operations completed successfully.`);
  console.log('\n✨ Website update completed!');
  console.log('\nTo restart the server, run:');
  console.log('  pm2 restart ecosystem.config.js');
}

// Run the update
updateWebsite();
