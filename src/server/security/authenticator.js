import passwordHasher from 'server/security/password-hasher';
import users from 'server/database/users';
import authenticationTokens from 'server/database/authentication-tokens';
import CryptoUtils from 'server/crypto-utils';

const keyLength = 32,
      accessExpiry = 24 * 60 * 60 * 1000,
      refreshExpiry = 30 * 24 * 60 * 60 * 1000;

export class Authenticator {
  constructor(passHasher, users, authTokens) {
    this.passHasher = passHasher;
    this.users = users;
    this.authTokens = authTokens;
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
      accessToken: accessToken,
      refreshToken: refreshToken
    };
  }
}

export default new Authenticator(passwordHasher, users, authenticationTokens);
