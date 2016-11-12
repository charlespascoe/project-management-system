import { Router } from 'express';
import catchAsync from 'server/catch-async';
import httpStatuses from 'http-status-codes';
import loggers from 'server/loggers';
import usersController from 'server/controllers/users-controller';
import User from 'server/models/user';

const catchHandler = catchAsync(function (err, req, res) {
  loggers.main.error({err: err});
  res.result.delay().status(httpStatuses.INTERNAL_SERVER_ERROR).end();
});

var router = new Router();

router.route('/')
  .get(catchHandler(async function (req, res) {
    await usersController.getUsers(res.result, req.user);
    await res.result.end();
  }))
  .post(catchHandler(async function (req, res) {
    await usersController.addUser(res.result, req.user, req.body);
    await res.result.end();
  }));

router.param('userIdOrEmail', function (req, res, next) {
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
  await usersController.getUser(res.result, req.user, req.params.userIdOrEmail);
  await res.result.end();
}));

export default router;
