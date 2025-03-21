// Script to check if the website is working correctly
const http = require('http');
const { execSync } = require('child_process');

console.log('Checking website status...');

// Function to make an HTTP request
function makeRequest(path, callback) {
  const options = {
    hostname: 'localhost',
    port: 3000,
    path: path,
    method: 'GET',
    timeout: 5000
  };

  const req = http.request(options, (res) => {
    let data = '';
    
    res.on('data', (chunk) => {
      data += chunk;
    });
    
    res.on('end', () => {
      callback(null, {
        statusCode: res.statusCode,
        headers: res.headers,
        data: data.substring(0, 500) // Only show the first 500 characters
      });
    });
  });
  
  req.on('error', (err) => {
    callback(err);
  });
  
  req.on('timeout', () => {
    req.destroy();
    callback(new Error('Request timed out'));
  });
  
  req.end();
}

// Check PM2 status
try {
  console.log('\n=== PM2 Status ===');
  const pm2Status = execSync('pm2 list').toString();
  console.log(pm2Status);
} catch (err) {
  console.error('Error checking PM2 status:', err.message);
}

// Check homepage
console.log('\n=== Homepage Status ===');
makeRequest('/', (err, response) => {
  if (err) {
    console.error('❌ Error accessing homepage:', err.message);
    console.log('This could indicate that the server is not running or is not accessible');
  } else {
    console.log(`Status code: ${response.statusCode}`);
    
    if (response.statusCode === 200) {
      console.log('✅ Homepage is accessible');
      console.log('Content type:', response.headers['content-type']);
      
      // Check if it's HTML
      if (response.headers['content-type'] && response.headers['content-type'].includes('text/html')) {
        console.log('✅ Homepage is returning HTML content');
      } else {
        console.log('❌ Homepage is not returning HTML content');
      }
      
      // Check for common error messages in the response
      if (response.data.includes('Internal Server Error') || response.data.includes('Error:')) {
        console.log('❌ Homepage contains error messages');
        console.log('First 500 characters of response:');
        console.log(response.data);
      }
    } else {
      console.log('❌ Homepage returned a non-200 status code');
      console.log('First 500 characters of response:');
      console.log(response.data);
    }
  }
  
  // Check API
  console.log('\n=== API Status ===');
  makeRequest('/api/articles', (err, response) => {
    if (err) {
      console.error('❌ Error accessing API:', err.message);
      console.log('This could indicate that the API is not running or is not accessible');
    } else {
      console.log(`Status code: ${response.statusCode}`);
      
      if (response.statusCode === 200) {
        console.log('✅ API is accessible');
        console.log('Content type:', response.headers['content-type']);
        
        // Check if it's JSON
        if (response.headers['content-type'] && response.headers['content-type'].includes('application/json')) {
          console.log('✅ API is returning JSON content');
          
          try {
            const data = JSON.parse(response.data);
            if (Array.isArray(data)) {
              console.log(`✅ API returned an array with ${data.length} articles`);
            } else {
              console.log('❌ API did not return an array');
            }
          } catch (err) {
            console.log('❌ API did not return valid JSON');
          }
        } else {
          console.log('❌ API is not returning JSON content');
        }
      } else {
        console.log('❌ API returned a non-200 status code');
        console.log('First 500 characters of response:');
        console.log(response.data);
      }
      
      console.log('\n=== Troubleshooting Tips ===');
      if (response.statusCode !== 200) {
        console.log('1. Check the PM2 logs for error messages: pm2 logs websitecursor');
        console.log('2. Make sure the database connection is working: node test-connection.js');
        console.log('3. Try running the fix scripts:');
        console.log('   - node fix-dev-mode.js');
        console.log('   - node rebuild.js');
        console.log('4. Restart the PM2 process: pm2 restart websitecursor');
      } else {
        console.log('The website appears to be working correctly!');
      }
    }
  });
});
