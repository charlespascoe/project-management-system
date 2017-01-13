import TestFrame from 'tests/test-frame';
import Result from 'server/controllers/result';
import { RolesController } from 'server/controllers/roles-controller';
import dummyLoggers from 'tests/dummy-loggers';

const tests = new TestFrame('RolesController');
tests.createInstance = function () {
  var role = {
    serialise: () => ({
      id: 1,
      name: 'Test'
    })
  };

  var roles = {
    getRoles: async () => [role]
  };

  return new RolesController(dummyLoggers, roles);
};



tests.testMethod('getRoles', function (t) {
  t.test('It should return 200 and the roles', async function (st, rolesController) {
    var result = new Result();

    await rolesController.getRoles(result, {});

    st.equals(result.changes.status, 200);
    st.equals(result.changes.data.length, 1);
    st.deepEquals(result.changes.data[0], {id: 1, name: 'Test'});
  });
});
