import express from 'express';
import exphbs from 'express-handlebars';

import { getConfig, getCrawlerConfigs } from './config/index.js';
import { adminController } from './controller/adminController.js';

const app = express();

app.engine('handlebars', exphbs());
app.set('view engine', 'handlebars');
app.set('views', __dirname + '/views');
app.use(express.static('public'));

app.get('/', adminController.index);
app.get('/crawler-*', adminController.resolveCrawler);

app.listen(3000);
