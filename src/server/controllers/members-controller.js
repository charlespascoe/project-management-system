import loggers from 'server/loggers';
import projects from 'server/database/projects';
import httpStatuses from 'http-status-codes';

export class MembersController {
  constructor(loggers, projects) {
    this.loggers = loggers;
    this.projects = projects;
  }

  async getMembers(result, user, projectId) {
    // This method assumes projectId has been validated by middleware

    var userRole = user.getRoleInProject(projectId);

    // Get members only requires membership to the project or sysadmin privileges
    if (userRole == null && user.isSysadminElevated) {
      this.loggers.security.warn({user: user}, `Unauthorised attempt to get project members (Project ID: ${projectId})`);
      result.delay().status(httpStatuses.FORBIDDEN);
      return;
    }

    var project = await this.projects.getProject(projectId);

    if (project == null) {
      this.loggers.main.info({user: user}, `Project not found: ${projectId}`);
      result.delay().status(httpStatuses.NOT_FOUND);
      return;
    }

    console.log(project);

    var members = await project.getMembers();

    result.data(members.map(assignment => assignment.serialise()));

  }
}

export default new MembersController(loggers.forClass('MembersController'), projects);
