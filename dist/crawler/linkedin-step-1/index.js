'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.crawler = undefined;

var _bluebird = require('bluebird');

var _bluebird2 = _interopRequireDefault(_bluebird);

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var crawler = exports.crawler = {
  hello: function hello() {
    console.log('Hello Linkedin');
  },
  getIndexHtml: function getIndexHtml(options) {
    var content = _fs2.default.readFileSync('./views/index.handlebars', 'utf8');
    var template = Handlebars.compile(content);
    var context = { name: 'Christophe' };
    return template(context);
  },
  crawl: function crawl(options) {
    return new new _bluebird2.default(function (resolve, reject) {
      if (!options || !options.sourceFile) {
        return reject(new Error('linkedin.options.invalid'));
      }
      // now crawl with given options
      // open options.sourceFile xls file
      // parse results, add them to mysql
      // then search on google via api
      // then open linkedin profile page
      // then parse linked in profile page
      // then consolidate database
      // then export in a new xls output file
    })();
  }
};