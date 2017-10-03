import express from 'express';
import exphbs from 'express-handlebars';

import { getConfig, getCrawlerConfigs } from './config/index.js';
import { adminController } from './controller/adminController.js';

const app = express();

app.engine('handlebars', exphbs());
app.set('view engine', 'handlebars');
app.set('views', __dirname + '/views');

app.get('/', adminController.indexAction);

getCrawlerConfigs(__dirname + '/' + getConfig().crawlerDir)
  .then(crawler => {
    app.get('/' + crawler.slug, () => adminController.chooseCrawler(crawler));
  }
);


app.listen(3000);
