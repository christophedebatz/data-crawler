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

  getInputFiles: function getInputFiles(inputDir) {
    var inputs = _fs2.default.readdirSync(inputDir);
    var inputsFiles = [];

    inputs.forEach(function (input) {
      if (['.xls', '.xlsx'].indexOf(_path2.default.extname(input)) > -1) {
        inputsFiles.push(input);
      }
    });

    return inputsFiles;
  },

  index: function index(req, res) {
    var config = (0, _index.getConfig)();
    var inputsFiles = adminController.getInputFiles(config.inputDir);
    var crawlerDir = _path2.default.resolve(__dirname + '/../../' + config.crawlerDir);
    var renderVars = { inputDir: config.inputDir, crawlerDir: crawlerDir };

    (0, _index.getCrawlerConfigs)(__dirname + '/../' + config.crawlerDir).then(function (crawlers) {
      return renderVars = Object.assign(renderVars, { inputs: inputsFiles, crawlers: crawlers.map(function (i) {
          return i.config;
        }) });
    }).catch(function (err) {
      return renderVars = Object.assign(renderVars, { err: err });
    }).finally(function () {
      return res.render('home', renderVars);
    }); // use bluebird to get finally
  },

  submitCrawler: function submitCrawler(req, res) {
    // launch crawling
    if (!req.body.inputFileName) {
      throw new Error('invalid.crawler.form');
    }

    // display page
    var requestedCrawler = req.originalUrl.replace('/crawler-', '');
    var crawlerPath = _path2.default.join('../', (0, _index.getConfig)().crawlerDir, requestedCrawler, '/index.js');
    var crawlerService = require(crawlerPath).crawler;

    var error = false;
    var crawling = null;

    if (typeof crawlerService.createCrawlingJob === 'function') {
      crawling = crawlerService.createCrawlingJob({
        input: req.body.inputFileName,
        output: req.body.outputFileName || null
      }, function (err, result) {
        if (typeof crawlerService.getCrawlerHtml === 'function') {
          var child = crawlerService.getCrawlerHtml(err, result);
          res.render('crawler', { child: child });
        }
      });
    } else {
      console.log('Cannot instanciate crawler', crawlerPath);
    }
  },

  resolveCrawler: function resolveCrawler(req, res) {
    var requestedCrawler = req.originalUrl.replace('/crawler-', '');
    var inputsFiles = adminController.getInputFiles((0, _index.getConfig)().inputDir);

    (0, _index.getCrawlerConfigs)(__dirname + '/' + (0, _index.getConfig)().crawlerDir).then(function (crawlers) {
      crawlers.forEach(function (crawler) {
        if (crawler && crawler.file.indexOf(requestedCrawler) > -1) {
          console.log('Crawler has been found !');
          var crawlerPath = _path2.default.join('../', (0, _index.getConfig)().crawlerDir, requestedCrawler, '/index.js');
          var crawlerService = require(crawlerPath).crawler;
          if (typeof crawlerService.getIndexHtml === 'function') {
            var child = crawlerService.getIndexHtml(inputsFiles);
            res.render('crawler', { child: child });
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