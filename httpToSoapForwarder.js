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

    // Собери SOAP-запрос как строку
    const soapBody = `<?xml version="1.0" encoding="utf-8"?>
    <soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/">
        <soapenv:Body>
            <PublishEvent xmlns="http://iec.ch/TC57/2011/schema/message">
                <EventMessageType>
                    <Header>
                        <Verb>create</Verb>
                        <Noun>EndDeviceEvent</Noun>
                        <Timestamp>${timestamp}</Timestamp>
                        <MessageID>${Math.random().toString(36).substr(2, 9)}</MessageID>
                        <Source>ChirpStack</Source>
                    </Header>
                    <Payload>
                        <EndDeviceEvent xmlns="http://iec.ch/TC57/2011/schema/message">
                            <mRID>${devEui}</mRID>
                            <createdDateTime>${timestamp}</createdDateTime>
                            <EndDeviceEventType>
                                <mRID>temperature_reading</mRID>
                                <description>Temperature</description>
                            </EndDeviceEventType>
                            <Values>
                                <Reading>
                                    <value>${reading}</value>
                                    <ReadingType>
                                        <name>Temperature</name>
                                        <unit>Celsius</unit>
                                    </ReadingType>
                                </Reading>
                            </Values>
                        </EndDeviceEvent>
                    </Payload>
                </EventMessageType>
            </PublishEvent>
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
