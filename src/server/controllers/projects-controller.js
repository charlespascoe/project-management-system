import loggers from 'server/loggers';
import validate from 'server/validation';
import projects from 'server/database/projects';
import Project from 'server/models/project';

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
      this.loggers.main.warn({user: user, loc: 'ProjectsController.createProject'}, 'Invalid data');
      return result.delay().status(400);
    }

    var projectId = await this.projects.addProject({
      id: data.id,
      name: data.name
    });

    return result.data({
      id: projectId
    });
  }

}

export default new ProjectsController(loggers, projects);
