import authorisor from 'server/security/authorisor';
import users from 'server/database/users';
import validate from 'server/validation';
import httpStatuses from 'http-status-codes';
import generalPermissions from 'server/security/general-permissions';
import loggers from 'server/loggers';
import User from 'server/models/user';

const className = 'UserController';
export class UserController {
  constructor(loggers, authorisor, users) {
    this.loggers = loggers;
    this.authorisor = authorisor;
    this.users = users;
  }

  async getUser(result, user, idOrEmail) {
    loggers.main.debug(`${idOrEmail} (${typeof idOrEmail})`);
    const loc = `${className}.getUser`;

    // Note: this method assumes that idOrEmail has already be validated and converted to a number (if it's an ID)

    if (typeof idOrEmail == 'string') idOrEmail = idOrEmail.toLowerCase();

    if (idOrEmail === user.id || idOrEmail === user.email.toLowerCase()) {
      result.data(user.serialise());
      return;
    }

    if (!this.authorisor.hasGeneralPermission(user, generalPermissions.GET_OTHER_USER_DETAILS)) {
      this.loggers.security.warn({user: user, loc: loc}, `Unauthorised attempt to get another user (User ID or email: ${idOrEmail})`);
      result.delay().status(httpStatuses.FORBIDDEN);
      return;
    }

    var otherUser;

    if (typeof idOrEmail == 'number') {
      otherUser = this.users.getUserById(idOrEmail);
    } else if (typeof idOrEmail == 'string') {
      otherUser = this.users.getUserByEmail(idOrEmail);
    }

    if (!otherUser) {
      this.loggers.main.warn({user: user, loc: loc}, `Non-existent user (User ID or email: ${idOrEmail}`);
      result.delay().status(httpStatuses.NOT_FOUND);
      return;
    }

    result.data(otherUser.serialise());
  }
}

export default new UserController(loggers, authorisor, users);
