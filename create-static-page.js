// Script to create a simple static HTML page
const fs = require('fs');
const path = require('path');

console.log('Creating static HTML page...');

// Create public directory if it doesn't exist
try {
  const publicDir = path.join(process.cwd(), 'public');
  if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir, { recursive: true });
    console.log('✅ Created public directory');
  }
} catch (err) {
  console.error('Error creating public directory:', err.message);
}

// Create a simple index.html file
try {
  const indexPath = path.join(process.cwd(), 'public', 'index.html');
  
  const indexContent = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Website Cursor</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      line-height: 1.6;
      margin: 0;
      padding: 20px;
      color: #333;
      max-width: 1200px;
      margin: 0 auto;
    }
    header {
      background-color: #f4f4f4;
      padding: 20px;
      margin-bottom: 20px;
      border-radius: 5px;
    }
    h1 {
      color: #333;
      margin-bottom: 10px;
    }
    .article {
      background: #fff;
      padding: 20px;
      margin-bottom: 20px;
      border-radius: 5px;
      box-shadow: 0 2px 5px rgba(0,0,0,0.1);
    }
    .article h2 {
      margin-top: 0;
      color: #333;
    }
    .article-meta {
      color: #777;
      font-size: 0.9em;
      margin-bottom: 10px;
    }
    .loading {
      text-align: center;
      padding: 20px;
      font-style: italic;
      color: #777;
    }
    .error {
      background-color: #ffebee;
      color: #c62828;
      padding: 10px;
      border-radius: 5px;
      margin-bottom: 20px;
    }
  </style>
</head>
<body>
  <header>
    <h1>Website Cursor</h1>
    <p>Welcome to our website!</p>
  </header>
  
  <div id="articles-container">
    <div class="loading">Loading articles...</div>
  </div>

  <script>
    // Function to fetch articles from the API
    async function fetchArticles() {
      try {
        const response = await fetch('/api/articles');
        
        if (!response.ok) {
          throw new Error('Failed to fetch articles');
        }
        
        const articles = await response.json();
        displayArticles(articles);
      } catch (error) {
        console.error('Error fetching articles:', error);
        document.getElementById('articles-container').innerHTML = \`
          <div class="error">
            <strong>Error:</strong> Failed to load articles. Please try again later.
          </div>
        \`;
      }
    }
    
    // Function to display articles
    function displayArticles(articles) {
      const container = document.getElementById('articles-container');
      
      if (articles.length === 0) {
        container.innerHTML = '<p>No articles found.</p>';
        return;
      }
      
      const articlesHTML = articles.map(article => \`
        <div class="article">
          <h2>\${article.title}</h2>
          <div class="article-meta">
            <span>By \${article.author || 'Unknown'}</span> | 
            <span>\${new Date(article.createdAt).toLocaleDateString()}</span>
          </div>
          <p>\${article.excerpt || article.content.substring(0, 150)}...</p>
        </div>
      \`).join('');
      
      container.innerHTML = articlesHTML;
    }
    
    // Fetch articles when the page loads
    document.addEventListener('DOMContentLoaded', fetchArticles);
  </script>
</body>
</html>`;
  
  fs.writeFileSync(indexPath, indexContent);
  console.log('✅ Created index.html');
} catch (err) {
  console.error('Error creating index.html:', err.message);
}

console.log('\n✅ Static HTML page created');
console.log('You can now run the simple server to serve this page');
