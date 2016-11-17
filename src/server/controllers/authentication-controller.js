import authenticator from 'server/security/authenticator';
import loggers from 'server/loggers';
import Result from 'server/controllers/result';
import validate from 'server/validation';
import User from 'server/models/user';
import moment from 'moment';
import httpStatuses from 'http-status-codes';

export class AuthenticationController {
  constructor(authenticator, loggers) {
    this.authenticator = authenticator;
    this.loggers = loggers;
  }

  async getAuthToken(result, ipAddress, authenticationData, longExpiry) {
    if (validate(authenticationData).isString().matches(/^Basic [^\s]+/).isValid()) {
      var cred = this.parseBasicAuth(authenticationData.split(' ')[1]);

      if (cred == null) return result.delay().status(httpStatuses.BAD_REQUEST);

      // login method will validate username and password
      return await this.login(result, ipAddress, cred.username, cred.password, longExpiry);
    }

    if (validate(authenticationData).isString().matches(/^Bearer [^\s]+/).isValid()) {
      return await this.refreshTokenPair(result, ipAddress, authenticationData.split(' ')[1], longExpiry);
    }

    result.delay().status(httpStatuses.UNAUTHORIZED);
  }

  parseBasicAuth(basicAuthString) {
    if (!validate(basicAuthString).isBase64().isValid()) return null;

    var userPass = Buffer.from(basicAuthString, 'base64').toString('utf8'),
        colonIndex = userPass.indexOf(':');

    if (colonIndex < 0) return null;

    return {
      username: userPass.substring(0, colonIndex),
      password: userPass.substring(colonIndex + 1)
    };
  }

  async login(result, ipAddress, username, password, longExpiry) {
    if (!User.schema.email.validate(username) ||
        !validate(password).isString().minLength(1).maxLength(1024).isValid()) {
      this.loggers.security.warn({ip: ipAddress}, 'Invalid login attempt');
      return result.delay().status(httpStatuses.BAD_REQUEST);
    }

    var authTokenPair = await this.authenticator.login(username, password, longExpiry);

    if (authTokenPair == null) {
      this.loggers.security.warn({ip: ipAddress}, `Failed login attempt for ${username}`);
      return result.delay().status(httpStatuses.UNAUTHORIZED);
    }

    return result.data(authTokenPair.serialise());
  }

  async verifyAccessToken(result, ipAddress, accessToken) {
    var user = await this.authenticator.getUserForToken(accessToken, 'access');

    if (user == null) {
      this.loggers.security.warn({ip: ipAddress}, 'Request made using invalid access token');
      result.delay().status(httpStatuses.UNAUTHORIZED);
      return null;
    }

    if (!user.requestToken.accessTokenExpires || moment().isAfter(user.requestToken.accessTokenExpires)) {
      // Access token correct, but has expired - expected, so log only to debug
      this.loggers.security.debug({ip: ipAddress, user: user}, 'Access Token Expired');
      // Don't delay, because the client needs to send refresh, and the total refresh time should be kept to a minimum
      result.status(httpStatuses.UNAUTHORIZED);
      return null;
    }

    return user;
  }

  async refreshTokenPair(result, ipAddress, refreshToken, longExpiry) {
    var user = await this.authenticator.getUserForToken(refreshToken, 'refresh');

    if (user == null) {
      this.loggers.security.warn({ip: ipAddress}, 'Refresh request made using invalid refresh token');
      return result.delay().status(httpStatuses.UNAUTHORIZED);
    }

    if (!user.requestToken.refreshTokenExpires || moment().isAfter(user.requestToken.refreshTokenExpires)) {
      // Refresh token correct, but has expired - expected, so log only to debug
      this.loggers.security.debug({ip: ipAddress, user: user}, 'Refresh Token Expired');
      return result.delay().status(httpStatuses.UNAUTHORIZED);
    }

    var authTokenPair = await this.authenticator.refreshTokenPair(user, user.requestToken, longExpiry);

    return result.data(authTokenPair.serialise());
  }

  async deleteTokenPair(result, user, tokenId) {
    if (!validate(tokenId).optional().isString().matches(/^\d+$/).isValid()) {
      return result.delay().status(httpStatuses.BAD_REQUEST);
    }

    var authTokenPair;

    if (tokenId) {
      tokenId = parseInt(tokenId);

      authTokenPair = user.authTokens.find(atp => atp.id == tokenId);
    } else {
      authTokenPair = user.requestToken;
    }

    if (authTokenPair) {
      await authTokenPair.delete();
    }

    return result.status(httpStatuses.NO_CONTENT);
  }

  async elevateUser(result, user, base64Pass) {
    if (!validate(base64Pass).isBase64().isValid()) {
      this.loggers.security.debug({user: user}, 'Missing or invalid \'X-Additional-Auth\' header when requesting elevation');
      result.delay().status(httpStatuses.BAD_REQUEST).data({
        msg: 'Missing or invalid \'X-Additional-Auth\' header'
      });
      return;
    }

    var password = Buffer.from(base64Pass, 'base64').toString('utf8');

    var elevated = await this.authenticator.elevateUser(user, password);

    if (!elevated) {
      this.loggers.security.warn({user: user}, 'Unauthorised Sysadmin Elevation request');
      result.delay().status(httpStatuses.FORBIDDEN);
      return;
    }

    this.loggers.security.info({user: user}, `User has been granted Sysadmin priviledges (expires ${user.requestToken.sysadminElevationExpires})`);

    result.data({
      expires: user.requestToken.sysadminElevationExpires
    });
  }

  async dropElevation(result, user) {
    if (!user.sysadmin) {
      result.delay().status(httpStatuses.FORBIDDEN);
      return;
    }

    user.requestToken.sysadminElevationExpires = null;
    await user.requestToken.save();

    this.loggers.security.info({user: user}, 'User has dropped Sysadmin priviledges');

    result.status(httpStatuses.NO_CONTENT);
  }
}

export default new AuthenticationController(authenticator, loggers.forClass('AuthenticationController'));
