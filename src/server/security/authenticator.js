import passwordHasher from 'server/security/password-hasher';
import users from 'server/database/users';
import authenticationTokens from 'server/database/authentication-tokens';
import CryptoUtils from 'server/crypto-utils';
import validate from 'server/validation';

const keyLength = 32,
      accessExpiry = 24 * 60 * 60 * 1000,
      refreshExpiry = 30 * 24 * 60 * 60 * 1000;

export class Authenticator {
  constructor(passHasher, users, authTokens, validate) {
    this.passHasher = passHasher;
    this.users = users;
    this.authTokens = authTokens;
    this.validate = validate;
  }

  async login(username, password) {
    var user = await this.users.getUserByEmail(username);

    if (user == null) return null;

    var correctPass = await this.passHasher.verifyUserPassword(password, user);

    if (!correctPass) return null;

    return await this.generateAuthenticationTokenPair(user);
  }

  async generateAuthenticationTokenPair(user, accessExpires = null, refreshExpires = null) {
    var accessToken = await CryptoUtils.randomBytes(keyLength),
        refreshToken = await CryptoUtils.randomBytes(keyLength);

    if (accessExpires == null) {
      accessExpires = new Date(Date.now() + accessExpiry);
    }

    if (refreshExpires == null) {
      refreshExpires = new Date(Date.now() + refreshExpiry);
    }

    await this.authTokens.addToken({
      userId: user.id,
      accessTokenHash: CryptoUtils.hash(accessToken).toString('hex'),
      accessTokenExpires: accessExpires,
      refreshTokenHash: CryptoUtils.hash(refreshToken).toString('hex'),
      refreshTokenExpires: refreshExpires
    });

    return {
      accessToken: Buffer.from(`${user.id}:${accessToken.toString('hex')}`).toString('base64'),
      refreshToken: Buffer.from(`${user.id}:${refreshToken.toString('hex')}`).toString('base64')
    };
  }

  parseBase64Token(b64Token) {
    if (!this.validate(b64Token).isString().isBase64().isValid()) return null;

    var components = Buffer.from(b64Token, 'base64').toString('utf8').split(':');

    if (!this.validate(components[0]).matches(/[0-9]+/).isValid() ||
        !this.validate(components[1]).isHex().isValid()) {
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

export default new Authenticator(passwordHasher, users, authenticationTokens, validate);
