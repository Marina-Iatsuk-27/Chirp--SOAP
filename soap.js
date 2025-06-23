const axios = require('axios');
const xml2js = require('xml2js');

const soapRequest = `<?xml version="1.0" encoding="utf-8"?>
<soapenv:Envelope 
    xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/"
    xmlns:mes="http://iec.ch/TC57/2011/schema/message">
   <soapenv:Header/>
   <soapenv:Body>
      <mes:PublishEvent>
         <mes:EventMessageType>
            <mes:Header>
               <mes:Verb>create</mes:Verb>
               <mes:Noun>EndDeviceEvent</mes:Noun>
               <mes:Timestamp>${new Date().toISOString()}</mes:Timestamp>
               <mes:MessageID>${generateUUID()}</mes:MessageID>  <!-- Лучше динамический ID -->
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
            </mes:Payload>
         </mes:EventMessageType>
      </mes:PublishEvent>
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
