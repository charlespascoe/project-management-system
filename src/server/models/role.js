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

  hasPermission(permKey) {
    return this.permissions.find(p => p.key === permKey) != null;
  }
}

Role.schema = new Schema({
  id: {
    column: 'role_id',
    id: true
  },
  name: {
    column: 'role_name',
    validate: (val) => validate(val).isString().minLength(1).maxLength(64).isValid()
  }
});
