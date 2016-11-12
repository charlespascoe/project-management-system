import validate from 'server/validation';
import catchAsync from 'server/catch-async';
import loggers from 'server/loggers';
import authenticationController from 'server/controllers/authentication-controller';
import config from 'server/config';
import httpStatuses from 'http-status-codes';

const catchHandler = catchAsync(function (err, req, res) {
  loggers.security.error({err: err});
  res.result.delay().status(httpStatuses.INTERNAL_SERVER_ERROR).end();
});

export default catchHandler(async function authenticate(req, res, next) {
  var authHeader = (req.headers || {}).authorization;

  if (!validate(authHeader).isString().matches(/^Bearer [^\s]+$/).isValid()) {
    res.result.delay().status(httpStatuses.UNAUTHORIZED).end();
    return;
  }

  var accessToken = authHeader.split(' ')[1];

  var user = await authenticationController.verifyAccessToken(res.result, req.ip, accessToken);

  if (user == null) {
    await res.result.end();
    return;
  }

  req.user = user;

  next();
});
