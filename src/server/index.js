import 'source-map-support/register';
import database from 'server/database/database';
import loggers from 'server/loggers';
import users from 'server/database/users';
import express from 'express';
import rootRouter from 'server/routers/root';
import authRouter from 'server/routers/auth-router';
import bodyParser from 'body-parser';

const app = express();

app.locals.appName = 'Jeera';
app.locals.version = '0.0.0-DEV';

app.set('view engine', 'ejs');
app.set('views', __dirname + '/views/pages');

app.use('/public', express.static(__dirname + '/public'));
app.use(bodyParser.json());
app.use('/', rootRouter);
app.use('/auth/', authRouter);

app.listen(8080, (e) => e ? loggers.main.fatal({err: e}) : loggers.main.info('Listening on port 8080'));
