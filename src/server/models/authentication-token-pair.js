import Model from 'server/models/model';
import Schema from 'server/models/schema';
import validate from 'server/validation';
import CryptoUtils from 'server/crypto-utils';

export default class AuthenticationTokenPair extends Model {
  get accessToken() { return this._accessToken; }
  set accessToken(buff) {
    this._accessToken = buff;
    this.accessTokenHash = CryptoUtils.hash(buff).toString('hex');
  }

  get refreshToken() { return this._refreshToken; }
  set refreshToken(buff) {
    this._refreshToken = buff;
    this.refreshTokenHash = CryptoUtils.hash(buff).toString('hex');
  }

  constructor(database, data) {
    super(database, 'authentication_token_pair', data, AuthenticationTokenPair.schema);

    this._accessToken = null;
    this._refreshToken = null;
  }

  serialise() {
    if (this.accessToken == null || this.refreshToken == null) return {};

    return {
      id: this.id,
      accessToken: Buffer.from(`${this.userId}:${this.accessToken.toString('hex')}`).toString('base64'),
      refreshToken: Buffer.from(`${this.userId}:${this.refreshToken.toString('hex')}`).toString('base64')
    };
  }

  static parseBase64Token(b64Token) {
    if (!validate(b64Token).isString().isBase64().isValid()) return null;

    var components = Buffer.from(b64Token, 'base64').toString('utf8').split(':');

    if (!validate(components[0]).matches(/[0-9]+/).isValid() ||
        !validate(components[1]).isHex().isValid()) {
      return null;
    }

    var userId = parseInt(components[0]),
        token = Buffer.from(components[1], 'hex');

    return {
      userId: userId,
      token: token
    };
  }
}

AuthenticationTokenPair.schema = new Schema({
  id: {
    column: 'token_id',
    id: true
  },
  longExpiry: {
    column: 'long_expiry'
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
