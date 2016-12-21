import catchAsync from 'server/catch-async';
import TestFrame from 'tests/test-frame';
import Result from 'server/controllers/result';
import { MembersController } from 'server/controllers/members-controller';
import dummyLoggers from 'tests/dummy-loggers';
import permissions from 'server/security/permissions';

const catchHandler = catchAsync(function (err, st) {
  st.fail('Unexpected exception: ' + err.toString());
  st.end();
});

function createDummyUser() {
  return {
    getRoleInProject: () => ({id: 1, name: 'Worker'}),
    isSysadminElevated: false
  };
}

const tests = new TestFrame('TasksController');
tests.createInstance = function () {
  var member = {
    serialise: () => ({user: {id: 1}, project: {id: 'EXAMPLE'}, role: {id: 1}})
  };

  var project = {
    getMembers: async () => [member]
  };

  var projects = {
    getProject: async () => project
  };

  var users = {
  };

  var roles = {
  };

  var authorisor = {
    hasGeneralPermission: () => true,
    hasProjectPermission: async () => true
  };

  return new MembersController(dummyLoggers, projects, users, roles, authorisor);
};

tests.testMethod('getMembers', function (t) {
  t.test('It should return 403 for non-members', catchHandler(async function (st, membersController) {
    var user = createDummyUser(),
        result = new Result();

    user.getRoleInProject = (projectId) => {
      st.equals(projectId, 'EXAMPLE');
      return null;
    };

    await membersController.getMembers(result, user, 'EXAMPLE');

    st.equals(result.changes.status, 403);
    st.ok(result.changes.delay > 0);
    st.end();
  }));

  t.test('It should return 404 for non-existent projects', catchHandler(async function (st, membersController) {
    var user = createDummyUser(),
        result = new Result();

    user.isSysadminElevated = true;

    membersController.projects.getProject = async () => null;

    await membersController.getMembers(result, user, 'EXAMPLE');

    st.equals(result.changes.status, 404);
    st.ok(result.changes.delay > 0);
    st.end();
  }));

  t.test('It should return 200 with the project members', catchHandler(async function (st, membersController) {
    var user = createDummyUser(),
        result = new Result();

    await membersController.getMembers(result, user, 'EXAMPLE');

    st.equals(result.changes.status, 200);
    st.end();
  }));
});
