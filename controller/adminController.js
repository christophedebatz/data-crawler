import recursiveReadSync from 'recursive-readdir-sync';
import fs from 'fs';
import path from 'path';

import { getConfig, getCrawlerConfigs } from '../config/index.js';

export const adminController = {

  index: (req, res) => {
    const config = getConfig();
    const inputs = fs.readdirSync(config.inputDir);
    const inputsFiles = [];

    inputs.forEach(input => {
      if (['.xls', '.xlsx'].indexOf(path.extname(input)) > -1) {
          inputsFiles.push(input);
      }
    });

    const crawlerDir = path.resolve(__dirname + '/../../' + config.crawlerDir);
    let renderVars = { inputDir: config.inputDir, crawlerDir };

    return getCrawlerConfigs(__dirname + '/../' + config.crawlerDir)
    .then(crawlers => renderVars = Object.assign(renderVars,
        { inputs: inputsFiles, crawlers: crawlers.map(i => i.config) })
      )
      .catch(err => renderVars = Object.assign(renderVars, { err }))
      .finally(() => res.render('home', renderVars)); // use bluebird to get finally
  },

  resolveCrawler: (req, res) => {
    const requestedCrawler = req.originalUrl.replace('/crawler-', '');
    getCrawlerConfigs(__dirname + '/' + getConfig().crawlerDir)
      .then(crawlers => {
        crawlers.forEach(crawler => {
          if (crawler.file.indexOf(requestedCrawler) > -1) {
            const crawlerPath = path.join('../', getConfig().crawlerDir, requestedCrawler, '/index.js');
            const crawlerService = require(crawlerPath).crawler;
            if (typeof crawlerService['hello'] === 'function') {
              crawlerService.hello();
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
