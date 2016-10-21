import authenticator from 'server/security/authenticator';
import loggers from 'server/loggers';
import Result from 'server/controllers/result';
import validate from 'server/validation';
import User from 'server/models/user';

export class AuthenticationController {
  constructor(authenticator, loggers) {
    this.authenticator = authenticator;
    this.loggers = loggers;
  }

  async login(username, password) {
    var result = new Result();

    if (!User.schema.email.validate(username) ||
        !validate(password).isString().minLength(1).maxLength(1024).isValid()) {
      this.loggers.security.warn('Invalid login request');
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
}

export default new AuthenticationController(authenticator, loggers);
