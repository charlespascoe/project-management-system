import TestFrame from 'tests/test-frame';
import Result from 'server/controllers/result';
import { MembersController } from 'server/controllers/members-controller';
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
  var nonMember = {
    serialise: () => ({id: 1, firstName: 'Bob', otherNames: 'Smith'})
  };

  var member = {
    serialise: () => ({user: {id: 1}, project: {id: 'EXAMPLE'}, role: {id: 1}})
  };

  var project = {
    getMembers: async () => [member],
    getNonMembers: async () => [nonMember]
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
  t.test('It should return 403 for non-members', async function (st, membersController) {
    var user = createDummyUser(),
        result = new Result();

    user.getRoleInProject = (projectId) => {
      st.equals(projectId, 'EXAMPLE');
      return null;
    };

    await membersController.getMembers(result, user, 'EXAMPLE');

    st.equals(result.changes.status, 403);
    st.ok(result.changes.delay > 0);
  });

  t.test('It should return 404 for non-existent projects', async function (st, membersController) {
    var user = createDummyUser(),
        result = new Result();

    user.isSysadminElevated = true;

    membersController.projects.getProject = async () => null;

    await membersController.getMembers(result, user, 'EXAMPLE');

    st.equals(result.changes.status, 404);
    st.ok(result.changes.delay > 0);
  });

  t.test('It should return 200 with the project members', async function (st, membersController) {
    var user = createDummyUser(),
        result = new Result();

    await membersController.getMembers(result, user, 'EXAMPLE');

    st.equals(result.changes.status, 200);
  });
});

tests.testMethod('getNonMembers', function (t) {
  t.test('It should return 403 to project members without correct permission', async function (st, membersController) {
    var user = createDummyUser(),
        result = new Result();

    membersController.authorisor.hasProjectPermission = async (user, projectId, permission) => {
      st.deepEquals(permission, permissions.MANAGE_PROJECT_MEMBERS);
      return false;
    };

    await membersController.getNonMembers(result, user, 'EXAMPLE');

    st.equals(result.changes.status, 403);
    st.ok(result.changes.delay > 0);
  });

  t.test('It should return 404 for a non-existent project', async function (st, membersController) {
    var user = createDummyUser(),
        result = new Result();

    membersController.projects.getProject = async () => null;

    await membersController.getNonMembers(result, user, 'EXAMPLE');

    st.equals(result.changes.status, 404);
    st.ok(result.changes.delay > 0);
  });

  t.test('It should return 200 with the non-members', async function (st, membersController) {
    var user = createDummyUser(),
        result = new Result();

    await membersController.getNonMembers(result, user, 'EXAMPLE');

    st.equals(result.changes.status, 200);
  });
});
