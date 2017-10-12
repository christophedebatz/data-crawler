'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getConfig = getConfig;
exports.getCrawlerConfigs = getCrawlerConfigs;

var _recursiveReaddirSync = require('recursive-readdir-sync');

var _recursiveReaddirSync2 = _interopRequireDefault(_recursiveReaddirSync);

var _bluebird = require('bluebird');

var _bluebird2 = _interopRequireDefault(_bluebird);

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var dev = {
  database: {
    user: 'root',
    password: 'root',
    port: 3306,
    name: 'data_crawler'
  },
  inputDir: '/Users/chris/Documents/workspace/alexandre/input',
  outputDir: '/Users/chris/Documents/workspace/alexandre/output',
  crawlerDir: 'crawler/'
};

function getConfig() {
  if (process.env.env === 'prod') {
    return dev;
  } else {
    return dev;
  }
}

var crawlerConfigs = [];

function getCrawlerConfigs(crawlersPath) {
  return new _bluebird2.default(function (resolve, reject) {
    try {
      if (!crawlerConfigs || crawlerConfigs.length === 0) {
        var files = _lodash2.default.filter((0, _recursiveReaddirSync2.default)(crawlersPath), function (file) {
          return file.indexOf('config.json') !== -1;
        });

        files.forEach(function (file) {
          console.log(file);
          var content = _fs2.default.readFileSync(file, 'utf8');
          if (content !== null) {
            crawlerConfigs.push({ file: file, config: JSON.parse(content) });
          }
        });
      }
      return resolve(crawlerConfigs);
    } catch (err) {
      if (err.errno === 34) {
        err = new Error('wrong.crawlers.path');
      }
      return reject(err);
    }
  });
}