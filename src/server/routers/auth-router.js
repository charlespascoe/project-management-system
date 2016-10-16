import authenticationController from 'server/controllers/authentication-controller';
import loggers from 'server/loggers';
import catchAsync from 'server/catch-async';
import { Router } from 'express';

const catchHandler = catchAsync(function (err, req, res) {
  loggers.security.error({err: err});
  setTimeout(() => res.status(500).end(), 1000 * Math.random());
});

export function AuthRouter(controller) {
  var router = new Router();

  router.post('/login', catchHandler(async function (req, res) {
    var result = await controller.login(req.body.username, req.body.password);
    await result.apply(res);
    res.end();
  }));

  return router;
};

export default AuthRouter(authenticationController);
