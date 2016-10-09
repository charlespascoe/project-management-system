import 'source-map-support/register';
import database from 'server/database/database';
import loggers from 'server/loggers';
import User from 'server/models/user';

(async function() {
  var result = await database.query('SELECT * FROM user;');
  loggers.main.debug(result);

  var userId = await User.addUser({
    email: `bob-${Date.now()}@gmail.com`,
    firstName: 'Bob',
    otherNames: 'Smith',
    passHash: '<hash>'
  });

  var user = await User.getUserById(userId);

  loggers.main.debug(user.firstName);
})().catch((err) => loggers.main.error(err));
