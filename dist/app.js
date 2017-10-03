'use strict';

var _express = require('express');

var _express2 = _interopRequireDefault(_express);

var _expressHandlebars = require('express-handlebars');

var _expressHandlebars2 = _interopRequireDefault(_expressHandlebars);

var _index = require('./config/index.js');

var _adminController = require('./controller/adminController.js');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var app = (0, _express2.default)();

app.engine('handlebars', (0, _expressHandlebars2.default)());
app.set('view engine', 'handlebars');
app.set('views', __dirname + '/views');

app.get('/', _adminController.adminController.indexAction);

(0, _index.getCrawlerConfigs)(__dirname + '/' + (0, _index.getConfig)().crawlerDir).then(function (crawler) {
  app.get('/' + crawler.slug, function () {
    return _adminController.adminController.chooseCrawler(crawler);
  });
});

app.listen(3000);