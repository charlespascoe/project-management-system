import Model from 'server/models/model';
import ProjectAssignment from 'server/models/project-assignment';
import Role from 'server/models/role';
import Project from 'server/models/project';
import database from 'server/database/database';
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

  static create(data, authTokens = null, projectAssignments = null) {
    return new User(database, data, authTokens, projectAssignments);
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

  async getProjectAssignments() {
    var query =
      'SELECT `project_assignment`.`user_id`, `project`.*, `role`.* FROM `project_assignment` ' +
      'INNER JOIN `role` ' +
        'ON `role`.`role_id` = `project_assignment`.`role_id` ' +
      'INNER JOIN `project` ' +
        'ON `project`.`project_id` = `project_assignment`.`project_id` ' +
      'WHERE `user_id` = :user_id ORDER BY `project_id`;';

    var results = await this._database.query(query, {user_id: this.id});

    this.projectAssignments = results.map(row => ProjectAssignment.create(row, null, Role.create(row), Project.create(row)));

    return this.projectAssignments;
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
    validate: (email) => validate(email).isString().minLength(1).maxLength(128).isProbablyEmail().isValid()
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
