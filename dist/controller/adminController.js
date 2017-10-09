'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.adminController = undefined;

var _recursiveReaddirSync = require('recursive-readdir-sync');

var _recursiveReaddirSync2 = _interopRequireDefault(_recursiveReaddirSync);

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _index = require('../config/index.js');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var adminController = exports.adminController = {

  index: function index(req, res) {
    var config = (0, _index.getConfig)();
    var inputs = _fs2.default.readdirSync(config.inputDir);
    var inputsFiles = [];

    inputs.forEach(function (input) {
      if (['.xls', '.xlsx'].indexOf(_path2.default.extname(input)) > -1) {
        inputsFiles.push(input);
      }
    });

    var crawlerDir = _path2.default.resolve(__dirname + '/../../' + config.crawlerDir);
    var renderVars = { inputDir: config.inputDir, crawlerDir: crawlerDir };

    return (0, _index.getCrawlerConfigs)(__dirname + '/../' + config.crawlerDir).then(function (crawlers) {
      return renderVars = Object.assign(renderVars, { inputs: inputsFiles, crawlers: crawlers.map(function (i) {
          return i.config;
        }) });
    }).catch(function (err) {
      return renderVars = Object.assign(renderVars, { err: err });
    }).finally(function () {
      return res.render('home', renderVars);
    }); // use bluebird to get finally
  },

  resolveCrawler: function resolveCrawler(req, res) {
    var requestedCrawler = req.originalUrl.replace('/crawler-', '');
    (0, _index.getCrawlerConfigs)(__dirname + '/' + (0, _index.getConfig)().crawlerDir).then(function (crawlers) {
      crawlers.forEach(function (crawler) {
        if (crawler.file.indexOf(requestedCrawler) > -1) {
          var crawlerPath = _path2.default.join('../', (0, _index.getConfig)().crawlerDir, requestedCrawler, '/index.js');
          var crawlerService = require(crawlerPath).crawler;
          if (typeof crawlerService['hello'] === 'function') {
            crawlerService.hello();
          } else {
            console.log('Cannot instanciate', crawler.config.name, crawlerPath);
          }
        } else {
          console.log('No slug for', crawler.config.name);
        }
      });
    });
  }

};