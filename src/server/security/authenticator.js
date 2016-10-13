import passwordHasher from 'server/security/password-hasher';
import users from 'server/database/users';

export class Authenticator {
  constructor(passHasher, users) {
    this.passHasher = passHasher;
    this.users = users;
  }

  async login(username, password) {
    var user = await this.users.getUserByEmail(username);

    if (user == null) return null;

    var correctPass = await this.passwordHasher.verifyUserPassword(password, user);

    if (!correctPass) return null;

    return user;
  }
}

export default new Authenticator(passwordHasher, users);
