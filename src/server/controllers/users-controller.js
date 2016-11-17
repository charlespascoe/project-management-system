import authorisor from 'server/security/authorisor';
import users from 'server/database/users';
import validate from 'server/validation';
import httpStatuses from 'http-status-codes';
import generalPermissions from 'server/security/general-permissions';
import loggers from 'server/loggers';
import User from 'server/models/user';

export class UsersController {
  constructor(loggers, authorisor, users) {
    this.loggers = loggers;
    this.authorisor = authorisor;
    this.users = users;
  }

  async addUser(result, user, data) {
    if (!this.authorisor.hasGeneralPermission(user, generalPermissions.ADD_USER)) {
      this.loggers.security.warn({user: user}, 'Unauthorised attempt to add a user');
      result.delay().status(httpStatuses.FORBIDDEN);
      return;
    }

    // Removes other keys
    data = {
      email: data.email,
      firstName: data.firstName,
      otherNames: data.otherNames
    };

    var invalidItem = User.schema.invalid(data);

    if (invalidItem) {
      result.delay().status(httpStatuses.BAD_REQUEST).data({
        msg: `Missing or invalid key: '${invalidItem}'`
      });
      return;
    }

    var userId = await this.users.addUser(data);

    if (userId == null) {
      result.status(httpStatuses.CONFLICT);
      return;
    }

    result.status(httpStatuses.CREATED).data({
      id: userId
    });
  }

  async getUsers(result, user) {
    if (!this.authorisor.hasGeneralPermission(user, generalPermissions.GET_OTHER_USER_DETAILS)) {
      this.loggers.security.warn({user: user}, 'Unauthorised attempt to get all users');
      result.delay().status(httpStatuses.FORBIDDEN);
      return;
    }

    var users = await this.users.getAllUsers();

    result.data(users.map(user => user.serialise()));
  }

  async getUser(result, user, idOrEmail) {
    // Note: this method assumes that idOrEmail has already be validated and converted to a number (if it's an ID)

    if (typeof idOrEmail == 'string') idOrEmail = idOrEmail.toLowerCase();

    if (idOrEmail === user.id || idOrEmail === user.email.toLowerCase()) {
      result.data(user.serialise());
      return;
    }

    if (!this.authorisor.hasGeneralPermission(user, generalPermissions.GET_OTHER_USER_DETAILS)) {
      this.loggers.security.warn({user: user}, `Unauthorised attempt to get another user (User ID or email: ${idOrEmail})`);
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
      this.loggers.main.warn({user: user}, `Non-existent user (User ID or email: ${idOrEmail}`);
      result.delay().status(httpStatuses.NOT_FOUND);
      return;
    }

    result.data(otherUser.serialise());
  }
}

export default new UsersController(loggers.forClass('UsersController'), authorisor, users);
