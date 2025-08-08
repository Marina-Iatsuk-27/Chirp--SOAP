// Скрипт, который получает данные с ChirpStack, сохраняет в БД и создает API для получения данных, работает перманентно через PM

const express = require('express');
const bodyParser = require('body-parser');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const app = express();
app.use(bodyParser.json());

const dbPath = path.join(__dirname, 'chirp_data.db');
const db = new sqlite3.Database(dbPath);

// Прием webhook от ChirpStack
app.post('/webhook', (req, res) => {
  const data = req.body;
  console.log('===== Webhook received =====');
  console.log(JSON.stringify(data, null, 2));

  const {
    deduplicationId,
    time,
    deviceInfo,
    object,
    rxInfo
  } = data;

  const latitude = rxInfo?.[0]?.location?.latitude || null;
  const longitude = rxInfo?.[0]?.location?.longitude || null;

  const temperature = parseFloat(object?.temperature) || null;
  const humidity = parseFloat(object?.humidity) || null;
  const pressure = parseFloat(object?.pressure) || null;
  const ph = parseFloat(object?.ph) || null;
  const conductivity = parseFloat(object?.conductivity) || null;

  const stmt = db.prepare(`
    INSERT INTO uplinks 
    (deduplicationId, time, devEui, deviceName, applicationName, 
     temperature, humidity, pressure, ph, conductivity, 
     latitude, longitude, raw_data)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  stmt.run(
    deduplicationId,
    time,
    deviceInfo?.devEui,
    deviceInfo?.deviceName,
    deviceInfo?.applicationName,
    temperature,
    humidity,
    pressure,
    ph,
    conductivity,
    latitude,
    longitude,
    JSON.stringify(data)
  );

  stmt.finalize();
  res.status(200).send('OK');
});

//АПИШКИ

// Получить последние 100 записей
app.get('/data', (req, res) => {
  db.all('SELECT * FROM uplinks ORDER BY time DESC LIMIT 100', [], (err, rows) => {
    if (err) {
      console.error('Ошибка при получении данных из БД:', err);
      return res.status(500).json({ error: 'Ошибка сервера при чтении данных' });
    }
    res.json(rows);
  });
});

// Получить записи по devEui
app.get('/data/:devEui', (req, res) => {
  const devEui = req.params.devEui;
  db.all('SELECT * FROM uplinks WHERE devEui = ? ORDER BY time DESC LIMIT 100', [devEui], (err, rows) => {
    if (err) {
      console.error('Ошибка при получении данных из БД:', err);
      return res.status(500).json({ error: 'Ошибка сервера при чтении данных' });
    }
    res.json(rows);
  });
});

app.get('/devices/summary', (req, res) => {
  db.all('SELECT DISTINCT devEui, deviceName FROM uplinks', [], (err, devices) => {
    if (err) {
      console.error('Ошибка при получении списка устройств:', err);
      return res.status(500).json({ error: 'Ошибка сервера' });
    }

    const results = [];
    let processed = 0;

    devices.forEach(device => {
      db.all(
        `SELECT * 
         FROM uplinks 
         WHERE devEui = ? 
         ORDER BY time DESC 
         LIMIT 3`,
        [device.devEui],
        (err, rows) => {
          if (err) {
            console.error(`Ошибка при получении данных для ${device.devEui}:`, err);
            results.push({ ...device, error: 'Ошибка при получении данных' });
          } else {
            results.push({ ...device, lastReadings: rows });
          }

          processed++;
          if (processed === devices.length) {
            res.json(results);
          }
        }
      );
    });

    // Если устройств нет вообще
    if (devices.length === 0) {
      res.json([]);
    }
  });
});



// 🚀 Запуск сервера
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`✅ Server is running on port ${PORT}`);
});
