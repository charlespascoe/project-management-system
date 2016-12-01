import { Router } from 'express';
import catchAsync from 'server/catch-async';
import httpStatuses from 'http-status-codes';
import loggers from 'server/loggers';
import rolesController from 'server/controllers/roles-controller';

const catchHandler = catchAsync(function (err, req, res) {
  loggers.main.error({err: err});
  res.result.delay().status(httpStatuses.INTERNAL_SERVER_ERROR).end();
});

var router = new Router();

router.get('/', catchHandler(async function (req, res) {
  await rolesController.getRoles(res.result, req.user);
  await res.result.end();
}));

export default router;
