import catchAsync from 'server/catch-async';
import TestFrame from 'tests/test-frame';
import { Authenticator } from 'server/security/authenticator';

const catchHandler = catchAsync(function (err, st) {
  st.fail('Unexpected exception: ' + err.toString());
  st.end();
});

const tests = new TestFrame('Authenticator');
tests.createInstance = function () {
  var dummyUser = {
    email: 'bob@gmail.com',
    passHash: '<hash>'
  };

  var users = {
    getUserByEmailResult: dummyUser,
    getUserByEmail: async () => this.getUserByEmailResult
  };

  var passHasher = {
    verifyUserPasswordResult: true,
    verifyUserPassword: async () => this.verifyUserPasswordResult
  };

  return new Authenticator(passHasher, users);
};


tests.testMethod('login', function (t) {
  t.test('It should return null for non-existent user', catchHandler(async function (st, authenticator) {
    authenticator.users.getUserByEmailResult = null;
    var result = await authenticator.login('bob@gmail.com', 'password');
    st.equals(result, null);
    st.end();
  }));

  t.test('It should return null for incorrect password', catchHandler(async function (st, authenticator) {
    authenticator.passHasher.verifyUserPasswordResult = false;
    var result = await authenticator.login('bob@gmail.com', 'password');
    st.equals(result, null);
    st.end();
  }));
});
