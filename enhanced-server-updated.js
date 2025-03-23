// Enhanced server script with admin login and dashboard
const http = require('http');
const fs = require('fs');
const path = require('path');
const { Client } = require('pg');
const crypto = require('crypto');
const querystring = require('querystring');

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

// Site configuration (stored in memory for simplicity, in production use a database)
const siteConfig = {
  siteName: 'floca.id',
  logo: '/images/default-logo.png',
  theme: {
    primaryColor: '#0066cc',
    secondaryColor: '#333333',
    accentColor: '#4CAF50',
    fontFamily: 'Arial, sans-serif'
  }
};

// Secret for JWT
const JWT_SECRET = 'your-super-secret-key-here';

// In-memory session store (in production, use Redis or a database)
const sessions = {};

// Create HTTP server
const server = http.createServer(async (req, res) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  
  try {
    // Parse URL
    const url = new URL(req.url, `http://${req.headers.host}`);
    const pathname = url.pathname;
    
    // Parse cookies
    const cookies = parseCookies(req.headers.cookie || '');
    const sessionId = cookies.sessionId;
    const session = sessionId ? sessions[sessionId] : null;
    
    // Handle CORS preflight requests
    if (req.method === 'OPTIONS') {
      res.writeHead(204, {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Access-Control-Max-Age': '86400'
      });
      return res.end();
    }
    
    // Handle POST requests
    if (req.method === 'POST') {
      let body = '';
      req.on('data', chunk => {
        body += chunk.toString();
      });
      
      return req.on('end', async () => {
        // Parse the POST data
        let postData;
        const contentType = req.headers['content-type'];
        
        if (contentType && contentType.includes('application/json')) {
          try {
            postData = JSON.parse(body);
          } catch (err) {
            return sendJson(res, { error: 'Invalid JSON' }, 400);
          }
        } else if (contentType && contentType.includes('application/x-www-form-urlencoded')) {
          postData = querystring.parse(body);
        } else {
          return sendJson(res, { error: 'Unsupported content type' }, 415);
        }
        
        // Handle login
        if (pathname === '/api/login') {
          return await handleLogin(req, res, postData);
        }
        
        // Handle article creation/update
        if (pathname === '/api/articles' && session && session.isAdmin) {
          return await handleCreateArticle(req, res, postData, session);
        }
        
        // Handle article update
        if (pathname.startsWith('/api/articles/') && req.method === 'POST' && session && session.isAdmin) {
          const id = pathname.slice(14);
          return await handleUpdateArticle(req, res, id, postData, session);
        }
        
        // Handle article deletion
        if (pathname.startsWith('/api/articles/') && req.method === 'DELETE' && session && session.isAdmin) {
          const id = pathname.slice(14);
          return await handleDeleteArticle(req, res, id, session);
        }
        
        // Handle site configuration update
        if (pathname === '/api/config' && session && session.isAdmin) {
          return handleUpdateSiteConfig(req, res, postData, session);
        }
        
        // Handle logo upload
        if (pathname === '/api/upload/logo' && session && session.isAdmin) {
          return handleLogoUpload(req, res, postData, session);
        }
        
        return sendJson(res, { error: 'Not found' }, 404);
      });
    }
    
    // API routes (GET)
    if (pathname === '/api/articles') {
      return await handleGetArticles(req, res, url.searchParams);
    } else if (pathname.startsWith('/api/articles/') && pathname.length > 14) {
      const id = pathname.slice(14);
      return await handleGetArticleById(req, res, id);
    } else if (pathname === '/api/check-auth') {
      return handleCheckAuth(req, res, session);
    } else if (pathname === '/api/config') {
      return handleGetSiteConfig(req, res);
    } else if (pathname === '/api/featured-articles') {
      return await handleGetFeaturedArticles(req, res);
    }
    
    // Admin dashboard
    if (pathname === '/admin' || pathname.startsWith('/admin/')) {
      // Check if user is logged in
      if (!session || !session.isAdmin) {
        return redirectTo(res, '/login');
      }
      
      return serveFile(res, 'public/admin.html', 'text/html');
    }
    
    // Login page
    if (pathname === '/login') {
      return serveFile(res, 'public/login.html', 'text/html');
    }
    
    // Article page
    if (pathname.startsWith('/article/')) {
      return serveFile(res, 'public/article.html', 'text/html');
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

// Parse cookies
function parseCookies(cookieHeader) {
  const cookies = {};
  if (!cookieHeader) return cookies;
  
  cookieHeader.split(';').forEach(cookie => {
    const parts = cookie.split('=');
    const name = parts[0].trim();
    const value = parts[1] ? parts[1].trim() : '';
    cookies[name] = value;
  });
  
  return cookies;
}

// Send JSON response
function sendJson(res, data, statusCode = 200) {
  res.writeHead(statusCode, { 
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE',
    'Access-Control-Allow-Headers': 'Content-Type'
  });
  res.end(JSON.stringify(data));
}

// Redirect to another URL
function redirectTo(res, url) {
  res.writeHead(302, { 'Location': url });
  res.end();
}

// Generate a session ID
function generateSessionId() {
  return crypto.randomBytes(32).toString('hex');
}

// Set a cookie
function setCookie(res, name, value, options = {}) {
  const cookieOptions = {
    httpOnly: true,
    path: '/',
    maxAge: 86400, // 1 day
    ...options
  };
  
  let cookie = `${name}=${value}`;
  
  if (cookieOptions.httpOnly) {
    cookie += '; HttpOnly';
  }
  
  if (cookieOptions.path) {
    cookie += `; Path=${cookieOptions.path}`;
  }
  
  if (cookieOptions.maxAge) {
    cookie += `; Max-Age=${cookieOptions.maxAge}`;
  }
  
  if (cookieOptions.secure) {
    cookie += '; Secure';
  }
  
  if (cookieOptions.sameSite) {
    cookie += `; SameSite=${cookieOptions.sameSite}`;
  }
  
  res.setHeader('Set-Cookie', cookie);
}

// API handler for getting all articles
async function handleGetArticles(req, res, searchParams) {
  let client = null;
  
  try {
    client = new Client(DB_CONFIG);
    await client.connect();
    
    let query = 'SELECT * FROM schemaflo.article';
    const queryParams = [];
    
    // Check if we're filtering by slug
    const slug = searchParams.get('slug');
    if (slug) {
      query += ' WHERE slug = $1';
      queryParams.push(slug);
    }
    
    // Add order by
    query += ' ORDER BY "createdAt" DESC';
    
    const result = await client.query(query, queryParams);
    
    sendJson(res, result.rows);
  } catch (err) {
    console.error('Error fetching articles:', err);
    sendJson(res, { error: 'Failed to fetch articles' }, 500);
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

// API handler for getting featured articles
async function handleGetFeaturedArticles(req, res) {
  let client = null;
  
  try {
    client = new Client(DB_CONFIG);
    await client.connect();
    
    const result = await client.query('SELECT * FROM schemaflo.article WHERE featured = true ORDER BY "createdAt" DESC LIMIT 5');
    
    sendJson(res, result.rows);
  } catch (err) {
    console.error('Error fetching featured articles:', err);
    sendJson(res, { error: 'Failed to fetch featured articles' }, 500);
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
      return sendJson(res, { error: 'Article not found' }, 404);
    }
    
    sendJson(res, result.rows[0]);
  } catch (err) {
    console.error('Error fetching article:', err);
    sendJson(res, { error: 'Failed to fetch article' }, 500);
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

// API handler for login
async function handleLogin(req, res, data) {
  let client = null;
  
  try {
    // Check if username and password are provided
    if (!data.username || !data.password) {
      return sendJson(res, { error: 'Username and password are required' }, 400);
    }
    
    client = new Client(DB_CONFIG);
    await client.connect();
    
    // In a real application, you would hash the password and compare with the hashed password in the database
    // For simplicity, we're using a hardcoded admin user
    if (data.username === 'admin' && data.password === 'admin123') {
      // Create a session
      const sessionId = generateSessionId();
      sessions[sessionId] = {
        username: data.username,
        isAdmin: true,
        createdAt: new Date()
      };
      
      // Set a cookie with the session ID
      setCookie(res, 'sessionId', sessionId);
      
      return sendJson(res, { success: true, redirectTo: '/admin' });
    }
    
    // Invalid credentials
    sendJson(res, { error: 'Invalid username or password' }, 401);
  } catch (err) {
    console.error('Error logging in:', err);
    sendJson(res, { error: 'Failed to log in' }, 500);
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

// API handler for checking authentication
function handleCheckAuth(req, res, session) {
  if (session && session.isAdmin) {
    return sendJson(res, { isAuthenticated: true, username: session.username });
  }
  
  sendJson(res, { isAuthenticated: false });
}

// API handler for getting site configuration
function handleGetSiteConfig(req, res) {
  sendJson(res, siteConfig);
}

// API handler for updating site configuration
function handleUpdateSiteConfig(req, res, data, session) {
  try {
    // Update site configuration
    if (data.siteName) {
      siteConfig.siteName = data.siteName;
    }
    
    if (data.theme) {
      siteConfig.theme = {
        ...siteConfig.theme,
        ...data.theme
      };
    }
    
    sendJson(res, { success: true, config: siteConfig });
  } catch (err) {
    console.error('Error updating site configuration:', err);
    sendJson(res, { error: 'Failed to update site configuration' }, 500);
  }
}

// API handler for logo upload
function handleLogoUpload(req, res, data, session) {
  try {
    // In a real application, you would handle file uploads and store the file
    // For simplicity, we're just updating the logo URL
    if (data.logoUrl) {
      siteConfig.logo = data.logoUrl;
      return sendJson(res, { success: true, logo: siteConfig.logo });
    }
    
    sendJson(res, { error: 'No logo URL provided' }, 400);
  } catch (err) {
    console.error('Error uploading logo:', err);
    sendJson(res, { error: 'Failed to upload logo' }, 500);
  }
}

// API handler for creating an article
async function handleCreateArticle(req, res, data, session) {
  let client = null;
  
  try {
    // Check if required fields are provided
    if (!data.title || !data.content || !data.slug) {
      return sendJson(res, { error: 'Title, content, and slug are required' }, 400);
    }
    
    client = new Client(DB_CONFIG);
    await client.connect();
    
    // Check if slug already exists
    const slugCheck = await client.query('SELECT id FROM schemaflo.article WHERE slug = $1', [data.slug]);
    if (slugCheck.rows.length > 0) {
      return sendJson(res, { error: 'Slug already exists' }, 400);
    }
    
    // Create the article
    const result = await client.query(`
      INSERT INTO schemaflo.article (
        title, content, excerpt, slug, category, status, featured, "imageUrl", "authorId", "createdAt", "updatedAt"
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, NOW(), NOW()
      ) RETURNING *
    `, [
      data.title,
      data.content,
      data.excerpt || '',
      data.slug,
      data.category || 'Uncategorized',
      data.status || 'published',
      data.featured || false,
      data.imageUrl || '',
      '1' // Default author ID
    ]);
    
    sendJson(res, result.rows[0]);
  } catch (err) {
    console.error('Error creating article:', err);
    sendJson(res, { error: 'Failed to create article' }, 500);
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

// API handler for updating an article
async function handleUpdateArticle(req, res, id, data, session) {
  let client = null;
  
  try {
    // Check if required fields are provided
    if (!data.title || !data.content || !data.slug) {
      return sendJson(res, { error: 'Title, content, and slug are required' }, 400);
    }
    
    client = new Client(DB_CONFIG);
    await client.connect();
    
    // Check if article exists
    const articleCheck = await client.query('SELECT id FROM schemaflo.article WHERE id = $1', [id]);
    if (articleCheck.rows.length === 0) {
      return sendJson(res, { error: 'Article not found' }, 404);
    }
    
    // Check if slug already exists for another article
    const slugCheck = await client.query('SELECT id FROM schemaflo.article WHERE slug = $1 AND id != $2', [data.slug, id]);
    if (slugCheck.rows.length > 0) {
      return sendJson(res, { error: 'Slug already exists for another article' }, 400);
    }
    
    // Update the article
    const result = await client.query(`
      UPDATE schemaflo.article SET
        title = $1,
        content = $2,
        excerpt = $3,
        slug = $4,
        category = $5,
        status = $6,
        featured = $7,
        "imageUrl" = $8,
        "updatedAt" = NOW()
      WHERE id = $9
      RETURNING *
    `, [
      data.title,
      data.content,
      data.excerpt || '',
      data.slug,
      data.category || 'Uncategorized',
      data.status || 'published',
      data.featured || false,
      data.imageUrl || '',
      id
    ]);
    
    sendJson(res, result.rows[0]);
  } catch (err) {
    console.error('Error updating article:', err);
    sendJson(res, { error: 'Failed to update article' }, 500);
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

// API handler for deleting an article
async function handleDeleteArticle(req, res, id, session) {
  let client = null;
  
  try {
    client = new Client(DB_CONFIG);
    await client.connect();
    
    // Check if article exists
    const articleCheck = await client.query('SELECT id FROM schemaflo.article WHERE id = $1', [id]);
    if (articleCheck.rows.length === 0) {
      return sendJson(res, { error: 'Article not found' }, 404);
    }
    
    // Delete the article
    await client.query('DELETE FROM schemaflo.article WHERE id = $1', [id]);
    
    sendJson(res, { success: true });
  } catch (err) {
    console.error('Error deleting article:', err);
    sendJson(res, { error: 'Failed to delete article' }, 500);
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
