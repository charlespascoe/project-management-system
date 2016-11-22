import Model from 'server/models/model';
import Schema from 'server/models/schema';
import validate from 'server/validation';
import moment from 'moment';

export default class User extends Model {
  get isSysadminElevated() {
    return (
      this.sysadmin &&
      this.requestToken.sysadminElevationExpires &&
      moment().isBefore(this.requestToken.sysadminElevationExpires)
    );
  }


  get active() { return this.email != null; }

  constructor(database, data, authTokens, projectAssignments) {
    super(database, 'user', data, User.schema);

    this.authTokens = authTokens;
    this.projectAssignments = projectAssignments;
  }

  serialise() {
    var data = {
      id: this.id,
      email: this.email,
      firstName: this.firstName,
      otherNames: this.otherNames,
      sysadmin: this.sysadmin
    };

    if (this.requestToken) {
      data.sysadminElevationExpires = this.requestToken.sysadminElevationExpires;
    }

    return data;
  }

  getRoleInProject(projectId) {
    return this.projectAssignments.find(assignment => assignment.projectId === projectId);
  }

  async delete() {
    this.email = null;
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
    column: 'first_name',
    validate: (firstName) => validate(firstName).isString().minLength(1).maxLength(64).isValid()
  },
  otherNames: {
    column: 'other_names',
    validate: (otherNames) => validate(otherNames).isString().minLength(1).maxLength(128).isValid()
  },
  passHash: {
    column: 'pass_hash'
  },
  sysadmin: {
    column: 'sysadmin',
    readonly: true,
    getter: (sysadmin) => sysadmin ? true : false // Converts int (as stored in database) to boolean
  }
});
