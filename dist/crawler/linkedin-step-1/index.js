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

var _Database = require('../../service/Database.js');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var crawler = exports.crawler = {
  hello: function hello() {
    console.log('Hello Linkedin');
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
    var query = 'select * from `crawler_jobs` where status = "PENDING" and crawler_name = \'' + crawlerName + '\'';

    _Database.Database.getConnection().query(query, function (err, rows, fields) {
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
    var db = _Database.Database.getConnection();
    var query = 'insert into CRAWLER.crawler_jobs SET ?';

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

    db.query(query, values, function (err, results, fields) {
      if (err) callback(err);else callback(null, results);
    });
  },
  crawl: function crawl(inputFile) {
    return new _bluebird2.default(function (resolve, reject) {
      if (!inputFile) {
        return reject(new Error('linkedin.input.invalid'));
      }

      console.log('inputFile crawler=', inputFile);
      return resolve('ok');
      // now crawl with given options
      // open options.sourceFile xls file
      // parse results, add them to mysql
      // then search on google via api
      // then open linkedin profile page
      // then parse linked in profile page
      // then consolidate database
      // then export in a new xls output file
    });
  }
};