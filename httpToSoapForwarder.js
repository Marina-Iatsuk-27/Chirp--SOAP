const express = require('express');
const axios = require('axios');

const app = express();
app.use(express.json());

app.post('/webhook', async (req, res) => {
    console.log('Получен webhook от ChirpStack:', req.body);

    // Пример: как достать данные из webhook
    const devEui = req.body?.devEui || 'unknown';
    const timestamp = new Date().toISOString();
    const reading = req.body?.object?.temperature || 0;

    // собираем SOAP-запрос как строку
    const soapBody = `<?xml version="1.0" encoding="utf-8"?>
        <soapenv:Envelope 
            xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/"
            xmlns:abs="http://iec.ch/TC57/2011/abstract"
            xmlns:mes="http://iec.ch/TC57/2011/schema/message">
            <soapenv:Body>
                <abs:PublishEvent>
                    <mes:message>
                        <mes:Header>
                            <mes:Verb>create</mes:Verb>
                            <mes:Noun>EndDeviceEvent</mes:Noun>
                            <mes:Timestamp>${timestamp}</mes:Timestamp>
                            <mes:MessageID>${Math.random().toString(36).substr(2, 9)}</mes:MessageID>
                            <mes:Source>ChirpStack</mes:Source>
                        </mes:Header>
                        <mes:Payload>
                            <mes:EndDeviceEvent>
                                <mes:mRID>${devEui}</mes:mRID>
                                <mes:createdDateTime>${timestamp}</mes:createdDateTime>
                                <mes:EndDeviceEventType>
                                    <mes:mRID>temperature_reading</mes:mRID>
                                    <mes:description>Temperature</mes:description>
                                </mes:EndDeviceEventType>
                                <mes:Values>
                                    <mes:Reading>
                                        <mes:value>${reading}</mes:value>
                                        <mes:ReadingType>
                                            <mes:name>Temperature</mes:name>
                                            <mes:unit>Celsius</mes:unit>
                                        </mes:ReadingType>
                                    </mes:Reading>
                                </mes:Values>
                            </mes:EndDeviceEvent>
                        </mes:Payload>
                    </mes:message>
                </abs:PublishEvent>
            </soapenv:Body>
        </soapenv:Envelope>`;


    try {
        // Отправим SOAP на тестовый сервер
        const response = await axios.post(
            'http://localhost:8004/PyramidIEC619682013',
            soapBody,
            {
                headers: {
                    'Content-Type': 'text/xml',
                    'SOAPAction': 'http://iec.ch/61968/PublishEvent'
                }
            }
        );

        console.log("Ответ от SOAP-сервера:", response.data);
        res.status(200).send("SOAP-запрос отправлен");
    } catch (err) {
        console.error("Ошибка отправки SOAP-запроса:", err.message);
        res.status(500).send("Ошибка SOAP");
    }
});

app.listen(3000, () => console.log('HTTP-сервер слушает на порту 3000'));
