import loggers from 'server/loggers';
import projects from 'server/database/projects';
import users from 'server/database/users';
import roles from 'server/database/roles';
import httpStatuses from 'http-status-codes';
import permissions from 'server/security/permissions';
import authorisor from 'server/security/authorisor';
import Role from 'server/models/role';
import User from 'server/models/user';

export class MembersController {
  constructor(loggers, projects, users, roles, authorisor) {
    this.loggers = loggers;
    this.projects = projects;
    this.roles = roles;
    this.users = users;
    this.authorisor = authorisor;
  }

  async getMembers(result, user, projectId) {
    this.loggers.main.debug({
      args: {
        result: result,
        user: user,
        projectId: projectId
      }
    }, 'getMembers called');
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

  async getNonMembers(result, user, projectId) {
    this.loggers.main.debug({
      args: {
        result: result,
        user: user,
        projectId: projectId
      }
    }, 'getNonMembers called');
    var authorised = await this.authorisor.hasProjectPermission(user, projectId, permissions.MANAGE_PROJECT_MEMBERS);

    if (!authorised) {
      this.loggers.security.warn({user: user}, `Unauthorised attempt to get project non-members (Project ID: ${projectId})`);
      result.delay().status(httpStatuses.FORBIDDEN);
      return;
    }

    var project = await this.projects.getProject(projectId);

    if (project == null) {
      this.loggers.main.warn({user: user}, `Get non-members - Project not found: ${projectId}`);
      result.delay().status(httpStatuses.NOT_FOUND);
      return;
    }

    var nonMembers = await project.getNonMembers();

    result.data(nonMembers.map(user => user.serialise()));
  }

  async addMember(result, user, projectId, data) {
    this.loggers.main.debug({
      args: {
        result: result,
        user: user,
        projectId: projectId,
        data: data
      }
    }, 'addMember called');

    if (data === null || typeof data != 'object') {
      this.loggers.main.debug({user: user}, `Add Member - Invalid data type: ${data === null ? 'null' : typeof data}`);
      result.delay().status(httpStatuses.BAD_REQUEST).data({
        msg: 'Data must be an object'
      });
      return;
    }

    if (!Role.schema.id.validate(data.roleId)) {
      this.loggers.main.debug({user: user}, `Add Member - Invalid Role ID: ${data.roleId}`);
      result.delay().status(httpStatuses.BAD_REQUEST).data({
        msg: 'Invalid role ID'
      });
      return;
    }

    var roleId = parseInt(data.roleId);

    if (!User.schema.id.validate(data.userId)) {
      this.loggers.main.debug({user: user}, `Add Member - Invalid User ID: ${data.userId}`);
      result.delay().status(httpStatuses.BAD_REQUEST).data({
        msg: 'Invalid user ID'
      });
      return;
    }

    var userId = parseInt(data.userId);

    var authorised = await this.authorisor.hasProjectPermission(user, projectId, permissions.MANAGE_PROJECT_MEMBERS);

    if (!authorised) {
      this.loggers.security.warn({user: user}, `Unauthorised attempt to add a project member (Project ID: ${projectId}, User ID: ${userId})`);
      result.delay().status(httpStatuses.FORBIDDEN);
      return;
    }

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
      result.delay().status(httpStatuses.NOT_FOUND).data({
        msg: 'User or Role not found'
      });
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

  async updateMember(result, user, projectId, userId, data) {
    this.loggers.main.debug({
      args: {
        result: result,
        user: user,
        projectId: projectId,
        userId: userId,
        data: data
      }
    }, 'updateMember called');
    // Both projectId and userId will have been validated by this point

    if (data === null || typeof data != 'object') {
      this.loggers.main.debug({user: user}, `Update Member - Invalid data type: ${data === null ? 'null' : typeof data}`);
      result.delay().status(httpStatuses.BAD_REQUEST).data({
        msg: 'Data must be an object'
      });
      return;
    }

    if (!Role.schema.id.validate(data.roleId)) {
      this.loggers.main.debug({user: user}, `Update Member - Invalid Role ID: ${data.roleId}`);
      result.delay().status(httpStatuses.BAD_REQUEST).data({
        msg: 'Invalid role ID'
      });
      return;
    }

    var roleId = parseInt(data.roleId);

    var authorised = await this.authorisor.hasProjectPermission(user, projectId, permissions.MANAGE_PROJECT_MEMBERS);

    if (!authorised) {
      this.loggers.security.warn({user: user}, `Unauthorised attempt to update a project member (Project ID: ${projectId}, User ID: ${userId})`);
      result.delay().status(httpStatuses.FORBIDDEN);
      return;
    }

    var otherUser = await this.users.getUserById(userId);
    var projectAssignment = null;

    if (otherUser != null) projectAssignment = otherUser.getRoleInProject(projectId);

    if (projectAssignment == null) {
      this.loggers.main.warn({user: user}, `Update Member - User not found or not a member (User ID: ${userId})`);
      result.delay().status(httpStatuses.NOT_FOUND).data({
        msg: 'User not found or not a member'
      });
      return;
    }

    var role = await this.roles.getRoleById(roleId);

    if (role == null) {
      this.loggers.main.warn({user: user}, `Update Member - Role not found (Role ID: ${roleId})`);
      result.delay().status(httpStatuses.NOT_FOUND).data({
        msg: 'Role not found'
      });
      return;
    }

    projectAssignment.roleId = roleId;
    await projectAssignment.save();

    this.loggers.main.info({user: user}, `Updated user ${userId} role to ${roleId} in project ${projectId}`);

    result.status(httpStatuses.NO_CONTENT);
  }

  async removeMember(result, user, projectId, userId) {
    this.loggers.main.debug({
      args: {
        result: result,
        user: user,
        projectId: projectId,
        userId: userId
      }
    }, 'removeMember called');

    // Both projectId and userId will have been validated by this point

    var authorised = await this.authorisor.hasProjectPermission(user, projectId, permissions.MANAGE_PROJECT_MEMBERS);

    if (!authorised) {
      this.loggers.security.warn({user: user}, `Unauthorised attempt to remove a project member (Project ID: ${projectId}, User ID: ${userId})`);
      result.delay().status(httpStatuses.FORBIDDEN);
      return;
    }

    var otherUser = await this.users.getUserById(userId);
    var projectAssignment = null;

    if (otherUser != null) projectAssignment = otherUser.getRoleInProject(projectId);

    if (projectAssignment == null) {
      this.loggers.main.warn({user: user}, `Remove Member - User not found or not a member (User ID: ${userId})`);
      result.delay().status(httpStatuses.NOT_FOUND);
      return;
    }

    await projectAssignment.delete();

    this.loggers.main.info({user: user}, `Removed user ${userId} from project ${projectId}`);

    result.status(httpStatuses.NO_CONTENT);
  }
}

export default new MembersController(
  loggers.forClass('MembersController'),
  projects,
  users,
  roles,
  authorisor
);
