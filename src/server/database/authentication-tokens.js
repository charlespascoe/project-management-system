import AuthenticationToken from 'server/models/authentication-token';
import database from 'server/database/database';

export class AuthenticationTokens {
  constructor(database) {
    this.database = database;
  }

  async getAuthTokenById(id) {
    var query =
      'SELECT * FROM `authentication_token` WHERE `token_id` = :token_id;';

    var result = await this.database.queryForOne(query, {token_id: id});

    return new AuthenticationToken(this.database, result);
  }

  async addToken(data) {
    var columnData = AuthenticationToken.schema.mapPropertiesToColumns(data);

    delete columnData.token_id;

    if (columnData == null) throw new Error('Invalid data provided to AuthenticationTokens.addToken');

    var query =
      'INSERT INTO `authentication_token` SET ' + SqlUtils.formatData(columnData) + ';';

    var result = await this.database.query(query, columnData);

    return result.insertId;
  }
}

export default new AuthenticationTokens(database);
