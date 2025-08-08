//скрипт создания БД на liteSQL (запускается однажды)
const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./chirp_data.db');

db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS uplinks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    deduplicationId TEXT,
    time TEXT,
    devEui TEXT,
    deviceName TEXT,
    applicationName TEXT,
    temperature REAL,
    humidity REAL,
    pressure REAL,
    ph REAL,
    conductivity REAL,
    latitude REAL,
    longitude REAL,
    raw_data TEXT
  )`);
});

db.close();