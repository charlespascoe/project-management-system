import Model from 'server/models/model';
import Schema from 'server/models/schema';
import validate from 'server/validation';

export default class Permission extends Model {
  constructor(database, data) {
    super(database, 'permission', data, Permission.schema);
  }
}

Permission.schema = new Schema({
  id: {
    column: 'permission_id',
    id: true,
    readonly: true
  },
  key: {
    column: 'permission_key',
    readonly: true
  },
  description: {
    column: 'description',
    validate: (val) => validate(val).isString().maxLength(256).isValid()
  }
});
