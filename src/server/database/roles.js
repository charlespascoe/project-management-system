import database from 'server/database/database';
import Role from 'server/models/role';

export class Roles {
  constructor(database) {
    this.database = database;
  }

  async getRoles() {
    var query =
      'SELECT * FROM `role` ORDER BY `role_id`;';

    var results = await this.database.query(query);

    return results.map(row => new Role(this.database, row));
  }

  async getRoleById(roleId) {
    var query =
      'SELECT * FROM `role` WHERE `role_id` = :role_id ORDER BY `role_id`; ' +
      'SELECT * FROM `permission` ' +
        'INNER JOIN `role_permission` ' +
        'ON `role_permission`.`permission_id` = `permission`.`permission_id` '
      'WHERE `role_permission`.`role_id` = :role_id;';

    var results = await this.database.query(query, {role_id: roleId});

    if (results[0].length == 0) return null;

    var permissions = results[1]
      .map(row => row.permission_id);

    return new Role(this.database, results[0][0], permissions);
  }
}

export default new Roles(database);
