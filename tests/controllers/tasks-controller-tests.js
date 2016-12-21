import catchAsync from 'server/catch-async';
import TestFrame from 'tests/test-frame';
import Result from 'server/controllers/result';
import { TasksController } from 'server/controllers/tasks-controller';
import dummyLoggers from 'tests/dummy-loggers';

const catchHandler = catchAsync(function (err, st) {
  st.fail('Unexpected exception: ' + err.toString());
  st.end();
});

function createDummyUser() {
  return {
    getRoleInProject: () => ({id: 1, name: 'Worker'})
  };
}

const tests = new TestFrame('TasksController');
tests.createInstance = function () {
  var task = {
    serialise: () => ({id: 1, summary: 'Task'})
  };

  var project = {
    getTasks: async () => [task]
  };

  var projects = {
    getProject: async () => project
  };

  var authorisor = {
    hasGeneralPermission: () => true
  };

  return new TasksController(dummyLoggers, authorisor, projects);
};

tests.testMethod('getTasks', function (t) {
  t.test('It should return 403 if the user is not authorised', catchHandler(async function (st, tasksController) {
    var user = createDummyUser(),
        result = new Result();

    user.getRoleInProject = () => null;

    await tasksController.getTasks(result, user, 'EXAMPLE');

    st.equals(result.changes.status, 403);
    st.ok(result.changes.delay > 0);
    st.end();
  }));

  t.test('It should return 404 for non-existent project', catchHandler(async function (st, tasksController) {
    var user = createDummyUser(),
        result = new Result();

    user.getRoleInProject = () => null;
    user.isSysadminElevated = true;
    tasksController.projects.getProject = async () => null;

    await tasksController.getTasks(result, user, 'EXAMPLE');

    st.equals(result.changes.status, 404);
    st.ok(result.changes.delay > 0);
    st.end();
  }));

  t.test('It should return the list of tasks for an authorised user', catchHandler(async function (st, tasksController) {
    var user = createDummyUser(),
        result = new Result();

    await tasksController.getTasks(result, user, 'EXAMPLE');
    st.equals(result.changes.status, 200);
    st.end();
  }));
});

