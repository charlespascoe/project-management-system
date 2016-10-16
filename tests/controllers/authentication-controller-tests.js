import catchAsync from 'server/catch-async';
import TestFrame from 'tests/test-frame';
import { AuthenticationController } from 'server/controllers/authentication-controller';
import { validation } from 'server/validation';
import dummyLoggers from 'tests/dummy-loggers';

const validate = validation().check;

const catchHandler = catchAsync(function (err, st) {
  st.fail('Unexpected exception: ' + err.toString());
  st.end();
});

const tests = new TestFrame('AuthenticationController');
tests.createInstance = function () {
  var authenticator = {
    loginResult: null,
    login: async () => authenticator.loginResult
  };

  return new AuthenticationController(authenticator, dummyLoggers);
};

tests.testMethod('login', function (t) {
  t.test('It should return 401 for invalid user login', catchHandler(async function (st, authController) {
    var result = await authController.login('bob', 'pass1234');
    st.equals(result.changes.status, 401);
    st.ok(result.changes.delay > 0);
    st.end();
  }));
});
