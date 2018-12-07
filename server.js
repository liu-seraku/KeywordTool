//npm init
//npm install express --save

const express = require('express');
const app = express();
var googleTrends = require('./node_modules/google-trends-api/lib/google-trends-api.min.js');


const PORT = process.env.PORT || 8080;
app.use(express.static('public'));


//---------------- HTML ------------------

app.get('/', function (req, res) {
  res.sendFile(__dirname + '/portal.html');
});

app.get('/keyword-analyze.html', function (req, res) {
  res.sendFile(__dirname + '/keyword-analyze.html');
});

//---------------- CSS ------------------

app.get('/css/resetcss.css', function (req, res) {
  res.sendFile(__dirname + '/css/resetcss.css');
});

app.get('/css/style.css', function (req, res) {
  res.sendFile(__dirname + '/css/style.css');
});

app.get('/css/style-analyze.css', function (req, res) {
  res.sendFile(__dirname + '/css/style-analyze.css');
});

//---------------- JS ------------------

app.get('/js/jquery-3.3.1.min.js', function (req, res) {
  res.sendFile(__dirname + '/js/jquery-3.3.1.min.js');
});

app.get('/js/script.js', function (req, res) {
  res.sendFile(__dirname + '/js/script.js');
});

app.get('/js/script-analyze.js', function (req, res) {
  res.sendFile(__dirname + '/js/script-analyze.js');
});

app.get('/js/Chart.js', function (req, res) {
  res.sendFile(__dirname + '/js/Chart.js');
});

////---------------- IMG ------------------

app.get('/img/logo.PNG', function (req, res) {
  res.sendFile(__dirname + '/img/logo.PNG');
});

app.get('/img/arrow_left.png', function (req, res) {
  res.sendFile(__dirname + '/img/arrow_left.png');
});

app.get('/img/arrow_right.png', function (req, res) {
  res.sendFile(__dirname + '/img/arrow_right.png');
});

app.get('/img/icon_google.jpg', function (req, res) {
  res.sendFile(__dirname + '/img/icon_google.jpg');
});

app.get('/img/icon_facebook.png', function (req, res) {
  res.sendFile(__dirname + '/img/icon_facebook.png');
});

app.get('/img/icon_twitter.jpg', function (req, res) {
  res.sendFile(__dirname + '/img/icon_twitter.jpg');
});

app.get('/img/icon_yahoo.png', function (req, res) {
  res.sendFile(__dirname + '/img/icon_yahoo.png');
});

////---------------- Behavior ------------------
app.get('/interestOverTime/:keyword', (req, respond, next) => {
  var keywords = req.params.keyword;
  var keywordsArray = keywords.split(",");
  var geo = req.query.geo;
  var startTime = new Date(req.query.startTime);
  var endTime = new Date(req.query.endTime);

  googleTrends.interestOverTime({
      keyword: keywordsArray,
      startTime: startTime,
      endTime: endTime,
      geo: geo,
      hl: 'ja'
    })
    .then((res) => {
      respond.send(res);
    })
    .catch((err) => {
      console.log('got the error', err);
      console.log('error message', err.message);
      console.log('request body', err.requestBody);
    });
});

app.get('/relatedTopics/:keyword', (req, respond, next) => {
  var keyword = req.params.keyword;
  var startTime = new Date(req.query.startTime);
  var endTime = new Date(req.query.endTime);
  var geo = req.query.geo;
  googleTrends.relatedTopics({
      keyword: keyword,
      startTime: startTime,
      endTime: endTime,
      geo: geo,
      hl: 'ja'
    })
    .then((res) => {
      respond.send(res);
    })
    .catch((err) => {
      console.log(err);
    });
});

app.get('/getTrendKeywords', (req, respond, next) => {
  var Twitter = require('twitter-node-client').Twitter;
  var error = function (err, response, body) {
    respond.send(err);
  };
  var success = function (data) {
    respond.send(data);
  };

  var config = {
    "consumerKey": "59JWLVioEJYWWp1zDf12sbO9L",
    "consumerSecret": "IOYYoGaR86EMljlMXKa2cSUIoCZg74jESU4OtvMbT7ymKngceM",
    "accessToken": "1067668921921097728-zEeXgGkMcO7tLyPIdMBUJJrteIQ52v",
    "accessTokenSecret": "HKP2NIxbg5islxjVQ3IOkWcFJz1xS9dyu7OaviKMot2H5",
    "callBackUrl": "https://seraku-keyword-analyzer.herokuapp.com/"
  }

  var twitter = new Twitter(config);

  twitter.getCustomApiCall('/trends/place.json', {
    id: '23424856'
  }, error, success);
});

app.get('/writeJSON', (req, res, next) => {
  var part = req.query.part;
  var partStr = req.query.data;
  var service = req.query.service;
  var baseDate = req.query.baseDate;
  const fs = require('fs');
  if(part == 0){
    fs.writeFileSync("NHK-show-list/" + service + "-" + baseDate + ".json", partStr);
    res.status(201).send("Done");
  } else {
    var showStr = fs.readFileSync("NHK-show-list/" + service + "-" + baseDate + ".json");
    showStr = showStr + partStr;
    fs.writeFileSync("NHK-show-list/" + service + "-" + baseDate + ".json", showStr);
    res.status(201).send("Done");
  }
});

app.get('/readFile', (req, res, next) => {
  var service = req.query.service;
  var baseDate = req.query.baseDate;
  const fs = require('fs');
  var showStr = fs.readFileSync("NHK-show-list/" + service + "-" + baseDate + ".json");
  res.status(200).send(showStr);
});

app.get('/writeLog', (req, res, next) => {
  var keyword = req.query.keyword;
  const fs = require('fs');
  var fullLogStr = fs.readFileSync("log/keyword-log.json");
  var fullLogJson = JSON.parse(fullLogStr);
  var found = -1;
  for (let index = 0; index < fullLogJson.length; index++) {
    var keywordDetail = fullLogJson[index];
    if(keywordDetail.keyword == keyword) {
      found = index;
    }
  }
  if (found !== -1) {
    fullLogJson[found].count = parseInt(fullLogJson[found].count) + 1;
  } else {
    var newKeyword = {
      id : fullLogJson.length,
      keyword : keyword,
      count : 1
    };
    fullLogJson.push(newKeyword);
  }
  var newLogStr = JSON.stringify(fullLogJson);
  fs.writeFileSync("log/keyword-log.json", newLogStr);
  res.status(200).send();
});

app.get('/readLog', (req, res, next) => {
  const fs = require('fs');
  var logStr = fs.readFileSync("log/keyword-log.json");
  res.status(200).send(logStr);
});

app.listen(PORT, () => {
  console.log(`Server is listening on port ${PORT}`);
});