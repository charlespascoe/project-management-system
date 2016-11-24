import Model from 'server/models/model';
import Schema from 'server/models/schema';
import validate from 'server/validation';
import User from 'server/models/user';
import Role from 'server/models/role';
import ProjectAssignment from 'server/models/project-assignment';

export default class Project extends Model {
  constructor(database, data) {
    super(database, 'project', data, Project.schema);
  }

  async getMembers() {
    var query =
      'SELECT `role`.*, `user`.`user_id`, `user`.`first_name`, `user`.`other_names` FROM `user` ' +
      'INNER JOIN `project_assignment` ' +
        'ON `user`.`user_id` = `project_assignment`.`user_id` ' +
      'INNER JOIN `role` ' +
        'ON `role`.`role_id` = `project_assignment`.`role_id` ' +
      'WHERE `project_assignment`.`project_id` = :projectId ' +
      'ORDER BY `user`.`user_id`;';

    var results = await this._database.query(query, {projectId: this.id});

    var assignments = results.map(row => {
      var user = User.create(row);
      var role = Role.create(row);
      row.project_id = this.id;
      var assignment = ProjectAssignment.create(row, user, role);
      return assignment;
    });

    return assignments;
  }

  async getNonMembers() {
    var query =
      'SELECT `user`.`user_id`, `user`.`first_name`, `user`.`other_names` FROM `user` ' +
      'LEFT JOIN `project_assignment` ' +
        'ON `project_assignment`.`user_id` = `user`.`user_id` ' +
      'WHERE `user`.`email` IS NOT NULL AND ' +
        '(`project_assignment`.`project_id` != :projectId OR `project_assignment`.`project_id` IS NULL);';

    var results = await this._database.query(query, {projectId: this.id});

    var users = results.map(row => User.create(row));

    return users;
  }

  serialise() {
    return {
      id: this.id,
      name: this.name
    }
  }
}

Project.schema = new Schema({
  id: {
    column: 'project_id',
    id: true,
    validate: (val) => validate(val).isString().matches(/^[A-Z]{1,16}$/).isValid()
  },
  name: {
    column: 'project_name',
    validate: (val) => validate(val).isString().minLength(1).maxLength(64).isValid()
  }
});
