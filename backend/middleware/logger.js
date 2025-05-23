const { format } = require('date-fns');
const { v4: uuid } = require('uuid');
const fs = require('fs');
const fsPromises = require('fs').promises;
const path = require('path');

const logEvents = async (message, logFileName) => {
 const dateTime = format(new Date(), 'ddMMyyyy\tHH:mm:ss');
 const logMessage = `${dateTime}\t${uuid()}\t${message}\n`;

 try {
  if (!fs.existsSync(path.join(__dirname, '..', 'logs'))) {
   await fsPromises.mkdir(path.join(__dirname, '..', 'logs'));
  }
  await fsPromises.appendFile(path.join(__dirname, '..', 'logs', logFileName), logMessage);
 } catch (error) {
   console.error(error);
  }
}

const logger = (req, res, next) => {
 logEvents(`${req.method}\t${req.url}\t${req.headers.origin}`, 'requestLog.log');
 console.log(`${req.method} ${req.path}`);
 next();
}

module.exports = { logEvents, logger };