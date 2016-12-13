import Model from 'server/models/model';
import Schema from 'server/models/schema';
import validate from 'server/validation';
import database from 'server/database/database';

export default class Role extends Model {
  constructor(database, data, permissions) {
    super(database, 'role', data, Role.schema);
    this.permissions = permissions;
  }

  static create(data, permissions = null) {
    return new Role(database, data, permissions);
  }

  async getPermissions() {
    if (this.permissions) return this.permissions;

    var query =
      'SELECT * FROM `permission` ' +
      'INNER JOIN `role_permission` ' +
        'ON `role_permission`.`permission_id` = `permission`.`permission_id` ' +
      'WHERE `role_permission`.`role_id` = :roleId;';

    var results = await this._database.query(query, {roleId: this.id});

    this.permissions = results.map(row => ({id: row.permission_id, key: row.permission_key}));

    return this.permissions;
  }

  hasPermission(permission) {
    return this.permissions.find(p => p.key === permission.key) != null;
  }

  serialise() {
    var data = {
      id: this.id,
      name: this.name
    };

    if (this.permissions) data.permissions = this.permissions;

    return data;
  }
}

Role.schema = new Schema({
  id: {
    column: 'role_id',
    id: true,
    validate: val => validate(val).isString().matches(/^\d{1,11}$/).isValid() || validate(val).isNumber().min(1).max(99999999999).isValid()
  },
  name: {
    column: 'role_name',
    validate: val => validate(val).isString().minLength(1).maxLength(64).isValid()
  }
});
