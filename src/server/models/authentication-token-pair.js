import Model from 'server/models/model';
import Schema from 'server/models/schema';

export default class AuthenticationTokenPair extends Model {
  constructor(database, data) {
    super(database, 'authentication_token_pair', data, AuthenticationTokenPair.schema);
  }
}

AuthenticationTokenPair.schema = new Schema({
  id: {
    column: 'token_id',
    id: true
  },
  userId: {
    column: 'user_id',
    readonly: true
  },
  accessTokenHash: {
    column: 'access_token_hash'
  },
  accessTokenExpires: {
    column: 'access_token_expires'
  },
  refreshTokenHash: {
    column: 'refresh_token_hash'
  },
  refreshTokenExpires: {
    column: 'refresh_token_expires'
  }
});
