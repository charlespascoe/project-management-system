import Model from 'server/models/model';
import Schema from 'server/models/schema';
import validate from 'server/validation';
import database from 'server/database/database';
import roles from 'server/database/roles';

export default class ProjectAssignment extends Model {
  // roles should be instance of the class defined in server/database/roles
  constructor(database, data, roles, user = null, role = null, project = null) {
    super(database, 'project_assignment', data, ProjectAssignment.schema);
    this.roles = roles;
    this.user = user;
    this.role = role;
    this.project = project;
  }

  static create(data, user = null, role = null, project = null) {
    return new ProjectAssignment(database, data, roles, user, role, project);
  }

  async getRole() {
    if (this.role) return role;
    this.role = await this.roles.getRoleById(this.roleId);
    return this.role;
  }

  serialise() {
    var data = {
      project: {
        id: this.projectId
      },
      user: {
        id: this.userId
      },
      role: {
        id: this.roleId
      }
    };

    if (this.user) {
      data.user.firstName = this.user.firstName;
      data.user.otherNames = this.user.otherNames;
    }

    if (this.role) {
      data.role.name = this.role.name;
    }

    if (this.project) {
      data.project.name = this.project.name;
    }

    return data;
  }
}

ProjectAssignment.schema = new Schema({
  projectId: {
    column: 'project_id',
    id: true
  },
  userId: {
    column: 'user_id',
    id: true
  },
  roleId: {
    column: 'role_id'
  }
});
