import TestFrame from 'tests/test-frame';
import Result from 'server/controllers/result';
import { UsersController } from 'server/controllers/users-controller';
import dummyLoggers from 'tests/dummy-loggers';
import generalPermissions from 'server/security/general-permissions';

const tests = new TestFrame('UsersController');
tests.createInstance = function () {
  var authorisor = {
    hasGeneralPermission: () => true
  };

  var users = {
    addUser: async () => 1,
    getUserById: async () => null
  };

  return new UsersController(dummyLoggers, authorisor, users);
};

function createDummyUser() {
  return {
    id: 1,
    email: 'bob.smith@mail.com'
  };
}

tests.testMethod('addUser', function (t) {
  t.test('It should return 403 for an unauthorised user', async function (st, usersController) {
    var result = new Result();

    usersController.authorisor.hasGeneralPermission = () => false;

    await usersController.addUser(result, {}, {});

    st.equals(result.changes.status, 403);
    st.ok(result.changes.delay > 0, 'There should be a delay');
  });

  t.test('It should return 400 for an invalid data object', async function (st, usersController) {
    var result = new Result();

    await usersController.addUser(result, {}, null);

    st.equals(result.changes.status, 400);
    st.ok(result.changes.delay > 0, 'There should be a delay');
  });

  t.test('It should return 400 for an invalid value in the data object', async function (st, usersController) {
    var result = new Result();

    await usersController.addUser(result, {}, {
      email: 'A clearly invalid email',
      firstName: 'Bob',
      otherNames: 'Smith'
    });

    st.equals(result.changes.status, 400);
    st.ok(result.changes.delay > 0, 'There should be a delay');
  });

  t.test('It should return 409 for an existing email address', async function (st, usersController) {
    var result = new Result();

    usersController.users.addUser = async () => null;

    await usersController.addUser(result, {}, {
      email: 'bob.smith@mail.com',
      firstName: 'Bob',
      otherNames: 'Smith'
    });

    st.equals(result.changes.status, 409);
    st.equals(result.changes.delay, 0, 'There should be no delay');
  });

  t.test('It should return 201 after successfully creating the user', async function (st, usersController) {
    var result = new Result(),
        saveCalled = false;

    usersController.users.getUserById = async () => ({
      save: async () => saveCalled = true
    });

    await usersController.addUser(result, {}, {
      email: 'bob.smith@mail.com',
      firstName: 'Bob',
      otherNames: 'Smith'
    });

    st.ok(saveCalled);
    st.equals(result.changes.status, 201);
    st.equals(result.changes.delay, 0, 'There should be no delay');
    st.deepEquals(result.changes.data, {
      id: 1
    });
  });
});

tests.testMethod('deleteUser', function (t) {
  t.test('It should prevent the user from deleting themselves', async function (st, usersController) {
    var result = new Result();

    await usersController.deleteUser(result, createDummyUser(), 1);

    st.equals(result.changes.status, 403);
    st.ok(result.changes.delay > 0, 'There should be a delay');
  });

  t.test('It should return 403 if the user is not authorised to delete other users', async function (st, usersController) {
    var result = new Result();

    usersController.authorisor.hasGeneralPermission = (user, permission) => {
      st.equals(permission, generalPermissions.DELETE_USER);
      return false;
    };

    await usersController.deleteUser(result, createDummyUser(), 2);

    st.equals(result.changes.status, 403);
    st.ok(result.changes.delay > 0, 'There should be a delay');
  });

  t.test('It should return 404 if the user cannot be found', async function (st, usersController) {
    var result = new Result();

    usersController.users.getUserById = async () => null;

    await usersController.deleteUser(result, createDummyUser(), 2);

    st.equals(result.changes.status, 404);
    st.ok(result.changes.delay > 0, 'There should be a delay');
  });

  t.test('It should call delete on the user object and return 204', async function (st, usersController) {
    var result = new Result(),
        deleteCalled = false;

    usersController.users.getUserById = async () => ({
      delete: async () => deleteCalled = true
    });

    await usersController.deleteUser(result, createDummyUser(), 2);

    st.equals(result.changes.status, 204);
    st.equals(result.changes.delay, 0, 'There should be no delay');
  });
});

