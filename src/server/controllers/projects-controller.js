import loggers from 'server/loggers';
import validate from 'server/validation';
import projects from 'server/database/projects';
import Project from 'server/models/project';
import authorisor from 'server/security/authorisor';
import generalPermissions from 'server/security/general-permissions';
import httpStatuses from 'http-status-codes';
import permissions from 'server/security/permissions';

export class ProjectsController {
  constructor(loggers, projects, authorisor) {
    this.loggers = loggers;
    this.projects = projects;
    this.authorisor = authorisor;
  }

  async getProjects(result, user) {
    if (!this.authorisor.hasGeneralPermission(user, generalPermissions.GET_ALL_PROJECTS)) {
      this.loggers.security.warn({user: user}, 'Unauthorised attempt to get all projects');
      result.delay().status(httpStatuses.FORBIDDEN);
      return;
    }

    var allProjects = await this.projects.getAllProjects();
    return result.data(allProjects.map(project => project.serialise()));
  }

  async createProject(result, user, data) {
    this.loggers.main.debug({
      args: {
        result: result,
        user: user,
        data: data
      }
    }, 'createProject called');

    if (!this.authorisor.hasGeneralPermission(user, generalPermissions.CREATE_PROJECT)) {
      this.loggers.security.warn({user: user}, 'Unauthorised attempt to create a project');
      result.delay().status(httpStatuses.FORBIDDEN);
      return;
    }

    data = {
      id: data.id,
      name: data.name,
      iconUrl: data.iconUrl
    };

    var invalidItem = Project.schema.invalid(data);

    if (invalidItem) {
      this.loggers.main.warn({user: user}, 'Invalid data when trying to create a project');
      result.delay().status(httpStatuses.BAD_REQUEST).data({
        msg: `Mssing or invalid key: ${invalidItem}`
      });
      return;
    }

    var idExists = await this.projects.createProject(data);

    if (idExists) {
      result.status(httpStatuses.CONFLICT);
      return;
    }

    result.status(httpStatuses.CREATED);
  }
}

export default new ProjectsController(loggers.forClass('ProjectsController'), projects, authorisor);
