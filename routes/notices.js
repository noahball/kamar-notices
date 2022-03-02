var express = require('express')
var router = express.Router()

router.get('/api/v1/notices', function (req, res) {
    res.send('/api/v1/notices')
  });

module.exports = router