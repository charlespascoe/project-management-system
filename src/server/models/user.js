import Model from 'server/models/model';
import Schema from 'server/models/schema';
import AuthenticationToken from 'server/models/authentication-token';
import database from 'server/database/database';
import SqlUtils from 'server/database/sql-utils';

export default class User extends Model {
  constructor(database, data) {
    super(database, 'user', data, User.schema);

    this.authTokens = data.authTokens;
  }

  async delete() {
    this.active = false;
    await this.save();
  }

  // Static methods

  static async getUserByEmail(email) {
    var userQuery =
      'SELECT * FROM `user` WHERE `email` = :email;';

    var userResult = await User.database.queryForOne(userQuery, {email: email});

    if (userResult == null) return null;

    var authTokensQuery =
      'SELECT * FROM `authentication_token` WHERE `user_id` = :user_id;';

    userResult.authTokens = await User.database.query(authTokensQuery, {user_id: userResult.user_id});

    return new User(User.database, userResult);
  }

  static async getUserById(userId) {
    var userQuery =
      'SELECT * FROM `user` WHERE `user_id` = :user_id; ' +
      'SELECT * FROM `authentication_token` WHERE `user_id` = :user_id;';

    var results = await User.database.query(userQuery, {user_id: userId}),
        userResult = results[0][0],
        authTokensResult = results[1];

    if (userResult == null) return null;

    userResult.authTokens = authTokensResult.map((row) => new AuthenticationToken(User.database, row));

    return new User(User.database, userResult);
  }

  static async addUser(data) {
    var columnData = User.schema.mapPropertiesToColumns(data);

    if (columnData == null) throw new Error('Invalid data provided to UserManager.addUser');

    var query =
      'INSERT INTO `user` SET ' + SqlUtils.formatData(columnData) + ';';

    var result = await User.database.query(query, columnData);

    return result.insertId;
  }
}

User.schema = new Schema({
  id: {
    column: 'user_id',
    id: true,
    readonly: true
  },
  email: {
    column: 'email'
  },
  firstName: {
    column: 'first_name'
  },
  otherNames: {
    column: 'other_names'
  },
  passHash: {
    column: 'pass_hash'
  },
  active: {
    column: 'active'
  }
});

User.database = database;
