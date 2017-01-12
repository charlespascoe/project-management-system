import User from 'server/models/user';
import ProjectAssignment from 'server/models/project-assignment';
import TestFrame from 'tests/test-frame';
import testingDatabase from 'tests/testing-database';

const tests = new TestFrame('User');
tests.createInstance = () => {
  return new User(testingDatabase, {
    user_id: 1,
    first_name: 'Bob',
    other_names: 'Smith',
    pass_hash: 'hash',
    sysadmin: 1 // MySQL 'TRUE'
  });
};

tests.before = async () => {
  testingDatabase.init();
  await testingDatabase.reset();
};

tests.after = async (st) => {
  await testingDatabase.end();
  st.end();
};

tests.testMethod('getProjectAssignments', function (t) {
  t.test('It should return an empty list if there are no assignments', async function (st, user) {
    await testingDatabase.query('DELETE FROM `project_assignment` WHERE `user_id` = :userId', {userId: user.id});

    var assignments = await user.getProjectAssignments();

    st.equals(assignments.length, 0);
  });

  t.test('It should return the list of assignments', async function (st, user) {
    var assignments = await user.getProjectAssignments();

    st.equals(assignments.length, 1);
    st.ok(assignments[0] instanceof ProjectAssignment, 'Assignments should be of the type ProjectAssignment');
    st.equals(assignments[0].projectId, 'EXAMPLE');
    st.equals(assignments[0].userId, 1);
    st.equals(assignments[0].roleId, 3);
  });
});
