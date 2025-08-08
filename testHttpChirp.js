const express = require('express');
const bodyParser = require('body-parser');
const app = express();

app.use(bodyParser.json());

app.post('*', (req, res) => {
    console.log('📩 Request from ChirpStack:');
    console.log(JSON.stringify(req.body, null, 2));
    res.status(200).send('OK');
});

app.listen(3000, () => console.log('Listening on port 3000'));
