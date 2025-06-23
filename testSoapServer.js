const express = require('express');
const bodyParser = require('body-parser');

const app = express();
app.use(bodyParser.text({ type: 'text/xml' }));

app.post('/PyramidIEC619682013', (req, res) => {
    console.log("Получен SOAP-запрос:\n", req.body);

    const soapResponse = `<?xml version="1.0" encoding="utf-8"?>
    <soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/">
       <soapenv:Body>
          <Response>
             <Message>Запрос получен: ${req.body}</Message>
          </Response>
       </soapenv:Body>
    </soapenv:Envelope>`;

    res.header('Content-Type', 'text/xml').send(soapResponse);
});

app.listen(8004, () => console.log('SOAP-сервер запущен на порту 8004'));
