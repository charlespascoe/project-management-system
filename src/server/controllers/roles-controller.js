import loggers from 'server/loggers';
import roles from 'server/database/roles';

export class RolesController {
  constructor(loggers, roles) {
    this.loggers = loggers;
    this.roles = roles;
  }

  async getRoles(result, user) {
    var roles = await this.roles.getRoles();

    result.data(roles.map(role => role.serialise()));
  }
}

export default new RolesController(loggers.forClass('RolesController'), roles);
