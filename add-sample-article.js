// Script to add a sample article to the database
const { Client } = require('pg');

// Configuration
const DB_CONFIG = {
  host: '127.0.0.200',
  port: 5432,
  database: 'flocaclo_nextjs',
  user: 'flocaclo_admin',
  password: 'b3owjbzrwaxu',
  schema: 'schemaflo'
};

async function addSampleArticle() {
  let client = null;
  
  try {
    console.log('Connecting to database...');
    client = new Client(DB_CONFIG);
    await client.connect();
    console.log('✅ Connected to database');
    
    // Check if the article table exists
    console.log('Checking if article table exists...');
    const tableCheck = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'schemaflo' 
        AND table_name = 'article'
      );
    `);
    
    if (!tableCheck.rows[0].exists) {
      console.log('❌ Article table does not exist');
      console.log('Creating article table...');
      
      // Create the article table
      await client.query(`
        CREATE TABLE schemaflo.article (
          id SERIAL PRIMARY KEY,
          title VARCHAR(255) NOT NULL,
          content TEXT NOT NULL,
          excerpt TEXT,
          slug VARCHAR(255) NOT NULL UNIQUE,
          category VARCHAR(100),
          status VARCHAR(50) NOT NULL DEFAULT 'published',
          featured BOOLEAN NOT NULL DEFAULT false,
          "imageUrl" TEXT,
          "authorId" VARCHAR(255) NOT NULL DEFAULT '1',
          "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
          "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW()
        );
      `);
      
      console.log('✅ Article table created');
    } else {
      console.log('✅ Article table exists');
    }
    
    // Check if there are any articles
    console.log('Checking if there are any articles...');
    const articleCount = await client.query('SELECT COUNT(*) FROM schemaflo.article');
    
    if (parseInt(articleCount.rows[0].count) > 0) {
      console.log(`✅ Found ${articleCount.rows[0].count} existing articles`);
      console.log('Skipping sample article creation');
      return;
    }
    
    console.log('No articles found, adding sample article...');
    
    // Add a sample article
    const result = await client.query(`
      INSERT INTO schemaflo.article (
        title, content, excerpt, slug, category, status, featured, "imageUrl", "authorId", "createdAt", "updatedAt"
      ) VALUES (
        'Welcome to Website Cursor',
        'This is a sample article to get you started with Website Cursor. You can edit or delete this article from the admin dashboard.\n\nWebsite Cursor is a simple news portal that allows you to publish articles and manage them through an admin dashboard. You can create, edit, and delete articles, as well as categorize them and mark them as featured.\n\nTo access the admin dashboard, go to /login and use the following credentials:\n\nUsername: admin\nPassword: admin123\n\nEnjoy using Website Cursor!',
        'This is a sample article to get you started with Website Cursor. You can edit or delete this article from the admin dashboard.',
        'welcome-to-website-cursor',
        'News',
        'published',
        true,
        'https://picsum.photos/800/600',
        '1',
        NOW(),
        NOW()
      ) RETURNING id;
    `);
    
    console.log(`✅ Sample article created with ID: ${result.rows[0].id}`);
    
    // Add a second sample article
    const result2 = await client.query(`
      INSERT INTO schemaflo.article (
        title, content, excerpt, slug, category, status, featured, "imageUrl", "authorId", "createdAt", "updatedAt"
      ) VALUES (
        'Getting Started with Website Cursor',
        'This guide will help you get started with Website Cursor and show you how to make the most of its features.\n\n## Adding Articles\n\nTo add a new article, log in to the admin dashboard and click the "Add New Article" button. Fill in the form with your article details and click "Save Article".\n\n## Managing Articles\n\nYou can edit or delete existing articles from the admin dashboard. Click the "Edit" button to modify an article, or the "Delete" button to remove it.\n\n## Customizing Your Website\n\nYou can customize the appearance of your website by editing the HTML, CSS, and JavaScript files in the public directory.\n\n## Need Help?\n\nIf you need help with Website Cursor, please contact us at support@websitecursor.com.',
        'This guide will help you get started with Website Cursor and show you how to make the most of its features.',
        'getting-started-with-website-cursor',
        'Technology',
        'published',
        false,
        'https://picsum.photos/800/600?random=2',
        '1',
        NOW(),
        NOW()
      ) RETURNING id;
    `);
    
    console.log(`✅ Second sample article created with ID: ${result2.rows[0].id}`);
    
  } catch (err) {
    console.error('❌ Error:', err);
  } finally {
    if (client) {
      try {
        await client.end();
        console.log('Database connection closed');
      } catch (err) {
        console.error('Error closing database connection:', err);
      }
    }
  }
}

// Run the function
addSampleArticle().then(() => {
  console.log('\n✅ Sample article(s) added successfully');
  console.log('You can now view the articles on the website');
}).catch(err => {
  console.error('❌ Error adding sample article:', err);
});
