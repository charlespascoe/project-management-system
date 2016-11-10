import passwordHasher from 'server/security/password-hasher';
import users from 'server/database/users';
import authenticationTokens from 'server/database/authentication-tokens';
import CryptoUtils from 'server/crypto-utils';
import validate from 'server/validation';
import AuthenticationTokenPair from 'server/models/authentication-token-pair';

const keyLength = 32,
      accessExpiry = 60 * 60 * 1000,
      accessExpiryLong = 24 * 60 * 60 * 1000,
      refreshExpiry = 6 * 60 * 60 * 1000,
      refreshExpiryLong = 30 * 24 * 60 * 60 * 1000;

export class Authenticator {
  constructor(passHasher, users, authTokens, validate) {
    this.passHasher = passHasher;
    this.users = users;
    this.authTokens = authTokens;
    this.validate = validate;
  }

  async login(username, password, longExpiry) {
    var user = await this.users.getUserByEmail(username);

    if (user == null) return null;

    var correctPass = await this.passHasher.verifyUserPassword(password, user);

    if (!correctPass) return null;

    return await this.generateAuthenticationTokenPair(user, longExpiry);
  }

  async generateAuthenticationTokenPair(user, longExpiry = false) {
    var accessExpires = new Date(Date.now() + (longExpiry ? accessExpiryLong : accessExpiry)),
        refreshExpires = new Date(Date.now() + (longExpiry ? refreshExpiryLong : refreshExpiry));

    var accessToken = await CryptoUtils.randomBytes(keyLength),
        refreshToken = await CryptoUtils.randomBytes(keyLength);

    var authTokenPair = await this.authTokens.addTokenPair({
      userId: user.id,
      longExpiry: longExpiry,
      accessTokenHash: CryptoUtils.hash(accessToken).toString('hex'),
      accessTokenExpires: accessExpires,
      refreshTokenHash: CryptoUtils.hash(refreshToken).toString('hex'),
      refreshTokenExpires: refreshExpires
    });

    authTokenPair.accessToken = accessToken;
    authTokenPair.refreshToken = refreshToken;

    return authTokenPair;
  }

  async refreshTokenPair(user, authTokenPair, longExpiry = false) {
    var accessExpires = new Date(Date.now() + (authTokenPair.longExpiry || longExpiry ? accessExpiryLong : accessExpiry)),
        refreshExpires = new Date(Date.now() + (authTokenPair.longExpiry || longExpiry ? refreshExpiryLong : refreshExpiry));

    authTokenPair.accessToken = await CryptoUtils.randomBytes(keyLength);
    authTokenPair.accessTokenExpires = accessExpires;
    authTokenPair.refreshToken = await CryptoUtils.randomBytes(keyLength);
    authTokenPair.refreshTokenExpires = refreshExpires;

    await authTokenPair.save();

    return authTokenPair;
  }

  async getUserForToken(encodedToken, tokenType) {
    if (tokenType != 'access' && tokenType != 'refresh') return null;

    var parsedToken = AuthenticationTokenPair.parseBase64Token(encodedToken);

    if (parsedToken == null) return null;

    var user = await this.users.getUserById(parsedToken.userId);

    if (user == null) return null;

    var tokenHash = CryptoUtils.hash(parsedToken.token).toString('hex');

    var authTokenPair = user.authTokens.find(atp => atp[`${tokenType}TokenHash`] == tokenHash);

    if (authTokenPair == null) return null;

    user.requestToken = authTokenPair;

    return user;
  }
}

export default new Authenticator(passwordHasher, users, authenticationTokens, validate);
