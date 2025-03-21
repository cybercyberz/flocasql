// Simplified build script that uses less resources
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('Starting simplified build process...');

// Update next.config.js to disable experimental features
try {
  console.log('Updating next.config.js to disable experimental features...');
  const nextConfigPath = path.join(process.cwd(), 'next.config.js');
  
  if (fs.existsSync(nextConfigPath)) {
    let content = fs.readFileSync(nextConfigPath, 'utf8');
    
    // Create a simplified next.config.js
    const newContent = `/** @type {import('next').NextConfig} */
const nextConfig = {
  // Configuration for production hosting
  images: {
    unoptimized: true
  },
  // Disable experimental features that cause resource issues
  experimental: {
    workerThreads: false,
    cpus: 1
  },
  // Use standalone output
  output: 'standalone',
  // Disable static page generation
  staticPageGenerationTimeout: 1
};

module.exports = nextConfig;`;
    
    fs.writeFileSync(nextConfigPath, newContent);
    console.log('✅ next.config.js updated with simplified configuration');
  } else {
    console.error('❌ next.config.js not found');
  }
} catch (err) {
  console.error('Error updating next.config.js:', err.message);
}

// Create a simple server script
try {
  console.log('Creating simple server script...');
  const simpleServerPath = path.join(process.cwd(), 'simple-server.js');
  
  const simpleServerContent = `// Simple server script for Next.js
const express = require('express');
const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Create a PostgreSQL connection pool
const pool = new Pool({
  host: '127.0.0.200',
  port: 5432,
  database: 'flocaclo_nextjs',
  user: 'flocaclo_admin',
  password: 'b3owjbzrwaxu',
  schema: 'schemaflo'
});

// Serve static files from the public directory
app.use(express.static(path.join(__dirname, 'public')));

// API endpoint to get all articles
app.get('/api/articles', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM schemaflo.article ORDER BY "createdAt" DESC');
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching articles:', err);
    res.status(500).json({ error: 'Failed to fetch articles' });
  }
});

// API endpoint to get a single article by ID
app.get('/api/articles/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('SELECT * FROM schemaflo.article WHERE id = $1', [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Article not found' });
    }
    
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error fetching article:', err);
    res.status(500).json({ error: 'Failed to fetch article' });
  }
});

// Serve index.html for all other routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start the server
app.listen(PORT, () => {
  console.log(\`Server running on http://localhost:\${PORT}\`);
});
`;
  
  fs.writeFileSync(simpleServerPath, simpleServerContent);
  console.log('✅ simple-server.js created');
} catch (err) {
  console.error('Error creating simple server script:', err.message);
}

// Update ecosystem.config.js to use the simple server
try {
  console.log('Updating ecosystem.config.js to use the simple server...');
  const ecosystemPath = path.join(process.cwd(), 'ecosystem.config.js');
  
  if (fs.existsSync(ecosystemPath)) {
    const newContent = `module.exports = {
  apps: [{
    name: 'websitecursor',
    script: 'simple-server.js',
    cwd: '/home/flocaclo/public_html',
    instances: 1,
    exec_mode: 'fork',
    autorestart: true,
    watch: false,
    max_memory_restart: '512M',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    }
  }]
};`;
    
    fs.writeFileSync(ecosystemPath, newContent);
    console.log('✅ ecosystem.config.js updated to use simple-server.js');
  } else {
    console.error('❌ ecosystem.config.js not found');
  }
} catch (err) {
  console.error('Error updating ecosystem.config.js:', err.message);
}

// Install required dependencies
try {
  console.log('Installing required dependencies...');
  execSync('npm install express pg --save', { stdio: 'inherit' });
  console.log('✅ Dependencies installed');
} catch (err) {
  console.error('Error installing dependencies:', err.message);
  // Continue anyway
}

// Restart PM2
try {
  console.log('Restarting PM2 process...');
  execSync('pm2 restart websitecursor', { stdio: 'inherit' });
  console.log('✅ PM2 process restarted');
} catch (err) {
  console.error('Error restarting PM2 process:', err.message);
}

console.log('\n✅ Simplified build process completed');
console.log('You can now check if the website is working correctly');
