import Model from './model';
import Schema from './schema';

export default class User extends Model {
  constructor(database, data) {
    super(database, 'user', data, User.schema);

    this.authTokens = data.authTokens;
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
    readonly: true
  },
  email: {
    column: 'email'
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
  }
});
