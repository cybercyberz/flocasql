// Script to test database connection and diagnose issues
const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

// Try to load environment variables from .env file
let dbUrl;
try {
  const envFile = fs.readFileSync(path.join(process.cwd(), '.env'), 'utf8');
  const dbUrlMatch = envFile.match(/DATABASE_URL="([^"]+)"/);
  if (dbUrlMatch && dbUrlMatch[1]) {
    dbUrl = dbUrlMatch[1];
    console.log('Found DATABASE_URL in .env file');
  }
} catch (err) {
  console.log('Could not read .env file:', err.message);
}

// Parse the database URL or use direct connection details
let connectionConfig;
if (dbUrl) {
  try {
    // Parse the connection string
    const match = dbUrl.match(/postgresql:\/\/([^:]+):([^@]+)@([^:]+):(\d+)\/([^?]+)/);
    if (match) {
      const [, user, password, host, port, dbName] = match;
      connectionConfig = {
        user,
        password,
        host,
        port: parseInt(port, 10),
        database: dbName.split('?')[0]
      };
      console.log('Parsed connection string successfully');
    } else {
      console.error('Could not parse DATABASE_URL, using direct connection details');
      connectionConfig = {
        host: '127.0.0.200',
        port: 5432,
        database: 'flocaclo_nextjs',
        user: 'flocaclo_admin',
        password: 'b3owjbzrwaxu',
        schema: 'schemaflo'
      };
    }
  } catch (err) {
    console.error('Error parsing DATABASE_URL:', err.message);
    process.exit(1);
  }
} else {
  // Use direct connection details
  connectionConfig = {
    host: '127.0.0.200',
    port: 5432,
    database: 'flocaclo_nextjs',
    user: 'flocaclo_admin',
    password: 'b3owjbzrwaxu',
    schema: 'schemaflo'
  };
}

console.log('Using connection config:', {
  ...connectionConfig,
  password: '********' // Hide password in logs
});

// Create a client
const client = new Client(connectionConfig);

async function testConnection() {
  console.log('Testing database connection...');
  
  try {
    console.log('Connecting to database...');
    await client.connect();
    console.log('✅ Connection successful!');

    // Test query
    console.log('Running test query...');
    const res = await client.query('SELECT current_database() as database, current_schema() as schema');
    console.log('✅ Query successful!');
    console.log('Connected to database:', res.rows[0].database);
    console.log('Using schema:', res.rows[0].schema);

    // Test if tables exist
    console.log('Checking for tables...');
    const tablesRes = await client.query(`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'schemaflo'
      LIMIT 10
    `);

    if (tablesRes.rows.length > 0) {
      console.log('✅ Tables found:', tablesRes.rows.map(r => r.table_name).join(', '));
      
      // Check if articles table exists
      if (tablesRes.rows.some(r => r.table_name === 'article')) {
        console.log('Checking articles table...');
        const articlesRes = await client.query(`
          SELECT COUNT(*) as count FROM schemaflo.article
        `);
        console.log('✅ Article count:', articlesRes.rows[0].count);
      }
    } else {
      console.log('❌ No tables found in schema');
    }

    console.log('\n✅ Database connection test completed successfully');
  } catch (err) {
    console.error('❌ Connection error:', err.message);
    console.error('Error details:', err);
    
    // Provide troubleshooting tips
    console.log('\nTroubleshooting tips:');
    console.log('1. Check if the database server is running');
    console.log('2. Verify the connection details (host, port, username, password)');
    console.log('3. Make sure the database and schema exist');
    console.log('4. Check if the database server allows connections from this IP address');
    console.log('5. Verify that the database user has the necessary permissions');
  } finally {
    try {
      await client.end();
    } catch (err) {
      // Ignore errors when closing the connection
    }
  }
}

testConnection();
