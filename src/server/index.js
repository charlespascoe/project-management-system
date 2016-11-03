import 'source-map-support/register';
import database from 'server/database/database';
import loggers from 'server/loggers';
import users from 'server/database/users';
import express from 'express';
import bodyParser from 'body-parser';
import Result from 'server/controllers/result';
import config from 'server/config';
import routers from 'server/routers';
import authenticate from 'server/controllers/authenticate';

const app = express();
const port = 8080;

app.locals.appName = 'Jeera';
app.locals.version = '0.0.0-DEV';

app.set('view engine', 'ejs');
app.set('views', __dirname + '/views/pages');

app.use(function (req, res, next) {
  res.result = new Result(res);

  if (config.xForwardedFor) {
    req.ip = req.headers['x-forwarded-for'] || req.ip;
  }

  next();
});

app.use('/public', express.static(__dirname + '/public'));
app.use(bodyParser.json());

routers(app);

app.get('/something', authenticate, function (req, res) {
  res.status(200).json({result: true});
});

app.use(function (req, res) {
  loggers.main.warn({ip: req.ip}, `Route not found: ${req.path}`);
  res.result.delay().status(404).end();
});

app.listen(port, (e) => e ? loggers.main.fatal({err: e}) : loggers.main.info(`Listening on port ${port}`));
