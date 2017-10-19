import mysql from 'mysql';
import { getConfig } from '../config/index.js';

let connection = undefined;

export const Database = {

  getConnection: () => {
    if (!connection) {
      const config = getConfig().database;
      connection = mysql.createConnection({
        host: config.url,
        port: config.port,
        user: config.user,
        password: config.password,
        database: 'CRAWLER'
      });
    }
    return connection;
  }
}
