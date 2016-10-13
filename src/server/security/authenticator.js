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

    var correctPass = await this.passwordHasher.verifyUserPassword(password, user);

    if (!correctPass) return null;

    return user;
  }

  async generateAuthenticationToken(user, accessExpires = null, refreshExpires = null) {
    var accessKey = await CryptoUtils.randomBytes(keyLength),
        refreshKey = await CryptoUtils.randomBytes(keyLength);

    if (accessExpires == null) {
      accessExpires = new Date(Date.now() + accessExpiry);
    }

    if (refreshExpires == null) {
      refreshExpires = new Date(Date.now() + refreshExpiry);
    }

    await this.authTokens.addToken({
      userId: user.id,
      accessKeyHash: CryptoUtils.hash(accessKey).toString('hex'),
      accessKeyExpires: accessExpires,
      refreshKeyHash: CryptoUtils.hash(refreshKey).toString('hex'),
      refreshKeyExpires: refreshExpires
    });

    return {
      accessKey: accessKey,
      refreshKey: refreshKey
    };
  }
}

export default new Authenticator(passwordHasher, users, authenticationTokens);
