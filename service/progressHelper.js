import { Database } from './Database.js';

export const progressHelper = {

  updateProgress(jobId, current, total, step) {
    return new Promise((resolve, reject) => {
      if (!jobId) {
        return reject('unknow.job.id');
      }
      const percent = Math.ceil(current / total * 100);
      const query = 'update CRAWLER.`crawler_jobs` set step = ?, progress = ? where id = ?';

      Database.getConnection().query(query, [step, percent, jobId], (err, rows, fields) => {
        if (err) return reject(err);
        return resolve();
      });
    });
  },

  updateStatus(jobId, status, isStart = true) {
    if (!jobId) {
      return reject('unknow.job.id');
    }
    return new Promise((resolve, reject) => {
      const moment = isStart ? 'start_date' : 'end_date';
      const db = Database.getConnection();
      const query = 'update CRAWLER.`crawler_jobs` set status = ?, ?? = ? where id = ?';
      db.query(query, [ status.toUpperCase(), moment, new Date(), jobId ], (err, rows, fields) => {
        if (err) return reject(err);
        console.log('Job', jobId, 'is now', status);
        resolve(status);
      });
    })
  }

}
