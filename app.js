import express from 'express';
import exphbs from 'express-handlebars';
import schedule from 'node-schedule';
import path from 'path';
import bodyParser from 'body-parser';

import { getConfig, getCrawlerConfigs } from './config/index.js';
import { adminController } from './controller/adminController.js';
import { Database } from './service/Database.js';

var job = schedule.scheduleJob('*/30 * * * * *', function(){
  console.log('Cron job arrived...');
  const inputs = adminController.getInputFiles(getConfig().inputDir);
  const db = Database.getConnection();
  const query = 'select * from `crawler_jobs` where status = "PENDING"';

  db.query(query, (err, rows, fields) => {
    if (err) {
      throw err;
    }
    rows.forEach(row => {
      const crawlerPath = path.join(row['crawler_path'], '/index.js');
      const crawlerService = require(crawlerPath).crawler;

      if (typeof crawlerService.crawl === 'function') {
        crawlerService.crawl(row['input_file'])
          .then(rows => console.log('message=', rows))
          .catch(() => console.log('An error occured.'));
      } else {
        console.log('Unable to get crawl method on crawler path', crawlerPath);
      }
    });
  });
});

const app = express();

app.engine('handlebars', exphbs());
app.set('view engine', 'handlebars');
app.set('views', __dirname + '/views');
app.use(express.static('public'));
app.use( bodyParser.json() );       // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
  extended: true
}))

app.get('/', adminController.index);
app.get('/crawler-*', adminController.resolveCrawler);
app.post('/crawler-*', adminController.submitCrawler);

app.listen(3000);
