import Model from './model';

export default class AuthenticationToken extends Model {
  constructor(database, data) {
    super(database, 'authentication_token', AuthenticationToken.schema, data);
  }
}

AuthenticationToken.schema = {
  token_id: {
    property: 'id',
    id: true,
    readonly: true
  },
  access_token_hash: {
    property: 'accessTokenHash',
    readonly: true
  },
  access_token_expires: {
    property: 'accessTokenExpires',
    readonly: true
  },
  refresh_token_hash: {
    property: 'refreshTokenHash',
    readonly: true
  },
  refresh_token_expires: {
    property: 'refreshTokenExpires',
    readonly: true
  }
};
