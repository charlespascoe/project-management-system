import { Users } from 'server/database/users';
import TestFrame from 'tests/test-frame';
import dummyDatabase from 'tests/dummy-database';

const users = new Users(dummyDatabase);

const tests = new TestFrame('Users');
tests.createInstance = () => users;

tests.before = async () => {
  dummyDatabase.init();
  await dummyDatabase.reset();
};

tests.after = async (st) => {
  await dummyDatabase.end();
  st.end();
};

tests.testMethod('getAllUsers', function (t) {
  t.test('It should get all users', async function (st, users) {
    var usrs = await users.getAllUsers();

    st.equals(usrs.length, 1);
    st.equals(usrs[0].id, 1);
    st.equals(usrs[0].firstName, 'Bob');
    st.equals(usrs[0].otherNames, 'Smith');
    st.equals(usrs[0].email, 'bob@mail.com');
  });
});

tests.testMethod('getUserByEmail', function (t) {
  t.test('It should return null for a non-existent user email', async function (st, users) {
    var user = await users.getUserByEmail('fake@mail.com');
    st.equals(user, null);
  });

  t.test('It should return the user for a real email', async function (st, users) {
    var user = await users.getUserByEmail('bob@mail.com');
    st.equals(user.id, 1);
    st.equals(user.firstName, 'Bob');
    st.equals(user.otherNames, 'Smith');
    st.equals(user.email, 'bob@mail.com');
  });
});

tests.testMethod('getUserById', function (t) {
  t.test('It should return null for a non-existent user ID', async function (st, users) {
    var user = await users.getUserById(1000);
    st.equals(user, null);
  });

  t.test('It should return the user for a real user ID', async function (st, users) {
    var user = await users.getUserById(1);
    st.equals(user.id, 1);
    st.equals(user.firstName, 'Bob');
    st.equals(user.otherNames, 'Smith');
    st.equals(user.email, 'bob@mail.com');
  });
});

tests.testMethod('addUser', function (t) {
  t.test('It should return null if the email already exists', async function (st, users) {
    var result = await users.addUser({
      email: 'bob@mail.com',
      firstName: 'Existing',
      otherNames: 'Email'
    });

    st.equals(result, null);
  });

  t.test('It should return the new user\'s ID when successful', async function (st, users) {
    var result = await users.addUser({
      email: 'jane@mail.com',
      firstName: 'Jane',
      otherNames: 'Dough'
    });

    st.equals(result, 2);
  });
});
