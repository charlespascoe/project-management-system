import { Router } from 'express';
import catchAsync from 'server/catch-async';
import httpStatuses from 'http-status-codes';
import loggers from 'server/loggers';
import membersController from 'server/controllers/members-controller';
import User from 'server/models/user';

const catchHandler = catchAsync(function (err, req, res) {
  loggers.main.error({err: err});
  res.result.delay().status(httpStatuses.INTERNAL_SERVER_ERROR).end();
});

var router = new Router();

router.route('/')
  .get(catchHandler(async function (req, res) {
    await membersController.getMembers(res.result, req.user, req.projectId);
    await res.result.end();
  }))
  .post(catchHandler(async function (req, res) {
    await membersController.addMember(res.result, req.user, req.projectId, req.body);
    await res.result.end();
  }));

router.param('userId', function (req, res, next) {
  if (!User.schema.id.validate(req.params.userId)) {
    res.result.delay().status(httpStatuses.BAD_REQUEST).end();
    loggers.main.debug({user: req.user}, `Invalid User ID: ${req.params.userId}`);
    return;
  }

  req.userId = parseInt(req.params.userId);

  next();
});

router.route('/:userId')
  .put(catchHandler(async function (req, res) {
    await membersController.updateMember(res.result, req.user, req.projectId, req.userId, req.body);
    await res.result.end();
  }))
  .delete(catchHandler(async function (req, res) {
    await membersController.removeMember(res.result, req.user, req.projectId, req.userId);
    await res.result.end();
  }));


export default router;
