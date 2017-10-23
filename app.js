import express from 'express';
import exphbs from 'express-handlebars';
import bodyParser from 'body-parser';

import { getConfig } from './config/index.js';
import { adminController } from './controller/adminController.js';
import { crawlerJob } from './controller/crawlerJob.js';

const config = getConfig();
crawlerJob.doSchedule(config);

const app = express();

app.engine('handlebars', exphbs());
app.set('view engine', 'handlebars');
app.set('views', __dirname + '/views');
app.use(express.static('public'));
app.use(bodyParser.json() );       // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
  extended: true
}))

app.get('/', adminController.index);
app.get('/jobs', adminController.getJobs);
app.get('/crawler-*', adminController.resolveCrawler);
app.post('/crawler-*', adminController.submitCrawler);

app.listen(3000);