tests.testMethod('getUsers', function (t) {
  t.test('It should return 403 if the user is not authorised', async function (st, usersController) {
    var result = new Result();

    usersController.authorisor.hasGeneralPermission = (user, permission) => {
      st.equals(permission, generalPermissions.GET_OTHER_USER_DETAILS);
      return false;
    };

    await usersController.getUsers(result, createDummyUser(), false);

    st.equals(result.changes.status, 403);
    st.ok(result.changes.delay > 0, 'There should be a delay');
  });

  t.test('It should return 200 and the users when successful', async function (st, usersController) {
    var result = new Result();

    usersController.users.getAllUsers = async (includeInactive) => {
      st.ok(includeInactive, 'includeInactive should be true');
      return [
        {
          serialise: () => ({
            id: 1,
            firstName: 'Bob',
            otherNames: 'Smith'
          })
        }
      ];
    };

    await usersController.getUsers(result, createDummyUser(), true);

    st.equals(result.changes.status, 200);
    st.equals(result.changes.delay, 0, 'There should be no delay');
    st.deepEquals(result.changes.data, [{
      id: 1,
      firstName: 'Bob',
      otherNames: 'Smith'
    }]);
  });
});

tests.testMethod('getUser', function (t) {
  t.test('It should return the current user\'s data when getting the current user', async function (st, usersController) {
    var result = new Result(),
        user = createDummyUser(),
        serialiseCalled = false;

    user.serialise = () => {
      serialiseCalled = true;
      return {
        id: 1,
        firstName: 'Bob',
        otherNames: 'Smith'
      };
    };

    usersController.users.getUserById = async () => {
      st.fail('Users.getUserById() should not have been called');
    };

    await usersController.getUser(result, user, 1);
    st.equals(result.changes.status, 200);
    st.equals(result.changes.delay, 0, 'There should be no delay');
    st.deepEquals(result.changes.data, {
      id: 1,
      firstName: 'Bob',
      otherNames: 'Smith'
    });
  });

  t.test('It should return 403 when attempting to get another user without the correct permission', async function (st, usersController) {
    var result = new Result();

    usersController.authorisor.hasGeneralPermission = (user, permission) => {
      st.equals(permission, generalPermissions.GET_OTHER_USER_DETAILS);
      return false;
    };

    await usersController.getUser(result, createDummyUser(), 2);

    st.equals(result.changes.status, 403);
    st.ok(result.changes.delay > 0, 'There should be a delay');
  });

  t.test('It should return 404 for a non-existent user', async function (st, usersController) {
    var result = new Result();

    usersController.users.getUserById = async () => null;

    await usersController.getUser(result, createDummyUser(), 2);

    st.equals(result.changes.status, 404);
    st.ok(result.changes.delay > 0, 'There should be a delay');
  });

  t.test('It should return 200 and the data when successful', async function (st, usersController) {
    var result = new Result();

    usersController.users.getUserById = async () => ({
      serialise: () => ({
        id: 2,
        firstName: 'Jane',
        otherNames: 'Dough'
      })
    });

    await usersController.getUser(result, createDummyUser(), 2);

    st.equals(result.changes.status, 200);
    st.equals(result.changes.delay, 0, 'There should be no delay');
    st.deepEquals(result.changes.data, {
      id: 2,
      firstName: 'Jane',
      otherNames: 'Dough'
    });
  });
});

tests.testMethod('getUserAssignments', function (t) {
  t.test('It should return 403 when trying to get another user\'s assignments without the correct permission', async function (st, usersController) {
    var result = new Result();

    usersController.authorisor.hasGeneralPermission = (user, permission) => {
      st.equals(permission, generalPermissions.GET_OTHER_USER_DETAILS);
      return false;
    };

    await usersController.getUserAssignments(result, createDummyUser(), 2);

    st.equals(result.changes.status, 403);
    st.ok(result.changes.delay > 0, 'There should be a delay');
  });

  t.test('It should return 404 for a non-existent user', async function (st, usersController) {
    var result = new Result();

    usersController.users.getUserById = async () => null;

    await usersController.getUserAssignments(result, createDummyUser(), 2);

    st.equals(result.changes.status, 404);
    st.ok(result.changes.delay > 0, 'There should be a delay');
  });

  t.test('It should return 200 and the user\'s assignments when successful', async function (st, usersController) {
    var result = new Result();

    usersController.users.getUserById = async () => ({
      getProjectAssignments: async () => ([
        {
          serialise: () => ({project:{id:'EXAMPLE'},role:{id:1}})
        }
      ])
    });

    await usersController.getUserAssignments(result, createDummyUser(), 2);

    st.equals(result.changes.status, 200);
    st.equals(result.changes.delay, 0, 'There should be no delay');
    st.deepEquals(result.changes.data, [{
      project: {
        id: 'EXAMPLE'
      },
      role: {
        id: 1
      }
    }]);
  });
});
