'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.adminController = undefined;

var _recursiveReaddirSync = require('recursive-readdir-sync');

var _recursiveReaddirSync2 = _interopRequireDefault(_recursiveReaddirSync);

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _index = require('../config/index.js');

var config = _interopRequireWildcard(_index);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var adminController = exports.adminController = {

  config: config.getConfig(),

  indexAction: function indexAction(req, res) {
    var template = 'home';
    var inputs = _fs2.default.readdirSync(__dirname + '/../' + config.inputDir);

    return config.getCrawlerConfigs(__dirname + '/../' + config.crawlerDir).then(function (crawlers) {
      res.render(template, { inputs: inputs, crawlers: crawlers });
    }).catch(function (err) {
      res.render(template, { err: err });
    });
  },

  chooseCrawlerAction: function chooseCrawlerAction(req, res) {
    var subTemplate = 'sub-crawler-setup';
    return res.render(subTemplate);
  }

};