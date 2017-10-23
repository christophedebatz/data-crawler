'use strict';

var _express = require('express');

var _express2 = _interopRequireDefault(_express);

var _expressHandlebars = require('express-handlebars');

var _expressHandlebars2 = _interopRequireDefault(_expressHandlebars);

var _bodyParser = require('body-parser');

var _bodyParser2 = _interopRequireDefault(_bodyParser);

var _index = require('./config/index.js');

var _adminController = require('./controller/adminController.js');

var _crawlerJob = require('./controller/crawlerJob.js');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var config = (0, _index.getConfig)();
_crawlerJob.crawlerJob.doSchedule(config);

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
app.get('/jobs', _adminController.adminController.getJobs);
app.get('/crawler-*', _adminController.adminController.resolveCrawler);
app.post('/crawler-*', _adminController.adminController.submitCrawler);

app.listen(3000);