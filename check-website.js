// Simple script to check if the website is working correctly
const http = require('http');

const options = {
  hostname: 'localhost',
  port: 3000,
  path: '/',
  method: 'GET'
};

console.log('Checking if the website is working correctly...');
const req = http.request(options, (res) => {
  console.log(`Status Code: ${res.statusCode}`);
  
  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    if (res.statusCode === 200) {
      console.log('Website is working correctly!');
    } else {
      console.log('Website returned a non-200 status code.');
      console.log('Response data:', data.substring(0, 500) + '...');
    }
  });
});

req.on('error', (error) => {
  console.error('Error checking website:', error.message);
  console.log('Make sure the website is running on port 3000.');
});

req.end();
