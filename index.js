const express = require('express');
const app = express();
const port = 3000;
const db = require('./connection/connection');
const cors = require('cors');
app.use(express.json()); // Parse JSON request bodies
// var bodyParser = require('body-parser');
// // You can specify a file path instead of ':memory:' for a persistent database
// app.use(bodyParser.urlencoded({ extended: false }))

// parse application/json
//app.use(bodyParser.json())
app.use(express.static(__dirname + "/view"));
//app.use(cors(corsOpts));
app.options('*', cors());
app.use((req,res,next)=>{
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET,PUT,PATCH,POST,DELETE,OPTIONS');
  next();
} )

app.get('/signin', (req, res) => {
  res.sendFile(__dirname+'/view/login.html');
})
app.get('/check', (req, res) => {
  res.send({ "message": "hello world" })
})


app.post('/login', (req, res) => {
  let username=req.body.username;
  let password=req.body.password;
  console.log(username,password);
  db.all('SELECT * FROM users WHERE email =? and password =?', [username, password], (err, rows) => {
    if (err) {
      console.error('Error fetching users:', err);
      return res.status(500).send('Error fetching users');
    }else{
      console.log("==>>",rows);
      if(rows.length>0){
        res.redirect('/iot');
        return;
      }else{
        res.sendFile(__dirname+'/view/login.html');
      }
    }
  })
  res.sendFile(__dirname+'/view/login.html');
})
app.get('/iot', (req, res) => {
  res.sendFile(__dirname+'/view/index.html');
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
 
  let switch_no=req.query.switch
  db.all('SELECT * FROM switch', (err, rows) => {
    if (err) {
      console.error('Error fetching users:', err);
      return res.status(500).send('Error fetching users');
    }
   
    if(rows.length>0&&rows[switch_no-1].status==1){
     
      db.all('UPDATE switch SET status = ? WHERE id = ?', [0, switch_no], (err, rows) => {
        
        if (err) {
          console.error('Error fetching users:', err);
          return res.status(500).send('Error fetching users');
        }
      
        return res.json({ "data": rows, "message": "light off" });
      });
      
    }else{
      db.all('update switch set status=? where id=?',[1,switch_no], (err, rows) => {
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