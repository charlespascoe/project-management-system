import Model from 'server/models/model';
import Schema from 'server/models/schema';

export default class AuthenticationToken extends Model {
  constructor(database, data) {
    super(database, 'authentication_token', data, AuthenticationToken.schema);
  }
}

AuthenticationToken.schema = new Schema({
  id: {
    column: 'token_id',
    id: true,
    readonly: true
  },
  accessTokenHash: {
    column: 'access_token_hash',
    readonly: true
  },
  accessTokenExpires: {
    column: 'access_token_expires',
    readonly: true
  },
  refreshTokenHash: {
    column: 'refresh_token_hash',
    readonly: true
  },
  refreshTokenExpires: {
    column: 'refresh_token_expires',
    readonly: true
  }
});
