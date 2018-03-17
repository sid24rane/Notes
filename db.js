const mysql = require('mysql');
const connection = mysql.createConnection({
  host     : 'localhost',
  user     : 'root',
  password : 'sid',
  database : 'notes'
});

connection.connect();

module.exports=connection;