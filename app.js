const express = require('express');
const app = express();
var axios = require('axios');
var qs = require('qs');
var parseString = require('xml2js').parseString;
var bodyParser = require('body-parser')

app.use(express.static('public'));
app.use(express.json());
app.use(bodyParser.urlencoded({
  extended: false
}));

var notices = require('./routes/notices.js')

app.get('/api/v1/notices', notices)