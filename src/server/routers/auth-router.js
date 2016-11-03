import authenticationController from 'server/controllers/authentication-controller';
import loggers from 'server/loggers';
import catchAsync from 'server/catch-async';
import { Router } from 'express';

const catchHandler = catchAsync(function (err, req, res) {
  loggers.security.error({err: err});
  res.result.delay().status(500).apply(res);
});

var router = new Router();

router.post('/login', catchHandler(async function (req, res) {
  var result = await authenticationController.login(res.result, req.body.username, req.body.password);
  await result.apply(res);
  res.end();
}));

export default router;
