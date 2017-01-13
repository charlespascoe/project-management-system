import TestFrame from 'tests/test-frame';
import Result from 'server/controllers/result';
import { TasksController } from 'server/controllers/tasks-controller';
import dummyLoggers from 'tests/dummy-loggers';
import permissions from 'server/security/permissions';

function createDummyUser() {
  return {
    getRoleInProject: () => ({id: 1, name: 'Worker'}),
    isSysadminElevated: false
  };
}

const tests = new TestFrame('TasksController');
tests.createInstance = function () {
  var task = {
    serialise: () => ({id: 1, summary: 'Task'})
  };

  var project = {
    getTasks: async () => [task],
    addTask: async () => 1
  };

  var projects = {
    getProject: async () => project
  };

  var authorisor = {
    hasGeneralPermission: () => true,
    hasProjectPermission: async () => true
  };

  return new TasksController(dummyLoggers, authorisor, projects);
};

tests.testMethod('getTasks', function (t) {
  t.test('It should return 403 if the user is not authorised', async function (st, tasksController) {
    var user = createDummyUser(),
        result = new Result();

    user.getRoleInProject = () => null;

    await tasksController.getTasks(result, user, 'EXAMPLE');

    st.equals(result.changes.status, 403);
    st.ok(result.changes.delay > 0);
  });

  t.test('It should return 404 for non-existent project', async function (st, tasksController) {
    var user = createDummyUser(),
        result = new Result();

    user.getRoleInProject = () => null;
    user.isSysadminElevated = true;
    tasksController.projects.getProject = async () => null;

    await tasksController.getTasks(result, user, 'EXAMPLE');

    st.equals(result.changes.status, 404);
    st.ok(result.changes.delay > 0);
  });

  t.test('It should return the list of tasks for an authorised user', async function (st, tasksController) {
    var user = createDummyUser(),
        result = new Result();

    await tasksController.getTasks(result, user, 'EXAMPLE');
    st.equals(result.changes.status, 200);
  });
});

tests.testMethod('addTask', function (t) {
  t.test('It should return 403 for unauthorised users', async function (st, tasksController) {
    var user = createDummyUser(),
        result = new Result();

    tasksController.authorisor.hasProjectPermission = async (user, projectId, permission) => {
      st.equals(projectId, 'EXAMPLE');
      st.deepEquals(permission, permissions.ADD_TASKS);
      return false;
    };

    await tasksController.addTask(result, user, 'EXAMPLE', {});

    st.equals(result.changes.status, 403);
    st.ok(result.changes.delay > 0);
  });

  t.test('It should return 400 for bad data', async function (st, tasksController) {
    var user = createDummyUser(),
        result = new Result();

    await tasksController.addTask(result, user, 'EXAMPLE', null);

    st.equals(result.changes.status, 400);
    st.ok(result.changes.delay > 0);
  });

  t.test('It should return 404 for a non-existent project', async function (st, tasksController) {
    var user = createDummyUser(),
        result = new Result();

    tasksController.projects.getProject = async () => null;

    await tasksController.addTask(result, user, 'EXAMPLE', {
      summary: 'Test',
      targetCompletion: '21/02/2020',
      priority: 1,
      estimatedEffort: 60,
      assignedUserId: null
    });

    st.equals(result.changes.status, 404);
    st.ok(result.changes.delay > 0);
  });

  t.test('It should return 201 when the task is created successfully', async function (st, tasksController) {
    var user = createDummyUser(),
        result = new Result();

    await tasksController.addTask(result, user, 'EXAMPLE', {
      summary: 'Test',
      targetCompletion: '21/02/2020',
      priority: 1,
      estimatedEffort: 60,
      assignedUserId: null
    });

    st.equals(result.changes.status, 201);
  });
});
