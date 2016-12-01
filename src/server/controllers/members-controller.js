import loggers from 'server/loggers';
import projects from 'server/database/projects';
import httpStatuses from 'http-status-codes';
import permissions from 'server/security/permissions';
import authorisor from 'server/security/authorisor';
import Role from 'server/models/role';
import User from 'server/models/user';

export class MembersController {
  constructor(loggers, projects, authorisor) {
    this.loggers = loggers;
    this.projects = projects;
    this.authorisor = authorisor;
  }

  async getMembers(result, user, projectId) {
    // This method assumes projectId has been validated by middleware

    var userRole = user.getRoleInProject(projectId);

    // Get members only requires membership to the project or sysadmin privileges
    if (userRole == null && !user.isSysadminElevated) {
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

    var members = await project.getMembers();

    result.data(members.map(assignment => assignment.serialise()));
  }

  async addMember(result, user, projectId, data) {
    var authorised = await this.authorisor.hasProjectPermission(user, projectId, permissions.MANAGE_PROJECT_MEMBERS);

    if (!authorised) {
      this.loggers.security.warn({user: user}, `Unauthorised attempt to add a project member (Project ID: ${projectId}, User ID: ${userId}`);
      result.delay().status(httpStatuses.FORBIDDEN);
      return;
    }

    if (typeof data != 'object') {
      this.loggers.main.debug({user: user}, `Add Member - Invalid data type: ${typeof data}`);
      result.delay().status(httpStatuses.BAD_REQUEST);
      return;
    }

    if (!Role.schema.id.validate(data.roleId)) {
      this.loggers.main.debug({user: user}, `Add Member - Invalid Role ID: ${data.roleId}`);
      result.delay().status(httpStatuses.BAD_REQUEST);
      return;
    }

    var roleId = parseInt(data.roleId);

    if (!User.schema.id.validate(data.userId)) {
      this.loggers.main.debug({user: user}, `Add Member - Invalid User ID: ${data.userId}`);
      result.delay().status(httpStatuses.BAD_REQUEST);
      return;
    }

    var userId = parseInt(data.userId);

    var project = await this.projects.getProject(projectId);

    if (project == null) {
      this.loggers.main.info({user: user}, `Add Member - Project not found: ${projectId}`);
      result.delay().status(httpStatuses.NOT_FOUND);
      return;
    }

    var errorCode = await project.addMember(userId, roleId);

    if (errorCode == 'DUPLICATE') {
      this.loggers.main.warn({user: user}, `Add Member - User already assigned to project (Project ID: ${projectId}, User ID: ${userId})`);
      result.delay().status(httpStatuses.CONFLICT);
      return;
    }

    if (errorCode == 'NOT_FOUND') {
      this.loggers.main.warn({user: user}, `Add Member - User or Role not found (User ID: ${userId}, Role ID: ${roleId})`);
      result.delay().status(httpStatuses.NOT_FOUND);
      return;
    }

    if (errorCode != null) {
      this.loggers.main.error({user: user}, `Add Member - Unhandled error code: ${errorCode}`);
      result.delay().status(httpStatuses.INTERNAL_SERVER_ERROR);
      return;
    }

    this.loggers.main.info({user: user}, `Successfully added user ${userId} to project ${projectId} with role ${roleId}`);

    result.status(httpStatuses.NO_CONTENT);
  }
}

export default new MembersController(loggers.forClass('MembersController'), projects, authorisor);
