import validate from 'server/validation';
import catchAsync from 'server/catch-async';
import loggers from 'server/loggers';
import authenticationController from 'server/controllers/authentication-controller';
import config from 'server/config';

const catchHandler = catchAsync(function (err, req, res) {
  loggers.security.error({err: err});
  res.result.delay().status(401).end();
});

export default catchHandler(async function authenticate(req, res, next) {
  var authHeader = (req.headers || {}).authorization;

  var unauthenticated = () => res.result.delay().status(401).end();

  if (!validate(authHeader).isString().matches(/^Bearer [^\s]+$/).isValid()) {
    return unauthenticated();
  }

  var accessToken = authHeader.split(' ')[1];

  var user = await authenticationController.verifyAccessToken(req.ip, accessToken);

  if (user == null) return unauthenticated();

  req.user = user;

  next();
});
