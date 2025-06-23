const axios = require('axios');
const xml2js = require('xml2js');
const { v4: uuidv4 } = require('uuid');

const soapRequest = `<?xml version="1.0" encoding="utf-8"?>
<soapenv:Envelope 
    xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/"
    xmlns:abs="http://iec.ch/TC57/2011/abstract"
    xmlns:mes="http://iec.ch/TC57/2011/schema/message">
   <soapenv:Header/>
   <soapenv:Body>
      <abs:PublishEvent>
         <mes:message>
            <mes:Header>
               <mes:Verb>create</mes:Verb>
               <mes:Noun>EndDeviceEvent</mes:Noun>
               <mes:Timestamp>${new Date().toISOString()}</mes:Timestamp>
               <mes:MessageID>${uuidv4()}</mes:MessageID>
               <mes:Source>YourSystem</mes:Source>
            </mes:Header>
            <mes:Payload>
              <EndDeviceEvent xmlns="http://iec.ch/TC57/2011/schema/message">
                <mRID>sensor-001_${Date.now()}</mRID>
                <createdDateTime>${new Date().toISOString()}</createdDateTime>
                <EndDeviceEventType>
                  <mRID>temperature_reading</mRID>
                  <description>Temperature Measurement</description>
                </EndDeviceEventType>
                <Values>
                  <Reading>
                    <value>25.5</value>
                    <ReadingType>
                      <name>Temperature</name>
                      <unit>Celsius</unit>
                    </ReadingType>
                  </Reading>
                </Values>
              </EndDeviceEvent>
              <mes:Format>XML</mes:Format>
            </mes:Payload>
         </mes:message>
      </abs:PublishEvent>
   </soapenv:Body>
</soapenv:Envelope>`;

const sendSoapRequest = async () => {
    try {
        const response = await axios.post('http://127.0.0.1:8004/PyramidIEC619682013', soapRequest, {
            headers: {
                'Content-Type': 'text/xml',
                'SOAPAction': 'http://iec.ch/61968/PublishEvent'
            }
        });

        xml2js.parseString(response.data, (err, result) => {
            if (err) {
                console.error("Ошибка парсинга ответа:", err);
            } else {
                console.log("Ответ сервера:", JSON.stringify(result, null, 2));
            }
        });
    } catch (error) {
        console.error("Ошибка отправки запроса:", error.message);
    }
};

sendSoapRequest();
