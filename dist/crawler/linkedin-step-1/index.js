'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.crawler = undefined;

var _bluebird = require('bluebird');

var _bluebird2 = _interopRequireDefault(_bluebird);

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _handlebars = require('handlebars');

var _handlebars2 = _interopRequireDefault(_handlebars);

var _exceljs = require('exceljs');

var _exceljs2 = _interopRequireDefault(_exceljs);

var _async = require('async');

var _async2 = _interopRequireDefault(_async);

var _Database = require('../../service/Database.js');

var _progressHelper = require('../../service/progressHelper.js');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var crawler = exports.crawler = {

  CrawlerSteps: {
    ACQUIRING: 'acquiring',
    CRAWLING: 'crawling',
    EXPORTING: 'exporting'
  },

  getCrawlerConfig: function getCrawlerConfig() {
    var jsonConfig = _fs2.default.readFileSync(__dirname + '/config.json');
    return JSON.parse(jsonConfig);
  },
  getIndexHtml: function getIndexHtml(files) {
    var content = _fs2.default.readFileSync(__dirname + '/views/index.handlebars', 'utf8');
    var template = _handlebars2.default.compile(content);
    return template({ files: files });
  },
  getCrawlerHtml: function getCrawlerHtml(err, result) {
    var content = _fs2.default.readFileSync(__dirname + '/views/creation.handlebars', 'utf8');
    var template = _handlebars2.default.compile(content);
    var crawlerName = crawler.getCrawlerConfig().name;

    var query = 'select * from CRAWLER.`crawler_jobs`' + 'where status = \'PENDING\'' + 'and crawler_name = \'' + crawlerName + '\'';

    var db = _Database.Database.getConnection();
    db.query(query, function (err, rows, fields) {
      if (err) {
        throw err;
      }
      rows.forEach(function (row) {
        console.log('row=', row);
      });
    });
    return template({ err: err, tasks: [] });
  },
  createCrawlingJob: function createCrawlingJob(options, callback) {
    // options.input
    // options.output
    var query = 'insert into CRAWLER.crawler_jobs set ?';

    var crawlerConfig = crawler.getCrawlerConfig();
    var values = {
      crawler_name: crawlerConfig.name,
      crawler_path: __dirname,
      input_file: options.input,
      output_file: options.output || crawlerConfig.slug,
      creation_date: new Date(),
      start_date: null,
      end_date: null,
      id: null,
      status: 'PENDING'
    };

    var db = _Database.Database.getConnection();
    db.query(query, values, function (err, results, fields) {
      if (err) callback(err);else callback(null, results);
    });
  },
  crawl: function crawl(jobId, inputFile, outputFile) {
    return new _bluebird2.default(function (resolve, reject) {
      if (!inputFile) {
        return reject(new Error('linkedin.input.invalid'));
      }

      // firstly, stream xls file
      var docStructure = crawler.getCrawlerConfig().inputStructure;
      var rowsPerPage = 50;
      var offsetRow = 2; // 1-based index, ignore first header

      var wb = new _exceljs2.default.Workbook();
      //todo change path to input to feat properties
      return wb.xlsx.readFile(_path2.default.join(__dirname + '/../../../../input/' + inputFile)).then(function () {
        return wb.getWorksheet(1);
      }).then(function (sheet) {
        _progressHelper.progressHelper.updateProgress(jobId, 0, sheet.rowCount, crawler.CrawlerSteps.ACQUIRING);
        return sheet;
      }).then(function (sheet) {
        var _loop = function _loop() {
          var limitRow = Math.min(sheet.rowCount, offsetRow + rowsPerPage);
          var rowsContent = [];

          for (var i = offsetRow; i < limitRow; i++) {
            var row = sheet.getRow(i);
            var rowContent = [null, jobId];

            for (var j = 0; j < docStructure.length; j++) {
              var index = docStructure[j].index;
              var cell = row.getCell(index).value;
              rowContent.push(cell);
            }

            rowsContent.push(rowContent);
          }

          offsetRow = offsetRow + rowsPerPage;
          var data = { offsetRow: offsetRow, rowCount: sheet.rowCount, jobId: jobId };
          var serieCallback = function serieCallback(list, callback) {
            return crawler.storeRowsContent(data, list, callback);
          };

          _async2.default.eachSeries(rowsContent, serieCallback, function (err) {
            if (err) console.log('An error occured while storing xls on database.', err);
          });
        };

        do {
          _loop();
        } while (offsetRow < sheet.rowCount);

        return sheet;
      }).then(function (sheet) {
        return new _bluebird2.default(function (resolve, reject) {
          return _progressHelper.progressHelper.updateProgress(jobId, 0, sheet.rowCount, crawler.CrawlerSteps.CRAWLING).then(function () {
            return resolve(sheet);
          }).catch(function (err) {
            return reject(err);
          });
        });
      }).then(function (sheet) {
        // crawling here
        console.log('now crawl about ', sheet.rowCount, ' data...');
        resolve(sheet.rowCount);
      });

      // then search on google via api
      // then open linkedin profile page
      // then parse linked in profile page
      // then consolidate database
      // then export in a new xls output file
    });
  },
  storeRowsContent: function storeRowsContent(data, rowsContent, callback) {
    if (rowsContent && data.jobId && data.rowCount && data.offsetRow) {
      var insertQuery = 'insert into CRAWLER.`crawler_users_linkedin_step_1` values (?)';
      _Database.Database.getConnection().query(insertQuery, [rowsContent], function (err) {
        rowsContent = [];
        if (err) return callback(err);
        _progressHelper.progressHelper.updateProgress(data.jobId, data.offsetRow, data.rowCount, crawler.CrawlerSteps.ACQUIRING).then(function () {
          return callback();
        });
      });
    }
  }
};