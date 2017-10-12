import Promise from 'bluebird';
import fs from 'fs';
import path from 'path';
import Handlebars from 'handlebars';

export const crawler = {

  hello() {
    console.log('Hello Linkedin');
  },

  getIndexHtml(files) {
    const content = fs.readFileSync(__dirname + '/views/index.handlebars', 'utf8');
    const template = Handlebars.compile(content);
    return template({ files });
  },

  crawl(options) {
    return new new Promise((resolve, reject) => {
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
    });

  }

};
