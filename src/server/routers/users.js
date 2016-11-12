import { Router } from 'express';
import loggers from 'server/loggers';
import catchAsync from 'server/catch-async';
import User from 'server/models/user';
import httpStatuses from 'http-status-codes';
import usersController from 'server/controllers/users-controller';

const catchHandler = catchAsync(function (err, req, res) {
  loggers.main.error({err: err});
  res.result.delay().status(httpStatuses.INTERNAL_SERVER_ERROR).end();
});

var router = new Router();

loggers.main.info('TEST');

router.use((req, res, next) => {
  loggers.main.warn('request!');
  next();
});

router.route('/')
  .get(catchHandler(async function (req, res) {
    loggers.main.debug('get /users/');
    // Get users
  }))
  .post(catchHandler(async function (req, res) {
    loggers.main.debug('post /users/');
    // Add user
  }));

router.param('userIdOrEmail', function (req, res, next) {
  loggers.main.warn('userIdOrEmail: ' + req.params.userIdOrEmail);
  if (User.schema.id.validate(req.params.userIdOrEmail)) {
    req.params.userIdOrEmail = parseInt(req.params.userIdOrEmail);
    next();
    return;
  } else if (User.schema.email.validate(req.params.userIdOrEmail)) {
    next();
    return;
  }

  loggers.main.warn({user: req.user}, 'Invalid userIdOrEmail');
  res.result.delay().status(httpStatuses.BAD_REQUEST).end();
});

router.get('/:userIdOrEmail', catchHandler(async function (req, res) {
  loggers.main.debug('get /users/' + req.params.userIdOrEmail);
  await usersController.getUser(res.result, req.user, req.params.userIdOrEmail);
  await res.result.end();
}));

export default router;
