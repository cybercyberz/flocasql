const express = require('express');
const path = require('path');
const app = express();
const port = process.env.PORT || 3000;

// Serve static files from the .next directory
app.use(express.static(path.join(__dirname, '.next')));

// Handle all other routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '.next', 'server', 'pages', req.path));
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
}); 