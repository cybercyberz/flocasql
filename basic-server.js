// Basic server script with minimal dependencies
const http = require('http');
const fs = require('fs');
const path = require('path');
const { Client } = require('pg');

// Configuration
const PORT = process.env.PORT || 3000;
const DB_CONFIG = {
  host: '127.0.0.200',
  port: 5432,
  database: 'flocaclo_nextjs',
  user: 'flocaclo_admin',
  password: 'b3owjbzrwaxu',
  schema: 'schemaflo'
};

// Create HTTP server
const server = http.createServer(async (req, res) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  
  try {
    // Parse URL
    const url = new URL(req.url, `http://${req.headers.host}`);
    const pathname = url.pathname;
    
    // API routes
    if (pathname === '/api/articles') {
      return await handleGetArticles(req, res);
    } else if (pathname.startsWith('/api/articles/') && pathname.length > 14) {
      const id = pathname.slice(14);
      return await handleGetArticleById(req, res, id);
    }
    
    // Serve static files
    if (pathname === '/' || pathname === '/index.html') {
      return serveFile(res, 'public/index.html', 'text/html');
    }
    
    // Check if file exists in public directory
    const filePath = path.join(process.cwd(), 'public', pathname.slice(1));
    if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
      const contentType = getContentType(filePath);
      return serveFile(res, filePath, contentType);
    }
    
    // Fallback to index.html for all other routes
    return serveFile(res, 'public/index.html', 'text/html');
  } catch (err) {
    console.error('Server error:', err);
    res.writeHead(500, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Internal server error' }));
  }
});

// Start server
server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

// Handle errors
server.on('error', (err) => {
  console.error('Server error:', err);
});

// Helper function to serve a file
function serveFile(res, filePath, contentType) {
  try {
    const fullPath = path.join(process.cwd(), filePath);
    if (!fs.existsSync(fullPath)) {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      return res.end('File not found');
    }
    
    const content = fs.readFileSync(fullPath);
    res.writeHead(200, { 'Content-Type': contentType });
    res.end(content);
  } catch (err) {
    console.error('Error serving file:', err);
    res.writeHead(500, { 'Content-Type': 'text/plain' });
    res.end('Internal server error');
  }
}

// Get content type based on file extension
function getContentType(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  const types = {
    '.html': 'text/html',
    '.js': 'text/javascript',
    '.css': 'text/css',
    '.json': 'application/json',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml'
  };
  
  return types[ext] || 'text/plain';
}

// API handler for getting all articles
async function handleGetArticles(req, res) {
  let client = null;
  
  try {
    client = new Client(DB_CONFIG);
    await client.connect();
    
    const result = await client.query('SELECT * FROM schemaflo.article ORDER BY "createdAt" DESC');
    
    res.writeHead(200, { 
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*'
    });
    res.end(JSON.stringify(result.rows));
  } catch (err) {
    console.error('Error fetching articles:', err);
    res.writeHead(500, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Failed to fetch articles' }));
  } finally {
    if (client) {
      try {
        await client.end();
      } catch (err) {
        console.error('Error closing database connection:', err);
      }
    }
  }
}

// API handler for getting an article by ID
async function handleGetArticleById(req, res, id) {
  let client = null;
  
  try {
    client = new Client(DB_CONFIG);
    await client.connect();
    
    const result = await client.query('SELECT * FROM schemaflo.article WHERE id = $1', [id]);
    
    if (result.rows.length === 0) {
      res.writeHead(404, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({ error: 'Article not found' }));
    }
    
    res.writeHead(200, { 
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*'
    });
    res.end(JSON.stringify(result.rows[0]));
  } catch (err) {
    console.error('Error fetching article:', err);
    res.writeHead(500, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Failed to fetch article' }));
  } finally {
    if (client) {
      try {
        await client.end();
      } catch (err) {
        console.error('Error closing database connection:', err);
      }
    }
  }
}
