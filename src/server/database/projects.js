import database from 'server/database/database';
import Project from 'server/models/project';
import SqlUtils from 'server/database/sql-utils';

export class Projects {
  constructor(database) {
    this.database = database;
  }

  async getAllProjects() {
    var query =
      'SELECT * FROM `project`;';

    var results = await this.database.query(query);

    return results.map(row => new Project(this.database, row));
  }

  async createProject(data) {
    var columnData = Project.schema.mapPropertiesToColumns(data);
    console.log(columnData);

    if (columnData == null) throw new Error('Invalid data provided to Projects.addProject');

    var query =
      'INSERT INTO `project` SET ' + SqlUtils.formatData(columnData) + ';';

    try {
      var result = await this.database.query(query, columnData);
    } catch (e) {
      // project_id exists, return true
      if (e.code == 'ER_DUP_ENTRY') return true;
      throw e;
    }

    return false;
  }
}

export default new Projects(database);
