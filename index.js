const express = require('express');
const app = express();
const port = 3000;
const db= require('./connection/connection');
app.use(express.json()); // Parse JSON request bodies

// You can specify a file path instead of ':memory:' for a persistent database






app.post('/users', (req, res) => {
    const { name, email } = req.body;
  
    db.run('INSERT INTO users (name, email) VALUES (?, ?)', [name, email], function (err) {
      if (err) {
        console.error('Error creating user:', err);
        return res.status(500).send('Error creating user');
      }
  
      return res.status(201).send('User created successfully');
    });
  });

app.get('/users', (req, res) => {
    db.all('SELECT * FROM users', (err, rows) => {
      if (err) {
        console.error('Error fetching users:', err);
        return res.status(500).send('Error fetching users');
      }
  
      return res.json(rows);
    });
  });
// Start the server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});