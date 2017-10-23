import recursiveReadSync from 'recursive-readdir-sync';
import Promise from 'bluebird';
import fs from 'fs';
import _ from 'lodash';

const dev = {
  database: {
    url: 'localhost',
    port: 3307,
    user: 'root',
    password: '',
    name: 'data_crawler'
  },
  inputDir: '/Users/chris/Documents/workspace/alexandre/input',
  outputDir: '/Users/chris/Documents/workspace/alexandre/output',
  crawlerDir: 'crawler/',
  progressInterval: '*/15 * * * * *' // means every 30 seconds
};

export function getConfig() {
  if (process.env.env === 'prod') {
    return dev;
  } else {
    return dev;
  }
}

const crawlerConfigs = [];

export function getCrawlerConfigs(crawlersPath) {
  return new Promise((resolve, reject) => {
    try {
      if (!crawlerConfigs || crawlerConfigs.length === 0) {
        const files = _.filter(recursiveReadSync(crawlersPath), file => file.indexOf('config.json') !== -1);

        files.forEach(file => {
          console.log(file);
          const content = fs.readFileSync(file, 'utf8');
          if (content !== null) {
            crawlerConfigs.push({ file, config: JSON.parse(content) });
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
