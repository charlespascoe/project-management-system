import TestFrame from 'tests/test-frame';
import { Roles } from 'server/database/roles';
import testingDatabase from 'tests/testing-database';

const tests = new TestFrame('Roles', Roles);
tests.createInstance = () => new Roles(testingDatabase);

tests.before = async () => {
  testingDatabase.init();
  await testingDatabase.reset();
};

tests.after = async (st) => {
  await testingDatabase.end();
  st.end();
};

tests.testMethod('getRoles', function (t) {
  t.test('It should return the list of roles', async function (st, roles) {
    var roles = await roles.getRoles();

    st.equals(roles[0].id, 1);
    st.equals(roles[0].name, 'Observer');
    st.equals(roles[1].id, 2);
    st.equals(roles[1].name, 'Worker');
    st.equals(roles[2].id, 3);
    st.equals(roles[2].name, 'Project Administrator');
  });
});

tests.testMethod('getRoleById', function (t) {
  t.test('It should return null for a non-existent role', async function (st, roles) {
    var role = await roles.getRoleById(1000);
    st.equals(role, null);
  });

  t.test('It should return the role for a real ID', async function (st, roles) {
    var role = await roles.getRoleById(3);
    st.equals(role.id, 3);
    st.equals(role.name, 'Project Administrator');
  });
});
