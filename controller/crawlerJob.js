import path from 'path';
import schedule from 'node-schedule';
import { Database } from '../service/Database.js';
import { progressHelper } from '../service/progressHelper.js';

export const crawlerJob = {

  doSchedule(config) {
    if (!config) {
      console.log('Invalid config!');
      return false;
    }
    schedule.scheduleJob(config.progressInterval, () => {
      console.log('Looking for pending crawling jobs.');
      const query = 'select * from CRAWLER.`crawler_jobs` '
                    + 'where status = \'PENDING\' '
                    + 'and crawler_path is not null';

      const db = Database.getConnection();
      db.query(query, (err, rows, fields) => {
        if (err) {
          throw err;
        }
        if (!rows || rows.length === 0) {
          console.log('No jobs to do yet...');
        }
        rows.forEach(row => {
          const crawlerPath = path.join(row['crawler_path'], '/index.js');
          const crawlerService = require(crawlerPath).crawler;

          if (typeof crawlerService.crawl === 'function') {
            progressHelper.updateStatus(row['id'], 'processing', true)
              .then(() => crawlerService.crawl(row['id'], row['input_file'], row['output_file'])
                .then(() => progressHelper.updateStatus(row['id'], 'completed', false))
                .catch(error => Promise.reject(error)))
              .catch(error => console.log('Error occured while crawling...', error));
          } else {
            console.log('Unable to get crawl method for path', crawlerPath);
          }
        });
      });
    });

  }

}
