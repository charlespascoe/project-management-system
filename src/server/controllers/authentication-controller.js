import authenticator from 'server/security/authenticator';
import loggers from 'server/loggers';
import Result from 'server/controllers/result';

export class AuthenticationController {
  constructor(authenticator, loggers) {
    this.authenticator = authenticator;
    this.loggers = loggers;
  }

  async login(username, password) {
    var result = new Result();

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
}

export default new AuthenticationController(authenticator, loggers);
