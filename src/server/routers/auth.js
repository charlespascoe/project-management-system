import authenticationController from 'server/controllers/authentication-controller';
import loggers from 'server/loggers';
import catchAsync from 'server/catch-async';
import { Router } from 'express';

const catchHandler = catchAsync(function (err, req, res) {
  loggers.security.error({err: err});
  res.result.delay().status(500).end();
});

var router = new Router();

router.get('/auth-token', catchHandler(async function (req, res) {
  // Technically it's the authentication header, but hey...
  var authHeader = req.headers.authorization;
  var result = await authenticationController.getAuthToken(res.result, req.ip, authHeader);
  await result.end();
}));

router.delete('/auth-token/:tokenId?', catchHandler(async function (req, res) {
  var result = await authenticationController.deleteTokenPair(req.params.tokenId);
  await result.end();
}));

export default router;
