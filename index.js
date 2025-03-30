const express = require('express');
const app = express();
const port = 3000;
const db = require('./connection/connection');
const cors = require('cors');
app.use(express.json()); // Parse JSON request bodies
var bodyParser = require('body-parser');
require('dotenv').config();
const { sendMail } = require('./email');
// You can specify a file path instead of ':memory:' for a persistent database
app.use(bodyParser.urlencoded({ extended: false }))

// parse application/json
app.use(bodyParser.json())
app.use(express.static(__dirname + "/view"));
//app.use(cors(corsOpts));
app.options('*', cors());
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET,PUT,PATCH,POST,DELETE,OPTIONS');
  next();
})

app.get('/signin', (req, res) => {
  res.sendFile(__dirname + '/view/login.html');
})
app.get('/check', (req, res) => {
  res.send({ "message": "hello world" })
})

app.get('/status-update', (req, res) => {
  const { x, y } = req.query;
  let queries = [];
  let params = [];

  if (x !== undefined) {
    x==''?0:x
    queries.push({ query: 'UPDATE switch SET status = ? WHERE id = 1', param: x });
  }
  
  if (y !== undefined) {
    console.log('y====>>',y==''?0:y)
    y==''?0:y
    queries.push({ query: 'UPDATE switch SET status = ? WHERE id = 2', param: y });
  }

  if (queries.length > 0) {
    db.serialize(() => {
      const stmt = db.prepare(queries[0].query);
      stmt.run(queries[0].param, function (err) {
        if (err) {
          console.error('Error updating status:', err);
          return res.status(500).send('Error updating status');
        }
        
        if (queries.length > 1) {
          const stmt2 = db.prepare(queries[1].query);
          stmt2.run(queries[1].param, function (err) {
            if (err) {
              console.error('Error updating status:', err);
              return res.status(500).send('Error updating status');
            }
            fetchUpdatedStatus(res);
          });
        } else {
          fetchUpdatedStatus(res);
        }
      });
    });
  } else {
    fetchUpdatedStatus(res);
  }
});

function fetchUpdatedStatus(res) {
  db.all('SELECT * FROM switch', (err, rows) => {
    if (err) {
      console.error('Error fetching data:', err);
      return res.status(500).send('Error fetching data');
    }
    console.log('rows========>>', rows);
    res.send({ status: rows });
  });
}





app.post('/login', (req, res) => {
  try {

   
    let username = req.body.username;
    let password = req.body.password;
   
    db.all('SELECT * FROM users WHERE email =? and password =?', [username, password], (err, rows) => {
      if (err) {
        console.error('Error fetching users:', err);
        return res.status(500).send('Error fetching users');
      } else {
       
        if (rows.length > 0 && rows[0].status == 'active') {
          res.status(200).send({ "token": JSON.stringify(rows[0]), "success": true, data: rows[0] });
          return;
        } else {
          res.status(400).send({ "message": "user not found!", "success": false });
        }
      }
    })

  } catch (e) {
    console.log(e)
    res.status(500).send({ "message": "internal server error!!" });
  }
})
app.get('/iot', (req, res) => {
  res.sendFile(__dirname + '/view/index.html');
})
app.get('/switch', async (req, res) => {
  db.all('SELECT * FROM switch', (err, rows) => {
    if (err) {
      console.error('Error fetching users:', err);
      return res.status(500).send('Error fetching users');
    }

    return res.status(200).send(rows);
  });
})

app.post('/switch', (req, res) => {
  try {
    let user = JSON.parse(req.headers.authorization);
    db.all('select * from users where email=?', [user.email], (err, rows) => {
      if (err) {
        return res.status(200).send({ "success": false, message: "unauthorized", data: "unauthorized" })

      } else {
      
        if (rows.length > 0 && rows[0].status != 'active') {
         
          return res.status(200).send({ "success": false, message: "unauthorized", data: "unauthorized" })
        } else {
          let switch_no = req.query.switch
          db.all('SELECT * FROM switch', (err, rows) => {
            if (err) {
              console.error('Error fetching users:', err);
              return res.status(500).send('Error fetching users');
            }

            if (rows.length > 0 && rows[switch_no - 1].status == 1) {

              db.all('UPDATE switch SET status = ? WHERE id = ?', [0, switch_no], (err, rows) => {

                if (err) {
                  console.error('Error fetching users:', err);
                  return res.status(500).send({ "message": 'Internal server error' });
                }

                return res.json({ "data": rows, "message": "light off" });
              });

            } else {
              db.all('update switch set status=? where id=?', [1, switch_no], (err, rows) => {
                if (err) {
                  console.error('Error fetching users:', err);
                  return res.status(500).send({ "message": 'Internal server error' });
                }

                return res.json({ "data": rows, "message": "light on" });

              });
            }

          })
        }
      }
    })

  } catch (e) {
    return res.status(500).send({ "message": 'Internal server error' });
  }


})

app.get('/register', (req, res) => {
  res.sendFile(__dirname + '/view/register.html');
})
app.post('/register', (req, res) => {
  try {

 
    let username = req.body.username;
    let password = req.body.password;
 
    db.all('SELECT * FROM users WHERE email =?', [username], (err, rows) => {
      if (err) {
        console.error('Error fetching users:', err);
        return res.status(500).send('Error fetching users');
      } else {
        
        if (rows.length > 0) {
          res.status(200).send({ "message": "user alread exist", "success": false });

          return;
        } else {
          db.run('INSERT INTO users ( email,password) VALUES (?, ?)', [username, password], function (err) {
            if (err) {
              console.error('Error creating user:', err);
              return res.status(500).send({ success: false, message: "user not created successfully" });
            }

            return res.status(201).send({ success: true, message: "user created successfully" });
          });

          // res.status(200).send({ "token": JSON.stringify(rows[0]), "success": true, data: rows[0] });
        }
      }
    })

  } catch (e) {
    console.log(e)
    res.status(500).send({ "message": "internal server error!!" });
  }
})

app.get('/send-mail', async (req, res) => {
  try {
    sendMail('neelmarik2006@gmail.com', 'fire alert', 'fire alert message!!')
    db.all('SELECT * FROM users where role="user" and status="active"', (err, rows) => {
      if (err) {
       
        return res.status(500).send('Error fetching users');
      } else {
       
        for(let i=0;i<rows.length;i++){
          sendMail(rows[i].email, 'fire alert', 'fire alert message!! fire broke out in your home!!')
        }
        //return res.status(200).send(rows);
      }
    })
    return res.send({ 'message': "send" })
  } catch (e) {
    res.send({ 'message': "send" })
  }

})

app.get('/admin', (req, res) => {
  res.sendFile(__dirname + '/view/admin.html');
})

app.get('/list', (req, res) => {
  try {
    db.all('SELECT * FROM users where role="user" and status="active"', (err, rows) => {
      if (err) {
        console.error('Error fetching users:', err);
        return res.status(500).send('Error fetching users');
      } else {
        return res.status(200).send(rows);
      }
    })
  } catch (e) {
    console.log(e)
    res.status(500).send({ "message": "internal server error!!" });
  }
});

app.post("/update-status",(req,res)=>{
  try{
    let user = req.body;
    //console.log(status)
    db.all('UPDATE users SET status ="block" where id=?', [ user.id], (err, rows) => {
      if (err) {
        console.error('Error fetching users:', err);
        return res.status(500).send({ "message": 'Internal server error' });
      }else{
        res.send({success:true,message:"done!"})
      }
    })
    }catch(e){
      console.log(e)
      res.status(500).send({ "message": 'Internal server error' });
    }
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