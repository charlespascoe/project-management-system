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

    if (data === null || typeof data != 'object') {
      result.delay().status(httpStatuses.BAD_REQUEST).data({
        msg: 'Invalid data object'
      });
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

    // By this point, a set password token would be generated and sent to the user's email so that they can set their password.
    // For now, their password defaults to 'pass1234' for the purpose of demonstration, because implementing the real functionality
    // would take too long.
    var newUser = await this.users.getUserById(userId);
    newUser.passHash = '$argon2i$v=19$m=4096,t=3,p=1$q83vASNFZ4k$V7yt2zgip4VEyPZvAU02EerNEt5mbOFwEKiyxTHVkG0';
    await newUser.save();

    result.status(httpStatuses.CREATED).data({
      id: userId
    });
  }

  async deleteUser(result, user, idOrEmail) {
    // Note: this method assumes that idOrEmail has already be validated and converted to a number (if it's an ID)

    if (typeof idOrEmail == 'string') idOrEmail = idOrEmail.toLowerCase();

    if (user.id == idOrEmail || user.email == idOrEmail) {
      this.loggers.security.warn({user: user}, 'User attempted to delete their own user');
      result.delay().status(httpStatuses.FORBIDDEN);
      return;
    }

    if (!this.authorisor.hasGeneralPermission(user, generalPermissions.DELETE_USER)) {
      this.loggers.security.warn({user: user}, 'Unauthorised attempt to delete another user');
      result.delay().status(httpStatuses.FORBIDDEN);
      return;
    }

    var otherUser;

    if (typeof idOrEmail == 'number') {
      otherUser = await this.users.getUserById(idOrEmail);
    } else if (typeof idOrEmail == 'string') {
      otherUser = await this.users.getUserByEmail(idOrEmail);
    }

    if (!otherUser) {
      this.loggers.main.warn({user: user}, `Non-existent user (User ID or email: ${idOrEmail})`);
      result.delay().status(httpStatuses.NOT_FOUND);
      return;
    }

    await otherUser.delete();

    result.status(httpStatuses.NO_CONTENT);
  }

  async getUsers(result, user, includeInactive) {
    if (!this.authorisor.hasGeneralPermission(user, generalPermissions.GET_OTHER_USER_DETAILS)) {
      this.loggers.security.warn({user: user}, 'Unauthorised attempt to get all users');
      result.delay().status(httpStatuses.FORBIDDEN);
      return;
    }

    var users = await this.users.getAllUsers(includeInactive);

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
      otherUser = await this.users.getUserById(idOrEmail);
    } else if (typeof idOrEmail == 'string') {
      otherUser = await this.users.getUserByEmail(idOrEmail);
    }

    if (!otherUser) {
      this.loggers.main.warn({user: user}, `Non-existent user (User ID or email: ${idOrEmail})`);
      result.delay().status(httpStatuses.NOT_FOUND);
      return;
    }

    result.data(otherUser.serialise());
  }

  async getUserAssignments(result, user, idOrEmail) {
    // Note: this method assumes that idOrEmail has already be validated and converted to a number (if it's an ID)

    this.loggers.main.debug({
      args: {
        result: result,
        user: user,
        idOrEmail: idOrEmail
      }
    }, 'getUserAssignments called');

    if (typeof idOrEmail == 'string') idOrEmail = idOrEmail.toLowerCase();

    if (idOrEmail !== user.id &&
        idOrEmail !== user.email.toLowerCase() &&
        !this.authorisor.hasGeneralPermission(user, generalPermissions.GET_OTHER_USER_DETAILS)) {
      this.loggers.security.warn({user: user}, `Unauthorised attempt to get another user's assignments (User ID or email: ${idOrEmail})`);
      result.delay().status(httpStatuses.FORBIDDEN);
      return;
    }

    var otherUser;

    if (idOrEmail === user.id || idOrEmail === user.email.toLowerCase()) {
      otherUser = user;
    } else if (typeof idOrEmail == 'number') {
      otherUser = await this.users.getUserById(idOrEmail);
    } else if (typeof idOrEmail == 'string') {
      otherUser = await this.users.getUserByEmail(idOrEmail);
    }

    if (!otherUser) {
      this.loggers.main.debug({user: user}, `Get User Assignments - User not found (User ID or email: ${idOrEmail})`);
      result.delay().status(httpStatuses.NOT_FOUND);
      return;
    }

    var projAssignments = await otherUser.getProjectAssignments();

    result.data(projAssignments.map(pa => pa.serialise()));
  }
}

export default new UsersController(loggers.forClass('UsersController'), authorisor, users);
