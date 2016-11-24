import User from 'server/models/user';
import AuthenticationTokenPair from 'server/models/authentication-token-pair';
import SqlUtils from 'server/database/sql-utils';
import database from 'server/database/database';
import roles from 'server/database/roles';
import ProjectAssignment from 'server/models/project-assignment';

export class Users {
  constructor(database, roles) {
    this.database = database;
    this.roles = roles;
  }

  async getAllUsers(includeInactive) {
    var query =
      `SELECT * FROM \`user\`${includeInactive ? '' : ' WHERE `email` IS NOT NULL'} ORDER BY \`user_id\`;`;

    var results = await this.database.query(query);

    return results.map(row => new User(database, row));
  }

  async getUserByEmail(email) {
    var userQuery =
      'SELECT `user_id` FROM `user` WHERE `email` = :email;';

    var userResult = await this.database.queryForOne(userQuery, {email: email.toLowerCase()});

    if (userResult == null) return null;

    return await this.getUserById(userResult.user_id);
  }

  async getUserById(userId) {
    var userQuery =
      'SELECT * FROM `user` WHERE `user_id` = :user_id; ' +
      'SELECT * FROM `authentication_token_pair` WHERE `user_id` = :user_id; ' +
      'SELECT * FROM `project_assignment` WHERE `user_id` = :user_id;';

    var results = await this.database.query(userQuery, {user_id: userId}),
        userResult = results[0][0],
        authTokensResult = results[1],
        assignmentResult = results[2]

    if (userResult == null) return null;

    var authTokens = authTokensResult.map(row => new AuthenticationTokenPair(this.database, row));
    var assignments = assignmentResult.map(row => new ProjectAssignment(this.database, row));

    return new User(this.database, userResult, authTokens, assignments);
  }

  async addUser(data) {
    var columnData = User.schema.mapPropertiesToColumns(data);

    if (columnData == null) throw new Error('Invalid data provided to Users.addUser');

    var query =
      'INSERT INTO `user` SET ' + SqlUtils.formatData(columnData) + ';';

    try {
      var result = await this.database.query(query, columnData);
    } catch (e) {
      // email exists, return null
      if (e.code == 'ER_DUP_ENTRY') return null;
      throw e;
    }

    return result.insertId;
  }
}

export default new Users(database, roles);
