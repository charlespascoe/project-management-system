import TestFrame from 'tests/test-frame';
import Result from 'server/controllers/result';
import { AuthenticationController } from 'server/controllers/authentication-controller';
import { validation } from 'server/validation';
import dummyLoggers from 'tests/dummy-loggers';

const tests = new TestFrame('AuthenticationController');
tests.createInstance = function () {
  var authenticator = {
    loginResult: null,
    login: async () => authenticator.loginResult,
    getUserForToken: async () => null
  };

  return new AuthenticationController(authenticator, dummyLoggers);
};

tests.testMethod('login', function (t) {
  t.test('It should return 400 for undefined username', async function (st, authController) {
    authController.authenticator.login = async () => st.fail('Authenticator.login should not have been called');

    var result = await authController.login(new Result, '127.0.0.1', undefined, 'pass1234');
    st.equals(result.changes.status, 400);
    st.ok(result.changes.delay > 0);
  });

  t.test('It should return 400 for invalid username', async function (st, authController) {
    authController.authenticator.login = async () => st.fail('Authenticator.login should not have been called');

    var result = await authController.login(new Result, '127.0.0.1', 'a'.repeat(2048), 'pass1234');
    st.equals(result.changes.status, 400);
    st.ok(result.changes.delay > 0);
  });

  t.test('It should return 400 for undefined password', async function (st, authController) {
    authController.authenticator.login = async () => st.fail('Authenticator.login should not have been called');

    var result = await authController.login(new Result, '127.0.0.1', 'bob@mail.com', undefined);
    st.equals(result.changes.status, 400);
    st.ok(result.changes.delay > 0);
  });

  t.test('It should return 400 for invalid password', async function (st, authController) {
    authController.authenticator.login = async () => st.fail('Authenticator.login should not have been called');

    var result = await authController.login(new Result, '127.0.0.1', 'bob@mail.com', 'a'.repeat(2048));
    st.equals(result.changes.status, 400);
    st.ok(result.changes.delay > 0);
  });

  t.test('It should return 401 for invalid user login', async function (st, authController) {
    var result = await authController.login(new Result, '127.0.0.1', 'bob@mail.com', 'pass1234');
    st.equals(result.changes.status, 401);
    st.ok(result.changes.delay > 0);
  });

  t.test('It should return 200 and the tokens for correct login', async function (st, authController) {
    authController.authenticator.loginResult = {
      serialise: () => {
        return {
          accessToken: 'accessToken',
          refreshToken: 'refreshToken'
        }
      }
    };

    var result = await authController.login(new Result, '127.0.0.1', 'bob@mail.com', 'pass1234');
    st.equals(result.changes.status, 200);
    st.deepEquals(result.changes.data, {
      accessToken: 'accessToken',
      refreshToken: 'refreshToken'
    });
  });
});

tests.testMethod('refreshTokenPair', function (t) {
  t.test('It should return 401 for non-existant user', async function (st, authController) {
    authController.authenticator.getUserForToken = async (encodedToken, tokenType) => {
      st.equals(tokenType, 'refresh');
      return null;
    };

    var result = await authController.refreshTokenPair(new Result(), '127.0.0.1', '<encoded token>');
    st.equals(result.changes.status, 401);
    st.ok(result.changes.delay > 0);
  });

  t.test('It should return 401 for an expired refresh token', async function (st, authController) {
    var user = {
      requestToken: {
        refreshTokenExpires: new Date(Date.now() - 10000)
      }
    };

    authController.authenticator.getUserForToken = async (encodedToken, tokenType) => {
      st.equals(tokenType, 'refresh');
      return user;
    };

    var result = await authController.refreshTokenPair(new Result(), '127.0.0.1', '<encoded token>');
    st.equals(result.changes.status, 401);
    st.ok(result.changes.delay > 0);
  });

  t.test('It should return 200 and a new token pair for a valid refresh token', async function (st, authController) {
    var user = {
      requestToken: {
        refreshTokenExpires: new Date(Date.now() + 10000)
      }
    };

    authController.authenticator.getUserForToken = async (encodedToken, tokenType) => {
      st.equals(tokenType, 'refresh');
      return user;
    };

    authController.authenticator.refreshTokenPair = async (usr, token) => {
      st.equals(usr, user);
      st.equals(token, user.requestToken);
      return {
        serialise: () => {
          return {id: 123};
        }
      }
    };

    var result = await authController.refreshTokenPair(new Result(), '127.0.0.1', '<encoded token>');
    st.equals(result.changes.status, 200);
    st.equals(result.changes.delay, 0);
    st.equals(result.changes.data.id, 123);
  });
});

tests.testMethod('verifyAccessToken', function (t) {
  t.test('It should return 401 for invalid access token', async function (st, authController) {
    authController.authenticator.getUserForToken = async (encodedToken, tokenType) => {
      st.equals(tokenType, 'access');
      return null;
    };

    var result = new Result();
    var user = await authController.verifyAccessToken(result, '127.0.0.1', '**&^7643hjgsdf');
    st.equals(user, null);
    st.equals(result.changes.status, 401);
    st.ok(result.changes.delay > 0);
  });

  t.test('It should return 401, without delay, for an expired access token', async function (st, authController) {
    var user = {
      requestToken: {
        accessTokenExpires: new Date(Date.now() - 10000)
      }
    };

    authController.authenticator.getUserForToken = async (encodedToken, tokenType) => {
      st.equals(tokenType, 'access');
      return user;
    };

    var result = new Result();
    var userResult = await authController.verifyAccessToken(result, '127.0.0.1', '<encoded token>');
    st.equals(userResult, null);
    st.equals(result.changes.status, 401);
    st.equals(result.changes.delay, 0);
  });
});
