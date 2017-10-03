import recursiveReadSync from 'recursive-readdir-sync';
import fs from 'fs';

import * as config from '../config/index.js';

export const adminController = {

  config: config.getConfig(),

  indexAction: (req, res) => {
    const template = 'home';
    const inputs = fs.readdirSync(__dirname + '/../' + config.inputDir);

    return config.getCrawlerConfigs(__dirname + '/../' + config.crawlerDir)
      .then(crawlers => {
        res.render(template, { inputs, crawlers });
      }).catch(err => {
        res.render(template, { err });
      });
  },

  chooseCrawlerAction: (req, res) => {
    const subTemplate = 'sub-crawler-setup';
    return res.render(subTemplate);
  }

}
