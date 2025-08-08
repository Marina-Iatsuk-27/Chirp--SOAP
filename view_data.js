//для просмотра того, что в БД. запускается по необходимости

const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./chirp_data.db');

db.all('SELECT * FROM uplinks ORDER BY id DESC LIMIT 10', [], (err, rows) => {
  if (err) {
    throw err;
  }
  console.log(rows);
  db.close();
});