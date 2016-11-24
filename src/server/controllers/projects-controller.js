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
    if (!this.authorisor.hasGeneralPermission(user, generalPermissions.CREATE_PROJECT)) {
      this.loggers.security.warn({user: user}, 'Unauthorised attempt to create a project');
      result.delay().status(httpStatuses.FORBIDDEN);
      return;
    }

    data = {
      id: data.id,
      name: data.name
    };

    var invalidItem = Project.schema.invalid(data);

    if (invalidItem) {
      this.loggers.main.warn({user: user}, 'Invalid data when trying to create a project');
      result.delay().status(httpStatuses.BAD_REQUEST).data({
        msg: `Mssing or invalid key: ${invalidItem}`
      });
      return;
    }

    var idExists = await this.projects.createProject({
      id: data.id,
      name: data.name
    });

    if (idExists) return result.status(httpStatuses.CONFLICT)

    return result.status(httpStatuses.CREATED);
  }

  async getNonMembers(result, user, projectId) {
    var hasPermission = await this.authorisor.hasProjectPermission(user, projectId, permissions.MANAGE_PROJECT_MEMBERS);

    if (!hasPermission) {
      this.loggers.security.warn({user: user}, `Unauthorised attempt to get project non-members (Project ID: ${projectId})`);
      result.delay().status(httpStatuses.FORBIDDEN);
      return;
    }

    var project = await this.projects.getProject(projectId);

    if (project == null) {
      this.loggers.main.info({user: user}, `Get non-members - Project not found: ${projectId}`);
      result.delay().status(httpStatuses.NOT_FOUND);
      return;
    }

    var nonMembers = await project.getNonMembers();

    result.data(nonMembers.map(user => user.serialise()));
  }
}

export default new ProjectsController(loggers.forClass('ProjectsController'), projects, authorisor);
