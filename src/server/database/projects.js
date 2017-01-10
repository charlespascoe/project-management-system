import database from 'server/database/database';
import Project from 'server/models/project';
import SqlUtils from 'server/database/sql-utils';

export class Projects {
  constructor(database) {
    this.database = database;
  }

  async getAllProjects() {
    var query =
      'SELECT * FROM `project` ORDER BY `project_id`;';

    var results = await this.database.query(query);

    return results.map(row => new Project(this.database, row));
  }

  async getProject(projectId) {
    var query =
      'SELECT * FROM `project` WHERE `project`.`project_id` = :projectId;';

    var result = await this.database.queryForOne(query, {projectId: projectId});

    if (result == null) return null;

    return new Project(this.database, result);
  }

  async createProject(data) {
    var columnData = Project.schema.mapPropertiesToColumns(data);

    if (columnData == null) throw new Error('Invalid data provided to Projects.addProject');

    var query =
      'INSERT INTO `project` SET ' + SqlUtils.formatData(columnData) + ';';

    try {
      var result = await this.database.query(query, columnData);
    } catch (e) {
      // project_id exists, return false
      if (e.code == 'ER_DUP_ENTRY') return false;
      throw e;
    }

    return true;
  }
}

export default new Projects(database);
