//logging.js
//==========

require('dotenv').config();
const log4js = require('log4js');
console.log(process.env.loglevel);

const LOGLEVEL = process.env.loglevel;
console.log(LOGLEVEL);


log4js.configure(
  {
    appenders: { paxbot: {type: 'file', filename: 'logs/pax.log' } },
    categories: { default: { appenders: ['paxbot'], level: LOGLEVEL } }
  }
);
const logger = log4js.getLogger('paxbot');

var log = {
  //Function to input log entry under INFO tier
  //Takes string input
  info: function (msg) {
    console.log('[INFO] ' + msg);
    logger.info(msg);
  },

  //Function to input log entry under Error tier
  //Takes string input
  error: function (msg) {
    console.error('[ERROR] ' + msg);
    logger.error(msg);
  },

  //Function to input log entry under DEBUG tier
  //Takes string input
  debug: function (msg) {
    logger.debug(msg);
    if (LOGLEVEL=='debug') {
      console.error('[DEBUG] ' + msg);
    }
  }
};

module.exports = log;
