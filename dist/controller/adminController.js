'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.adminController = undefined;

var _recursiveReaddirSync = require('recursive-readdir-sync');

var _recursiveReaddirSync2 = _interopRequireDefault(_recursiveReaddirSync);

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _moment = require('moment');

var _moment2 = _interopRequireDefault(_moment);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _index = require('../config/index.js');

var _Database = require('../service/Database.js');

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

  getJobs: function getJobs(req, res) {
    // want an ajax response
    if (req.xhr) {
      var query = 'select * from CRAWLER.`crawler_jobs`';

      _Database.Database.getConnection().query(query, function (err, rows, fields) {
        if (err) {
          throw err;
        }
        var jobs = rows.map(function (row) {
          return {
            id: row['id'],
            name: row['crawler_name'],
            inputFile: row['input_file'],
            outputFile: row['output_file'],
            createdAt: row['creation_date'],
            createdAtString: (0, _moment2.default)(row['creation_date']).fromNow(),
            startedAt: row['start_date'],
            startedAtString: row['start_date'] ? (0, _moment2.default)(row['start_date']).fromNow() : '-',
            status: row['status'],
            step: row['step'],
            progress: row['progress']
          };
        });
        res.setHeader('Content-Type', 'application/json');
        res.send(JSON.stringify(jobs));
      });
    } else {
      res.render('jobs');
    }
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
    var crawling = null;

    if (typeof crawlerService.createCrawlingJob === 'function') {
      crawling = crawlerService.createCrawlingJob({
        input: req.body.inputFileName,
        output: req.body.outputFileName || null
      }, function (err, result) {
        if (typeof crawlerService.getCrawlerHtml === 'function') {
          var child = crawlerService.getCrawlerHtml(err, result);
          res.render('crawler', { child: child });
        } else {
          console.log('getCrawlerHtml not found on ', crawlerPath);
        }
      });
    } else {
      console.log('createCrawlingJob not found on', crawlerPath);
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