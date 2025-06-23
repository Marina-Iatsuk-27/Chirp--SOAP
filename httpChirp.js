const express = require('express');
const bodyParser = require('body-parser');

const app = express();
app.use(bodyParser.json());

app.post('/webhook', (req, res) => {
    const event = req.body;
    console.log('Received event:', event);

    // Обработка различных типов событий
    switch (event.eventType) {
        case 'up':
            console.log('Data received from device:', event.deviceInfo, event.data);
            break;
        case 'ack':
            console.log('Ack received for device:', event.deviceInfo);
            break;
        case 'join':
            console.log('Device joined:', event.deviceInfo);
            break;
    
        default:
            console.log('Unknown event type:', event.eventType);
    }

    res.status(200).send('Event received');
});

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});