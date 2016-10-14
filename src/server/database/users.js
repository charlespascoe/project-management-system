import User from 'server/models/user';
import AuthenticationTokenPair from 'server/models/authentication-token-pair';
import SqlUtils from 'server/database/sql-utils';
import database from 'server/database/database';

export class Users {
  constructor(database) {
    this.database = database;
  }

  async getUserByEmail(email) {
    var userQuery =
      'SELECT * FROM `user` WHERE `email` = :email;';

    var userResult = await this.database.queryForOne(userQuery, {email: email});

    if (userResult == null) return null;

    var authTokensQuery =
      'SELECT * FROM `authentication_token` WHERE `user_id` = :user_id;';

    userResult.authTokens = await this.database.query(authTokensQuery, {user_id: userResult.user_id});

    return new User(this.database, userResult);
  }

  async getUserById(userId) {
    var userQuery =
      'SELECT * FROM `user` WHERE `user_id` = :user_id; ' +
      'SELECT * FROM `authentication_token` WHERE `user_id` = :user_id;';

    var results = await this.database.query(userQuery, {user_id: userId}),
        userResult = results[0][0],
        authTokensResult = results[1];

    if (userResult == null) return null;

    userResult.authTokens = authTokensResult.map((row) => new AuthenticationTokenPair(this.database, row));

    return new User(this.database, userResult);
  }

  async addUser(data) {
    var columnData = User.schema.mapPropertiesToColumns(data);

    if (columnData == null) throw new Error('Invalid data provided to Users.addUser');

    var query =
      'INSERT INTO `user` SET ' + SqlUtils.formatData(columnData) + ';';

    var result = await this.database.query(query, columnData);

    return result.insertId;
  }
}

export default new Users(database);
