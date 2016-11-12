import Model from 'server/models/model';
import Schema from 'server/models/schema';
import validate from 'server/validation';

export default class User extends Model {
  constructor(database, data, authTokens, projectAssignments) {
    super(database, 'user', data, User.schema);

    this.authTokens = authTokens;
    this.projectAssignments = projectAssignments;
  }

  async delete() {
    this.active = false;
    await this.save();
  }
}

User.schema = new Schema({
  id: {
    column: 'user_id',
    id: true,
    readonly: true,
    validate: (id) => validate(id).isString().matches(/^\d{1,11}$/).isValid() || validate(id).isNumber().min(1).max(99999999999).isValid()
  },
  email: {
    column: 'email',
    validate: (email) => validate(email).isString().minLength(1).maxLength(128).isValid()
  },
  firstName: {
    column: 'first_name'
  },
  otherNames: {
    column: 'other_names'
  },
  passHash: {
    column: 'pass_hash'
  },
  active: {
    column: 'active'
  },
  sysadmin: {
    column: 'sysadmin',
    readonly: true
  }
});
