import 'source-map-support/register';
import database from 'server/database/database';
import loggers from 'server/loggers';
import users from 'server/database/users';
import express from 'express';
import bodyParser from 'body-parser';
import Result from 'server/controllers/result';
import config from 'server/config';
import routers from 'server/routers';
import authenticate from 'server/middleware/authenticate';
import cors from 'cors';
import httpStatuses from 'http-status-codes';
import fs from 'fs';

const app = express();
const port = 8080;

app.locals.appName = 'Jeera';
app.locals.version = '0.0.0-DEV';

app.disable('x-powered-by');

app.use(function (req, res, next) {
  res.result = new Result(res);

  if (config.xForwardedFor) {
    req.ip = req.headers['x-forwarded-for'] || req.ip;
  }

  next();
});

app.get('/', function (req, res) {
  fs.readFile(__dirname + '/public/index.html', 'utf-8', function (err, html) {
    if (err) {
      res.status(500).end();
    } else {
      res.send(html);
    }
  });
});

app.use(function (err, req, res, next) {
  loggers.main.error({err: err});
  res.result.delay().status(httpStatuses.INTERNAL_SERVER_ERROR).end();
});

app.use(cors());

app.use('/public', express.static(__dirname + '/public'));
app.use(bodyParser.json());

routers(app);

app.use(function (req, res) {
  loggers.main.debug({ip: req.ip}, `Route not found: ${req.path}`);
  res.result.delay().status(httpStatuses.NOT_FOUND).end();
});

app.listen(port, (e) => e ? loggers.main.fatal({err: e}) : loggers.main.info(`Listening on port ${port}`));
