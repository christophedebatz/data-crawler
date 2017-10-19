import Promise from 'bluebird';
import fs from 'fs';
import path from 'path';
import Handlebars from 'handlebars';

import { Database } from '../../service/Database.js';

export const crawler = {

  hello() {
    console.log('Hello Linkedin');
  },

  getCrawlerConfig() {
    const jsonConfig = fs.readFileSync(__dirname + '/config.json');
    return JSON.parse(jsonConfig);
  },

  getIndexHtml(files) {
    const content = fs.readFileSync(__dirname + '/views/index.handlebars', 'utf8');
    const template = Handlebars.compile(content);
    return template({ files });
  },

  getCrawlerHtml(err, result) {
    const content = fs.readFileSync(__dirname + '/views/creation.handlebars', 'utf8');
    const template = Handlebars.compile(content);
    const crawlerName = crawler.getCrawlerConfig().name;
    const query = 'select * from `crawler_jobs` where status = "PENDING" and crawler_name = \'' + crawlerName + '\'';

    Database.getConnection()
      .query(query, (err, rows, fields) => {
        if (err) {
          throw err;
        }
        rows.forEach(row => {
          console.log('row=', row);
        });
      }
    );

    return template({ err, tasks: [] });
  },

  createCrawlingJob(options, callback) {
    // options.input
    // options.output
    const db = Database.getConnection();
    let query = 'insert into CRAWLER.crawler_jobs SET ?';

    const crawlerConfig = crawler.getCrawlerConfig();
    const values = {
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

    db.query(query, values, (err, results, fields) => {
      if (err) callback(err)
      else callback(null, results);
    });
  },

  crawl(inputFile) {
    return new Promise((resolve, reject) => {
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
