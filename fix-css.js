// Script to fix CSS processing issues
const fs = require('fs');
const path = require('path');

console.log('Starting fix for CSS processing issues...');

// Fix globals.css
try {
  console.log('Checking src/app/globals.css...');
  const globalsCssPath = path.join(process.cwd(), 'src', 'app', 'globals.css');
  
  if (fs.existsSync(globalsCssPath)) {
    let content = fs.readFileSync(globalsCssPath, 'utf8');
    
    // Check if the file has Tailwind directives
    if (content.includes('@tailwind')) {
      console.log('globals.css already has correct Tailwind directives');
    } else {
      console.log('Fixing Tailwind directives in globals.css...');
      
      // Replace any incorrect Tailwind directives
      content = content.replace(/tailwind base/g, '@tailwind base');
      content = content.replace(/tailwind components/g, '@tailwind components');
      content = content.replace(/tailwind utilities/g, '@tailwind utilities');
      
      // Write the updated content back to the file
      fs.writeFileSync(globalsCssPath, content);
      
      console.log('✅ globals.css updated with correct Tailwind directives');
    }
  } else {
    console.error('❌ globals.css not found');
    
    // Create the file if it doesn't exist
    console.log('Creating globals.css...');
    const newContent = `@tailwind base;
@tailwind components;
@tailwind utilities;

:root {
  --background: #ffffff;
  --foreground: #171717;
}

@media (prefers-color-scheme: dark) {
  :root {
    --background: #0a0a0a;
    --foreground: #ededed;
  }
}

body {
  color: var(--foreground);
  background: var(--background);
  font-family: Arial, Helvetica, sans-serif;
}`;
    
    fs.writeFileSync(globalsCssPath, newContent);
    console.log('✅ globals.css created with correct Tailwind directives');
  }
} catch (err) {
  console.error('Error fixing globals.css:', err.message);
}

// Check if fixed-globals.css exists and copy it to globals.css
try {
  console.log('Checking for fixed-globals.css...');
  const fixedGlobalsCssPath = path.join(process.cwd(), 'fixed-globals.css');
  const globalsCssPath = path.join(process.cwd(), 'src', 'app', 'globals.css');
  
  if (fs.existsSync(fixedGlobalsCssPath)) {
    console.log('Copying fixed-globals.css to globals.css...');
    const content = fs.readFileSync(fixedGlobalsCssPath, 'utf8');
    fs.writeFileSync(globalsCssPath, content);
    console.log('✅ fixed-globals.css copied to globals.css');
  }
} catch (err) {
  console.error('Error copying fixed-globals.css:', err.message);
}

// Check if postcss.config.js exists and is correctly configured
try {
  console.log('Checking postcss.config.js...');
  const postcssConfigPath = path.join(process.cwd(), 'postcss.config.js');
  
  if (fs.existsSync(postcssConfigPath)) {
    let content = fs.readFileSync(postcssConfigPath, 'utf8');
    
    // Check if the file has Tailwind plugin
    if (content.includes('tailwindcss')) {
      console.log('postcss.config.js already has Tailwind plugin');
    } else {
      console.log('Adding Tailwind plugin to postcss.config.js...');
      
      // Create a new postcss.config.js file
      const newContent = `module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}`;
      
      fs.writeFileSync(postcssConfigPath, newContent);
      console.log('✅ postcss.config.js updated with Tailwind plugin');
    }
  } else {
    console.log('Creating postcss.config.js...');
    
    // Create a new postcss.config.js file
    const newContent = `module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}`;
    
    fs.writeFileSync(postcssConfigPath, newContent);
    console.log('✅ postcss.config.js created with Tailwind plugin');
  }
} catch (err) {
  console.error('Error fixing postcss.config.js:', err.message);
}

// Check if tailwind.config.js exists and is correctly configured
try {
  console.log('Checking tailwind.config.js...');
  const tailwindConfigPath = path.join(process.cwd(), 'tailwind.config.js');
  
  if (fs.existsSync(tailwindConfigPath)) {
    console.log('tailwind.config.js already exists');
  } else {
    console.log('Creating tailwind.config.js...');
    
    // Create a new tailwind.config.js file
    const newContent = `/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: '#3490dc',
        secondary: '#ffed4a',
        danger: '#e3342f',
      },
    },
  },
  plugins: [],
}`;
    
    fs.writeFileSync(tailwindConfigPath, newContent);
    console.log('✅ tailwind.config.js created');
  }
} catch (err) {
  console.error('Error fixing tailwind.config.js:', err.message);
}

console.log('\n✅ CSS processing issues fixed');
console.log('Please restart the PM2 process: pm2 restart websitecursor');
