import catchAsync from 'server/catch-async';
import TestFrame from 'tests/test-frame';
import Result from 'server/controllers/result';
import { AuthenticationController } from 'server/controllers/authentication-controller';
import { validation } from 'server/validation';
import dummyLoggers from 'tests/dummy-loggers';

const catchHandler = catchAsync(function (err, st) {
  st.fail('Unexpected exception: ' + err.toString());
  st.end();
});

const tests = new TestFrame('AuthenticationController');
tests.createInstance = function () {
  var authenticator = {
    loginResult: null,
    login: async () => authenticator.loginResult,
    getUserForAccessToken: async () => null
  };

  return new AuthenticationController(authenticator, dummyLoggers);
};

tests.testMethod('login', function (t) {
  t.test('It should return 400 for undefined username', catchHandler(async function (st, authController) {
    authController.authenticator.login = async () => st.fail('Authenticator.login should not have been called');

    var result = await authController.login(new Result(), undefined, 'pass1234');
    st.equals(result.changes.status, 400);
    st.ok(result.changes.delay > 0);
    st.end();
  }));

  t.test('It should return 400 for invalid username', catchHandler(async function (st, authController) {
    authController.authenticator.login = async () => st.fail('Authenticator.login should not have been called');

    var result = await authController.login(new Result(), 'a'.repeat(2048), 'pass1234');
    st.equals(result.changes.status, 400);
    st.ok(result.changes.delay > 0);
    st.end();
  }));

  t.test('It should return 400 for undefined password', catchHandler(async function (st, authController) {
    authController.authenticator.login = async () => st.fail('Authenticator.login should not have been called');

    var result = await authController.login(new Result(), 'bob', undefined);
    st.equals(result.changes.status, 400);
    st.ok(result.changes.delay > 0);
    st.end();
  }));

  t.test('It should return 400 for invalid username', catchHandler(async function (st, authController) {
    authController.authenticator.login = async () => st.fail('Authenticator.login should not have been called');

    var result = await authController.login(new Result(), 'bob', 'a'.repeat(2048));
    st.equals(result.changes.status, 400);
    st.ok(result.changes.delay > 0);
    st.end();
  }));

  t.test('It should return 401 for invalid user login', catchHandler(async function (st, authController) {
    var result = await authController.login(new Result(), 'bob', 'pass1234');
    st.equals(result.changes.status, 401);
    st.ok(result.changes.delay > 0);
    st.end();
  }));

  t.test('It should return 200 and the tokens for correct login', catchHandler(async function (st, authController) {
    authController.authenticator.loginResult = {
      accessToken: 'accessToken',
      refreshToken: 'refreshToken'
    };

    var result = await authController.login(new Result(), 'bob', 'pass1234');
    st.equals(result.changes.status, 200);
    st.deepEquals(result.changes.data, {
      accessToken: 'accessToken',
      refreshToken: 'refreshToken'
    });
    st.end();
  }));
});

tests.testMethod('verifyAccessToken', function (t) {
  t.test('It should return 401 for invalid token', catchHandler(async function (st, authController) {
    var result = await authController.verifyAccessToken(new Result(), '127.0.0.1', '**&^7643hjgsdf');
    st.equals(result.changes.status, 401);
    st.ok(result.changes.delay > 0);
    st.end();
  }));
});
