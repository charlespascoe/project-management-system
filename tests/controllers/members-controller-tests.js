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

const tests = new TestFrame('MembersController');
tests.createInstance = function () {
  var nonMember = {
    serialise: () => ({id: 1, firstName: 'Bob', otherNames: 'Smith'})
  };

  var member = {
    serialise: () => ({user: {id: 1}, project: {id: 'EXAMPLE'}, role: {id: 1}})
  };

  var project = {
    getMembers: async () => [member],
    getNonMembers: async () => [nonMember],
    addMember: async () => null
  };

  var projects = {
    dummyProject: project,
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

tests.testMethod('addMember', function (t) {
  t.test('It should return 400 for invalid data object', async function (st, membersController) {
    var user = createDummyUser(),
        result = new Result();

    await membersController.addMember(result, user, 'EXAMPLE', null);

    st.equals(result.changes.status, 400);
    st.ok(result.changes.delay > 0);
  });

  t.test('It should return 400 for an invalid role ID', async function (st, membersController) {
    var user = createDummyUser(),
        result = new Result();

    await membersController.addMember(result, user, 'EXAMPLE', {
      roleId: 'Clearly invalid role ID',
      userId: 1
    });

    st.equals(result.changes.status, 400);
    st.ok(result.changes.delay > 0);
  });

  t.test('It should return 400 for an invalid user ID', async function (st, membersController) {
    var user = createDummyUser(),
        result = new Result();

    await membersController.addMember(result, user, 'EXAMPLE', {
      roleId: 1,
      userId: 'Clearly invalid user ID'
    });

    st.equals(result.changes.status, 400);
    st.ok(result.changes.delay > 0);
  });

  t.test('It should return 403 for an unauthorised user', async function (st, membersController) {
    membersController.authorisor.hasProjectPermission = async () => false;

    var user = createDummyUser(),
        result = new Result();

    await membersController.addMember(result, user, 'EXAMPLE', {
      roleId: 1,
      userId: 1
    });

    st.equals(result.changes.status, 403);
    st.ok(result.changes.delay > 0);
  });

  t.test('It should return 404 for a non-existent project ID', async function (st, membersController) {
    membersController.projects.getProject = async () => null;

    var user = createDummyUser(),
        result = new Result();

    await membersController.addMember(result, user, 'EXAMPLE', {
      roleId: 1,
      userId: 1
    });

    st.equals(result.changes.status, 404);
    st.ok(result.changes.delay > 0);
  });

  t.test('It should return 409 if the user is already a member', async function (st, membersController) {
    membersController.projects.dummyProject.addMember = async (userId, roleId) => {
      st.equals(userId, 1);
      st.equals(roleId, 2);
      return 'DUPLICATE';
    };

    var user = createDummyUser(),
        result = new Result();

    await membersController.addMember(result, user, 'EXAMPLE', {
      roleId: 2,
      userId: 1
    });

    st.equals(result.changes.status, 409);
    st.ok(result.changes.delay > 0);
  });

  t.test('It should return 404 if the user or role doesn\'t exist', async function (st, membersController) {
    membersController.projects.dummyProject.addMember = async (userId, roleId) => {
      st.equals(userId, 1);
      st.equals(roleId, 2);
      return 'NOT_FOUND';
    };

    var user = createDummyUser(),
        result = new Result();

    await membersController.addMember(result, user, 'EXAMPLE', {
      roleId: 2,
      userId: 1
    });

    st.equals(result.changes.status, 404);
    st.ok(result.changes.delay > 0);
  });

  t.test('It should return 204 when the user is successfully added', async function (st, membersController) {
    var user = createDummyUser(),
        result = new Result();

    await membersController.addMember(result, user, 'EXAMPLE', {
      roleId: 2,
      userId: 1
    });

    st.equals(result.changes.status, 204);
    st.equals(result.changes.delay, 0);
  });
});
