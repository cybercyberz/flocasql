// Simple script to check if the API is working correctly
const http = require('http');

const options = {
  hostname: 'localhost',
  port: 3000,
  path: '/api/articles',
  method: 'GET'
};

console.log('Checking if the API is working correctly...');
const req = http.request(options, (res) => {
  console.log(`Status Code: ${res.statusCode}`);
  
  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    if (res.statusCode === 200) {
      console.log('API is working correctly!');
      try {
        const articles = JSON.parse(data);
        console.log(`Retrieved ${articles.length} articles.`);
        if (articles.length > 0) {
          console.log('First article:', articles[0].title);
        }
      } catch (error) {
        console.error('Error parsing JSON response:', error.message);
        console.log('Response data:', data.substring(0, 500) + '...');
      }
    } else {
      console.log('API returned a non-200 status code.');
      console.log('Response data:', data.substring(0, 500) + '...');
    }
  });
});

req.on('error', (error) => {
  console.error('Error checking API:', error.message);
  console.log('Make sure the website is running on port 3000.');
});

req.end();
