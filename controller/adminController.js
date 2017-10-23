import recursiveReadSync from 'recursive-readdir-sync';
import fs from 'fs';
import moment from 'moment';
import path from 'path';

import { getConfig, getCrawlerConfigs } from '../config/index.js';
import { Database } from '../service/Database.js';

export const adminController = {

  getInputFiles: inputDir => {
    const inputs = fs.readdirSync(inputDir);
    const inputsFiles = [];

    inputs.forEach(input => {
      if (['.xls', '.xlsx'].indexOf(path.extname(input)) > -1) {
          inputsFiles.push(input);
      }
    });

    return inputsFiles;
  },

  index: (req, res) => {
    const config = getConfig();
    const inputsFiles = adminController.getInputFiles(config.inputDir);
    const crawlerDir = path.resolve(__dirname + '/../../' + config.crawlerDir);
    let renderVars = { inputDir: config.inputDir, crawlerDir };

    getCrawlerConfigs(__dirname + '/../' + config.crawlerDir)
      .then(crawlers => renderVars = Object.assign(renderVars,
        { inputs: inputsFiles, crawlers: crawlers.map(i => i.config) })
      )
      .catch(err => renderVars = Object.assign(renderVars, { err }))
      .finally(() => res.render('home', renderVars)); // use bluebird to get finally
  },

  getJobs: (req, res) => {
    // want an ajax response
    if (req.xhr) {
      const query = 'select * from CRAWLER.`crawler_jobs`';

      Database.getConnection()
        .query(query, (err, rows, fields) => {
          if (err) {
            throw err;
          }
          const jobs = rows.map(row => {
            return {
              id: row['id'],
              name: row['crawler_name'],
              inputFile: row['input_file'],
              outputFile: row['output_file'],
              createdAt: row['creation_date'],
              createdAtString: moment(row['creation_date']).fromNow(),
              startedAt: row['start_date'],
              startedAtString: row['start_date'] ? moment(row['start_date']).fromNow() : '-',
              status: row['status'],
              step: row['step'],
              progress: row['progress']
            }
          });
          res.setHeader('Content-Type', 'application/json');
          res.send(JSON.stringify(jobs));
        });
      } else {
        res.render('jobs');
      }
  },

  submitCrawler: (req, res) => {
    // launch crawling
    if (!req.body.inputFileName) {
      throw new Error('invalid.crawler.form');
    }

    // display page
    const requestedCrawler = req.originalUrl.replace('/crawler-', '');
    const crawlerPath = path.join('../', getConfig().crawlerDir, requestedCrawler, '/index.js');
    const crawlerService = require(crawlerPath).crawler;
    let crawling = null;

    if (typeof crawlerService.createCrawlingJob === 'function') {
      crawling = crawlerService.createCrawlingJob({
        input: req.body.inputFileName,
        output: req.body.outputFileName || null,
      },
      (err, result) => {
        if (typeof crawlerService.getCrawlerHtml === 'function') {
          const child = crawlerService.getCrawlerHtml(err, result);
          res.render('crawler', { child });
        } else {
          console.log('getCrawlerHtml not found on ', crawlerPath);
        }
      });
    } else {
      console.log('createCrawlingJob not found on', crawlerPath);
    }
  },

  resolveCrawler: (req, res) => {
    const requestedCrawler = req.originalUrl.replace('/crawler-', '');
    const inputsFiles = adminController.getInputFiles(getConfig().inputDir);

    getCrawlerConfigs(__dirname + '/' + getConfig().crawlerDir)
      .then(crawlers => {
        crawlers.forEach(crawler => {
          if (crawler && crawler.file.indexOf(requestedCrawler) > -1) {
            console.log('Crawler has been found !');
            const crawlerPath = path.join('../', getConfig().crawlerDir, requestedCrawler, '/index.js');
            const crawlerService = require(crawlerPath).crawler;
            if (typeof crawlerService.getIndexHtml === 'function') {
              const child = crawlerService.getIndexHtml(inputsFiles);
              res.render('crawler', { child });
            } else {
              console.log('Cannot instanciate', crawler.config.name, crawlerPath);
            }
          } else {
            console.log('No slug for', crawler.config.name);
          }
        });
      }
    );
  }
}
