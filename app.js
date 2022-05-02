const express = require('express');
const app = express();
var bodyParser = require('body-parser')

app.use(express.static('public'));
app.use(express.json());
app.use(bodyParser.urlencoded({
    extended: false
}));

app.use(function (req, res, next) {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Credentials", "true");
    res.setHeader("Access-Control-Allow-Methods", "GET,HEAD,OPTIONS,POST,PUT");
    res.setHeader("Access-Control-Allow-Headers", "Access-Control-Allow-Headers, Origin,Accept, X-Requested-With, Content-Type, Access-Control-Request-Method, Access-Control-Request-Headers");
    next();
  });

var notices = require('./routes/notices.js')

app.get('/api/v1/notices', notices)

app.listen(process.env.PORT || 3000, () => {
    console.log(`KAMAR Notices Service running on port ${process.env.PORT || 3000}.`); // Run!
});