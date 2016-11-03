import Model from 'server/models/model';
import Schema from 'server/models/schema';
import validate from 'server/validation';

export class ProjectAssignment extends Model {
  // roles should be instance of the class defined in server/database/roles
  constructor(database, data, roles) {
    super(database, 'project_assignment', data, ProjectAssignment.schema);
    this._roles = roles;
  }

  async getRole() {
    this.role = await this._roles.getRoleById(this.roleId);
    return this.role;
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
