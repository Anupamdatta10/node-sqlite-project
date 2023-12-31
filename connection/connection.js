const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./mydb.db'); 


// Handle database connection errors
db.on('error', (err) => {
    console.error('Database connection error:', err);
  });
  
db.serialize(() => {
    // Database operations go here
    db.run(`CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT,
      email TEXT
    )`);
  });



module.exports =db;