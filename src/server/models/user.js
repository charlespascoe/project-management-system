import Model from './model';

export default class User extends Model {
  constructor(database, data) {
    super(database, 'user', User.schema, data);

    this.authTokens = data.authTokens;
  }

  async delete() {
    this.active = false;
    await this.save();
  }
}

User.schema = {
  user_id: {
    property: 'id',
    id: true,
    readonly: true
  },
  email: {
    property: 'email'
  },
  first_name: {
    property: 'firstName'
  },
  other_names: {
    property: 'otherNames'
  },
  pass_hash: {
    property: 'passHash'
  },
  active: {
    property: 'active'
  }
};
