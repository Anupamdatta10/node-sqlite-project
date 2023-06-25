const express = require('express');
const app = express();
const port = 3000;
const db = require('./connection/connection');
const cors = require('cors');
app.use(express.json()); // Parse JSON request bodies

// You can specify a file path instead of ':memory:' for a persistent database

const corsOpts = {
  origin: '*',
  methods: [
      'GET',
      'POST',
      'PATCH',
      'PUT',
      'DELETE',
      'OPTIONS'
  ],
  allowedHeaders: [
      'Content-Type',
      'Authorization',
      'language',
      'X-Amz-Date',
      'X-Api-Key',
      'X-Amz-Security-Token',
      'X-Amz-User-Agent',
      'Session',
      'Accesstoken'
  ]
};

//app.use(cors(corsOpts));
app.options('*', cors());

app.get('/check', (req, res) => {
  res.send({ "message": "hello world" })
})

app.get('/switch', (req, res) => {
  db.all('SELECT * FROM switch', (err, rows) => {
    if (err) {
      console.error('Error fetching users:', err);
      return res.status(500).send('Error fetching users');
    }

    return res.json(rows);
  });
})

app.post('/switch', (req, res) => {
  db.all('SELECT * FROM switch', (err, rows) => {
    if (err) {
      console.error('Error fetching users:', err);
      return res.status(500).send('Error fetching users');
    }
    if(rows.length>0&&rows[0].status==1){
      db.all('update switch set status=? where id=1',[0], (err, rows) => {
        if (err) {
          console.error('Error fetching users:', err);
          return res.status(500).send('Error fetching users');
        }
    
        return res.json({"data":rows,"message":"light off"});
      });
    }else{
      db.all('update switch set status=? where id=1',[1], (err, rows) => {
        if (err) {
          console.error('Error fetching users:', err);
          return res.status(500).send('Error fetching users');
        }
    
        return res.json({"data":rows,"message":"light on"});
      });
    }
    
  })
  
})
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