import SqlUtils from '../database/sql-utils';
import User from '../models/user';
import AuthenticationToken from '../models/authentication-token';
import Model from '../models/model';
import database from '../database/database';

export class UserManager {
  constructor(database) {
    this.database = database;
  }

  async getUser(email) {
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

    userResult.authTokens = authTokensResult.map(function (row) {
      return new AuthenticationToken(this.database, row);
    }.bind(this));

    return new User(this.database, userResult);
  }

  async addUser(data) {
    var columnData = Model.mapPropertiesToColumns(User.schema, data);

    if (columnData == null) throw new Error('Invalid data provided to UserManager.addUser');

    var query =
      'INSERT INTO `user` SET ' + SqlUtils.formatData(columnData) + ';';

    var result = await this.database.query(query, columnData);

    return result.insertId;
  }
}

export default new UserManager(database);
