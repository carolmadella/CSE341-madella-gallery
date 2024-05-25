const express = require('express');
const app = express();
const port = 3000;

// Define a route handler for the default home page
app.get('/',  (req, res) => {
  res.send('Hello, World!');
});
app.get('/artwork', (req, res) => {
    res.send(`Hello`);
  });
// Start the server and listen on port 3000
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});

