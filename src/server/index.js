import 'source-map-support/register';
import database from 'server/database/database';
import loggers from 'server/loggers';
import users from 'server/database/users';

(async function() {
  var result = await database.query('SELECT * FROM user;');
  loggers.main.debug(result);

  var userId = await users.addUser({
    email: `bob-${Date.now()}@gmail.com`,
    firstName: 'Bob',
    otherNames: 'Smith',
    passHash: '<hash>'
  });

  var user = await users.getUserById(userId);

  loggers.main.debug(user.firstName);
})().catch((err) => loggers.main.error(err));
