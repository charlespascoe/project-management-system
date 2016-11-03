import catchAsync from 'server/catch-async';
import CryptoUtils from 'server/crypto-utils';
import TestFrame from 'tests/test-frame';
import { Authenticator } from 'server/security/authenticator';
import validate from 'server/validation';

const catchHandler = catchAsync(function (err, st) {
  st.fail('Unexpected exception: ' + err.toString());
  st.end();
});

const tests = new TestFrame('Authenticator');
tests.createInstance = function () {
  var dummyUser = {
    id: 123,
    email: 'bob@gmail.com',
    passHash: '<hash>',
    authTokens: [
      {
        accessTokenHash: CryptoUtils.hash(Buffer.from('abcd', 'hex')).toString('hex')
      }
    ]
  };

  var users = {
    dummyUser: dummyUser,
    getUserByEmailResult: dummyUser,
    getUserByEmail: async () => users.getUserByEmailResult,
    getUserById: async (id) => id == dummyUser.id ? dummyUser : null
  };

  var authTokens = {
    addTokenPairResult: {
      accessToken: Buffer.from('abcd', 'hex'),
      refreshToken: Buffer.from('ef01', 'hex'),
      serialise: () => {
        return {
          id: 123,
          accessToken: this.accessToken.toString('base64'),
          refreshToken: this.refreshToken.toString('base64')
        };
      }
    },
    addTokenPair: async () => authTokens.addTokenPairResult
  };

  var passHasher = {
    verifyUserPasswordResult: true,
    verifyUserPassword: async () => passHasher.verifyUserPasswordResult
  };

  return new Authenticator(passHasher, users, authTokens, validate);
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
    st.ok(Buffer.isBuffer(result.accessToken), 'accessToken should be a Buffer');
    st.ok(Buffer.isBuffer(result.refreshToken), 'refreshToken should be a Buffer');
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

    var authTokenPair = await authenticator.generateAuthenticationTokenPair(user, accessExpires, refreshExpires);

    st.ok(Buffer.isBuffer(authTokenPair.accessToken), 'accessToken should be a Buffer');
    st.ok(Buffer.isBuffer(authTokenPair.refreshToken), 'refreshToken should be a Buffer');

    st.end();
  }));
});

tests.testSet('Authenticator.getUserForToken', [
  {
    name: 'It should return null on non-base64 input',
    args: ['**&*&*&@@~///'],
    expected: false
  },
  {
    name: 'It should return null for non-existant user',
    args: [Buffer.from('9:abcd').toString('base64')],
    expected: false
  },
  {
    name: 'It should return null for non-existant access token',
    args: [Buffer.from('123:0000').toString('base64')],
    expected: false
  },
  {
    name: 'It should return the user for the correct token',
    args: [Buffer.from('123:abcd').toString('base64')],
    expected: true
  }
], catchHandler(async function (st, args, expected, authenticator) {
  var result = await authenticator.getUserForToken(...args, 'access');

  if (expected) {
    st.deepEquals(result, authenticator.users.dummyUser);
  } else {
    st.equals(result, null);
  }

  st.end();
}));



