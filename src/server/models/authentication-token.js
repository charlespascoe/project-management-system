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
  userId: {
    column: 'user_id',
    readonly: true
  },
  accessKeyHash: {
    column: 'access_token_hash',
    readonly: true
  },
  accessKeyExpires: {
    column: 'access_token_expires',
    readonly: true
  },
  refreshKeyHash: {
    column: 'refresh_token_hash',
    readonly: true
  },
  refreshKeyExpires: {
    column: 'refresh_token_expires',
    readonly: true
  }
});
