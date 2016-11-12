import loggers from 'server/loggers';
import validate from 'server/validation';
import projects from 'server/database/projects';
import Project from 'server/models/project';
import httpStatuses from 'http-status-codes';

export class ProjectsController {
  constructor(loggers, projects) {
    this.loggers = loggers;
    this.projects = projects;
  }

  async getProjects(result, user) {
    var allProjects = await this.projects.getAllProjects();
    return result.data(allProjects.map(project => project.serialise()));
  }

  async createProject(result, user, data) {
    if (!Project.schema.name.validate(data.name) ||
        !Project.schema.id.validate(data.id)) {
      this.loggers.main.warn({user: user}, 'Invalid data');
      return result.delay().status(httpStatuses.BAD_REQUEST);
    }

    var idExists = await this.projects.createProject({
      id: data.id,
      name: data.name
    });

    if (idExists) return result.status(httpStatuses.CONFLICT)

    return result.status(httpStatuses.CREATED);
  }

}

export default new ProjectsController(loggers.forClass('ProjectsController'), projects);
