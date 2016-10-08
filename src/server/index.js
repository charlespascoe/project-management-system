import database from './database/database';
import loggers from './loggers';

database.query('SELECT * FROM user;')
  .then((result) => loggers.db.debug(result))
  .catch((err) => loggers.db.error(err));

