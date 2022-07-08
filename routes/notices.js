var express = require('express')
var router = express.Router()

var axios = require('axios');
var qs = require('qs');
var convert = require('xml-js');
const { processors } = require('xml2js');
var parseString = require('xml2js').parseString;

router.get('/api/v1/notices', function (req, res) {
  var data = qs.stringify({
    'Command': 'Logon',
    'Key': 'vtku',
    'Username': 'noah.ball',
    'Password': process.env.password
    //'Username': 'web.student',
    //'Password': 'student' 
  });

  var config = {
    method: 'post',
    url: 'https://kamarportal.aquinas.school.nz/api/api.php',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'User-Agent': 'Gym TV Notices API',
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

          var offset = 13;
          var date = new Date(new Date().getTime() + offset * 3600 * 1000).toUTCString().replace(/ GMT$/, "")
          var date = new Date(date).toLocaleDateString('en-GB', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
          })

          var data = qs.stringify({
            'Command': 'GetNotices',
            'Key': authKey,
            'Date': date,
            'ShowAll': 'YES'
          });
          var config = {
            method: 'post',
            url: 'https://kamarportal.aquinas.school.nz/api/api.php',
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded',
              'User-Agent': 'Gym TV Notices API',
              'Origin': 'file://',
              'X-Requested-With': 'nz.co.KAMAR'
            },
            data: data
          };

          axios(config)
            .then(function (response) {
              var data = response.data;
              var result = convert.xml2json(data, {
                compact: true,
                spaces: 4
              });
              var notices = JSON.parse(result)

              // .NoticesResults.NumberRecords._text

              var num = 0

              var json = {
                meta: {
                  totalGeneralNotices: notices.NoticesResults.GeneralNotices.NumberGeneralRecords._text,
                  totalMeetingNotices: notices.NoticesResults.MeetingNotices.NumberMeetingRecords._text,
                  totalNotices: notices.NoticesResults.NumberRecords._text,
                  date: notices.NoticesResults.NoticeDate._text,
                },
                notices: {

                }
              }

              for (let i = 0; i < notices.NoticesResults.GeneralNotices.NumberGeneralRecords._text; i++) {
                // json.notices[i].teacher = notices.NoticesResults.GeneralNotices.General[i].Teacher._text
                // json.notices[i].title = notices.NoticesResults.GeneralNotices.General[i].Subject._text
                // json.notices[i].body = notices.NoticesResults.GeneralNotices.General[i].Body._text

                Object.assign(json.notices, {
                  [i + 1]: {
                    type: 'general',
                    level: notices.NoticesResults.GeneralNotices.General[i].Level._text,
                    teacher: notices.NoticesResults.GeneralNotices.General[i].Teacher._text,
                    title: notices.NoticesResults.GeneralNotices.General[i].Subject._text,
                    body: notices.NoticesResults.GeneralNotices.General[i].Body._text
                  }
                });
              }

              for (let i = 0; i < notices.NoticesResults.MeetingNotices.NumberMeetingRecords._text; i++) {
                // json.notices[i].teacher = notices.NoticesResults.GeneralNotices.General[i].Teacher._text
                // json.notices[i].title = notices.NoticesResults.GeneralNotices.General[i].Subject._text
                // json.notices[i].body = notices.NoticesResults.GeneralNotices.General[i].Body._text
                if (notices.NoticesResults.MeetingNotices.NumberMeetingRecords._text == 1) {
                  Object.assign(json.notices, {
                    [parseInt(notices.NoticesResults.GeneralNotices.NumberGeneralRecords._text) + i + 1]: {
                      type: 'meeting',
                      level: notices.NoticesResults.MeetingNotices.Meeting.Level._text,
                      teacher: notices.NoticesResults.MeetingNotices.Meeting.Teacher._text,
                      title: notices.NoticesResults.MeetingNotices.Meeting.Subject._text,
                      body: notices.NoticesResults.MeetingNotices.Meeting.Body._text,
                      placeMeet: notices.NoticesResults.MeetingNotices.Meeting.PlaceMeet._text,
                      dateMeet: notices.NoticesResults.MeetingNotices.Meeting.DateMeet._text,
                      timeMeet: notices.NoticesResults.MeetingNotices.Meeting.TimeMeet._text
                    }
                  });
                } else {
                  Object.assign(json.notices, {
                    [parseInt(notices.NoticesResults.GeneralNotices.NumberGeneralRecords._text) + i + 1]: {
                      type: 'meeting',
                      level: notices.NoticesResults.MeetingNotices.Meeting[i].Level._text,
                      teacher: notices.NoticesResults.MeetingNotices.Meeting[i].Teacher._text,
                      title: notices.NoticesResults.MeetingNotices.Meeting[i].Subject._text,
                      body: notices.NoticesResults.MeetingNotices.Meeting[i].Body._text,
                      placeMeet: notices.NoticesResults.MeetingNotices.Meeting[i].PlaceMeet._text,
                      dateMeet: notices.NoticesResults.MeetingNotices.Meeting[i].DateMeet._text,
                      timeMeet: notices.NoticesResults.MeetingNotices.Meeting[i].TimeMeet._text
                    }
                  });
                }
              }

              res.send(JSON.stringify(json))

            })
            .catch(function (error) {
              res.send(JSON.stringify({
                status: 'error',
                error: error
              }))
            });
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