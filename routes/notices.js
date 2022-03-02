var express = require('express')
var router = express.Router()

var axios = require('axios');
var qs = require('qs');
var parseString = require('xml2js').parseString;

router.get('/api/v1/notices', function (req, res) {
    var data = qs.stringify({
      'Command': 'Logon',
      'Key': 'vtku',
      'Username': 'noah.ball',
      'Password': 'studentPassword'
      //'Username': 'web.student',
      //'Password': 'student' 
    });

    var config = {
      method: 'post',
      url: 'https://kamarportal.aquinas.school.nz/api/api.php',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'User-Agent': 'Gym TV MagicInfo',
        'Origin': 'file://',
        'X-Requested-With': 'nz.co.KAMAR'
      },
      data: data
    };
  
    axios(config)
      .then(function (response) {
        parseString(response.data, function (err, result) {
          if (result.LogonResults.Success) {
            var authKey = result.LogonResults.Key[0];
            var studentID = result.LogonResults.CurrentStudent[0];
            var LogonLevel = result.LogonResults.LogonLevel[0];
            var accountTypes = ['Unauthenticated', 'Student', 'Primary Caregiver', 'Caregiver', '', '', '', '', '', '', 'Teacher']
            var accountType = accountTypes[LogonLevel];
            res.send(JSON.stringify({
              status: 'success',
              magicalKey: authKey,
              studentID: studentID,
              accountType: accountType
            }))
          } else {
            res.send(JSON.stringify({
              status: 'error',
              error: result.LogonResults.Error[0]
            }))
          }
        });
      })
      .catch(function (error) {
        console.log(error);
      });
  });

module.exports = router