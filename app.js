const express = require('express');
const app = express();
var bodyParser = require('body-parser')

app.use(express.static('public'));
app.use(express.json());
app.use(bodyParser.urlencoded({
    extended: false
}));

var notices = require('./routes/notices.js')

app.get('/api/v1/notices', notices)

app.listen(3000, () => {
    console.log(`KAMAR Notices Service running on port 3000.`); // Run!
});