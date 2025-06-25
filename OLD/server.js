//NOTE: This is simple server file.  It is NOT the one for active
//      development for TMG

const express = require('express');
const fs = require('fs');
const path = require('path');
const bodyParser = require('body-parser');

const app = express();
const PORT = 3000;

// Middleware to parse URL-encoded bodies
app.use(bodyParser.urlencoded({ extended: true }));

// Serve the HTML form
app.get('/', (req, res) => {
  res.send(`
    <html>
      <body>
        <form action="/submit" method="POST">
          <label for="firstName">First Name:</label>
          <input type="text" id="firstName" name="firstName" required><br>
          <label for="lastName">Last Name:</label>
          <input type="text" id="lastName" name="lastName" required><br>
          <button type="submit">OK</button>
        </form>
      </body>
    </html>
  `);
});

// Handle form submission
app.post('/submit', (req, res) => {
  const { firstName, lastName } = req.body;
  const dateTimeString = new Date().toISOString().replace(/[:.]/g, '-');
  const fileName = `data_${dateTimeString}.txt`;
  const filePath = path.join('/tmp', fileName);

  const fileContent = `First Name: ${firstName}\nLast Name: ${lastName}`;
  
  fs.writeFile(filePath, fileContent, (err) => {
    if (err) {
      console.error('Error writing file:', err);
      res.status(500).send('Internal Server Error');
      return;
    }
    res.send('Data saved successfully!');
  });
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
