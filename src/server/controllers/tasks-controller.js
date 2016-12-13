import loggers from 'server/loggers';
import validation from 'server/validation';
import authorisor from 'server/security/authorisor';
import permissions from 'server/security/permissions';
import projects from 'server/database/projects';
import httpStatuses from 'http-status-codes';
import Task from 'server/models/task';
import moment from 'moment';

export class TasksController {
  constructor(loggers, authorisor, projects) {
    this.loggers = loggers;
    this.authorisor = authorisor;
    this.projects = projects;
  }

  async getTasks(result, user, projectId) {
    this.loggers.main.debug({
      args: {
        result: result,
        user: user,
        projectId: projectId
      }
    }, 'getTasks called');


  }

  async addTask(result, user, projectId, data) {
    this.loggers.main.debug({
      args: {
        result: result,
        user: user,
        projectId: projectId,
        data: data
      }
    }, 'addTask called');

    var authorised = await this.authorisor.hasProjectPermission(user, projectId, permissions.ADD_TASKS);

    if (!authorised) {
      this.loggers.security.warn({user: user}, `Unauthorised attempt to add a task (Project ID: ${projectId})`);
      result.delay().status(httpStatuses.FORBIDDEN);
      return;
    }

    if (typeof data != 'object') {
      result.delay().status(httpStatuses.BAD_REQUEST);
      return;
    }

    data = {
      summary: data.summary,
      description: data.description || '',
      targetCompletion: data.targetCompletion,
      priority: data.priority,
      estimatedEffort: data.estimatedEffort,
      assignedUserId: data.assignedUserId
    };

    var invalidItem = Task.schema.invalid(data);

    if (invalidItem) {
      result.delay().status(httpStatuses.BAD_REQUEST).data({
        msg: `Missing or invalid key: ${invalidItem}`
      });
      return;
    }

    // Convert to Date
    data.targetCompletion = moment(data.targetCompletion, 'DD/MM/YYYY').toDate();
    data.projectId = projectId;

    var project = await this.projects.getProject(projectId);

    if (project == null) {
      this.loggers.main.warn({user: user}, `Add Task - Project Not Found (Project ID: ${projectId})`);
      result.delay().status(httpStatuses.NOT_FOUND);
      return;
    }

    if (data.assignedUserId != null) {
      var member = await project.getMember(data.assignedUserId);

      if (member) await member.role.getPermissions();

      console.log(member && member.role.permissions);
      if (member == null || !member.role.hasPermission(permissions.ASSIGNEE)) {
        this.loggers.main.debug({user: user}, `Add Task - Assignee not a member or doesn't have the ASSIGNEE permission (Project: ${projectId}, Assignee ID: ${data.assignedUserId})`);
        result.delay().status(httpStatuses.BAD_REQUEST).data({
          msg: 'Assigned user is not a member of the project'
        });
        return;
      }
    }

    var taskId = await project.addTask(data);

    result.status(httpStatuses.CREATED).data({id: taskId});
  }

  async getTaskDetails(result, user, projectId, taskId) {

  }


}

export default new TasksController(loggers, authorisor, projects);
