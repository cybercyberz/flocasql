const { Client } = require('pg')

// Connection details
const client = new Client({
  host: '127.0.0.200',
  port: 5432,
  database: 'flocaclo_nextjs',
  user: 'flocaclo_admin',
  password: 'b3owjbzrwaxu',
  schema: 'schemaflo'
})

async function testConnection() {
  try {
    await client.connect()
    console.log('Connection successful!')
    
    // Test query
    const res = await client.query('SELECT current_database() as database, current_schema() as schema')
    console.log('Connected to database:', res.rows[0].database)
    console.log('Using schema:', res.rows[0].schema)
    
    // Test if tables exist
    const tablesRes = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'schemaflo' 
      LIMIT 5
    `)
    
    if (tablesRes.rows.length > 0) {
      console.log('Tables found:', tablesRes.rows.map(r => r.table_name).join(', '))
    } else {
      console.log('No tables found in schema')
    }
  } catch (err) {
    console.error('Connection error:', err.message)
  } finally {
    await client.end()
  }
}

testConnection() 