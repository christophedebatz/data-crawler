'use strict';

var _express = require('express');

var _express2 = _interopRequireDefault(_express);

var _expressHandlebars = require('express-handlebars');

var _expressHandlebars2 = _interopRequireDefault(_expressHandlebars);

var _nodeSchedule = require('node-schedule');

var _nodeSchedule2 = _interopRequireDefault(_nodeSchedule);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _bodyParser = require('body-parser');

var _bodyParser2 = _interopRequireDefault(_bodyParser);

var _index = require('./config/index.js');

var _adminController = require('./controller/adminController.js');

var _Database = require('./service/Database.js');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var job = _nodeSchedule2.default.scheduleJob('*/30 * * * * *', function () {
  console.log('Cron job arrived...');
  var inputs = _adminController.adminController.getInputFiles((0, _index.getConfig)().inputDir);
  var db = _Database.Database.getConnection();
  var query = 'select * from `crawler_jobs` where status = "PENDING"';

  db.query(query, function (err, rows, fields) {
    if (err) {
      throw err;
    }
    rows.forEach(function (row) {
      var crawlerPath = _path2.default.join(row['crawler_path'], '/index.js');
      var crawlerService = require(crawlerPath).crawler;

      if (typeof crawlerService.crawl === 'function') {
        crawlerService.crawl(row['input_file']).then(function (rows) {
          return console.log('message=', rows);
        }).catch(function () {
          return console.log('An error occured.');
        });
      } else {
        console.log('Unable to get crawl method on crawler path', crawlerPath);
      }
    });
  });
});

var app = (0, _express2.default)();

app.engine('handlebars', (0, _expressHandlebars2.default)());
app.set('view engine', 'handlebars');
app.set('views', __dirname + '/views');
app.use(_express2.default.static('public'));
app.use(_bodyParser2.default.json()); // to support JSON-encoded bodies
app.use(_bodyParser2.default.urlencoded({ // to support URL-encoded bodies
  extended: true
}));

app.get('/', _adminController.adminController.index);
app.get('/crawler-*', _adminController.adminController.resolveCrawler);
app.post('/crawler-*', _adminController.adminController.submitCrawler);

app.listen(3000);