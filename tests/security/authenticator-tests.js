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
    id: 123,
    email: 'bob@gmail.com',
    passHash: '<hash>'
  };

  var users = {
    getUserByEmailResult: dummyUser,
    getUserByEmail: async () => users.getUserByEmailResult
  };

  var authTokens = {
    addToken: async () => 123
  };

  var passHasher = {
    verifyUserPasswordResult: true,
    verifyUserPassword: async () => passHasher.verifyUserPasswordResult
  };

  return new Authenticator(passHasher, users, authTokens);
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

  t.test('It should return the auth token for the correct password', catchHandler(async function (st, authenticator) {
    var result = await authenticator.login('bob@gmail.com', 'password');
    st.ok(Buffer.isBuffer(result.accessToken));
    st.ok(Buffer.isBuffer(result.refreshToken));
    st.end();
  }));
});

tests.testMethod('generateAuthenticationTokenPair', function (t) {
  t.test('It should return the access and refresh tokens as expected', catchHandler(async function (st, authenticator) {
    var user = {
      id: 123
    };

    var accessExpires = new Date(Date.now() + 1234),
        refreshExpires = new Date(Date.now() + 5678);

    authenticator.authTokens.addToken = async function (data) {
      st.equals(data.userId, user.id);
      st.ok(data.accessTokenHash.match(/([a-f0-9]{2})+/i));
      st.equals(data.accessTokenExpires, accessExpires);
      st.ok(data.refreshTokenHash.match(/([a-f0-9]{2})+/i));
      st.equals(data.refreshTokenExpires, refreshExpires);
    };

    var authToken = await authenticator.generateAuthenticationTokenPair(user, accessExpires, refreshExpires);

    st.ok(Buffer.isBuffer(authToken.accessToken));
    st.ok(Buffer.isBuffer(authToken.refreshToken));

    st.end();
  }));
});
