import authenticator from 'server/security/authenticator';
import loggers from 'server/loggers';
import Result from 'server/controllers/result';
import validate from 'server/validation';
import User from 'server/models/user';
import moment from 'moment';

export class AuthenticationController {
  constructor(authenticator, loggers) {
    this.authenticator = authenticator;
    this.loggers = loggers;
  }

  async login(result, username, password) {
    if (!User.schema.email.validate(username) ||
        !validate(password).isString().minLength(1).maxLength(1024).isValid()) {
      this.loggers.security.warn('Invalid login attempt');
      return result.delay().status(400);
    }

    var authTokenPair = await this.authenticator.login(username, password);

    if (authTokenPair == null) {
      this.loggers.security.warn(`Failed login attempt for ${username}`);
      return result.delay().status(401);
    }

    return result.data({
      accessToken: authTokenPair.accessToken,
      refreshToken: authTokenPair.refreshToken
    });
  }

  async verifyAccessToken(result, ipAddress, accessToken) {
    var user = await this.authenticator.getUserForAccessToken(accessToken);

    if (user == null) {
      this.loggers.security.warn({ip: ipAddress}, 'Request made using invalid access token');
      return result.delay().status(401);
    }

    if (moment().isAfter(user.requestToken.accessTokenExpires)) {
      // Access token correct, but has expired - expected, so log only to debug
      this.loggers.security.debug({ip: ipAddress, user: user}, 'Access Token Expired');
      return result.delay().status(401);
    }

    return null;
  }
}

export default new AuthenticationController(authenticator, loggers);
