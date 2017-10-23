import Promise from 'bluebird';
import fs from 'fs';
import path from 'path';
import Handlebars from 'handlebars';
import Excel from 'exceljs';
import async from 'async';

import { Database } from '../../service/Database.js';
import { progressHelper } from '../../service/progressHelper.js';

export const crawler = {

  CrawlerSteps: {
    ACQUIRING: 'acquiring',
    CRAWLING: 'crawling',
    EXPORTING: 'exporting'
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

    const query = 'select * from CRAWLER.`crawler_jobs`' +
                  'where status = \'PENDING\'' +
                  'and crawler_name = \'' + crawlerName + '\'';

    const db = Database.getConnection();
      db.query(query, (err, rows, fields) => {
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
    let query = 'insert into CRAWLER.crawler_jobs set ?';

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

    const db = Database.getConnection();
    db.query(query, values, (err, results, fields) => {
      if (err) callback(err)
      else callback(null, results);
    });
  },

  crawl(jobId, inputFile, outputFile) {
    return new Promise((resolve, reject) => {
      if (!inputFile) {
        return reject(new Error('linkedin.input.invalid'));
      }

      // firstly, stream xls file
      const docStructure = crawler.getCrawlerConfig().inputStructure;
      const rowsPerPage = 50;
      let offsetRow = 2; // 1-based index, ignore first header

      const wb = new Excel.Workbook();
      //todo change path to input to feat properties
      return wb.xlsx.readFile(path.join(__dirname + '/../../../../input/' + inputFile))
        .then(() => wb.getWorksheet(1))
        .then(sheet => {
          progressHelper.updateProgress(jobId, 0, sheet.rowCount, crawler.CrawlerSteps.ACQUIRING);
          return sheet;
        })
        .then(sheet => {
          do {
            const limitRow = Math.min(sheet.rowCount, offsetRow + rowsPerPage);
            const rowsContent = [];

            for (let i = offsetRow; i < limitRow; i++) {
              const row = sheet.getRow(i);
              const rowContent = [null, jobId];

              for (let j = 0; j < docStructure.length; j++) {
                const index = docStructure[j].index;
                const cell = row.getCell(index).value;
                rowContent.push(cell);
              }

              rowsContent.push(rowContent);
            }

            offsetRow = offsetRow + rowsPerPage;
            const data = { offsetRow, rowCount: sheet.rowCount, jobId };
            const serieCallback = (list, callback) => crawler.storeRowsContent(data, list, callback);

            async.eachSeries(rowsContent, serieCallback, err => {
              if (err) console.log('An error occured while storing xls on database.', err);
            });

          } while (offsetRow < sheet.rowCount);

          return sheet;
        })
        .then(sheet => new Promise((resolve, reject) =>
            progressHelper.updateProgress(jobId, 0, sheet.rowCount, crawler.CrawlerSteps.CRAWLING)
            .then(() => resolve(sheet))
            .catch(err => reject(err))
        ))
        .then(sheet => {
          console.log('Now crawl about ', sheet.rowCount, ' data...');
          

          resolve(sheet.rowCount);
        });

      // then search on google via api
      // then open linkedin profile page
      // then parse linked in profile page
      // then consolidate database
      // then export in a new xls output file
    });

  },

  storeRowsContent(data, rowsContent, callback) {
    if (rowsContent && data.jobId && data.rowCount && data.offsetRow) {
      const insertQuery = 'insert into CRAWLER.`crawler_users_linkedin_step_1` values (?)';
      Database.getConnection().query(insertQuery, [rowsContent], err => {
        rowsContent = [];
        if (err) return callback(err);
        progressHelper.updateProgress(data.jobId, data.offsetRow, data.rowCount, crawler.CrawlerSteps.ACQUIRING)
          .then(() => callback());
      });
    }
  }

};
