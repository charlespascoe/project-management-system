import authenticationController from 'server/controllers/authentication-controller';
import authenticate from 'server/middleware/authenticate';
import loggers from 'server/loggers';
import catchAsync from 'server/catch-async';
import httpStatuses from 'http-status-codes';
import { Router } from 'express';

const catchHandler = catchAsync(function (err, req, res) {
  loggers.security.error({err: err});
  res.result.delay().status(httpStatuses.INTERNAL_SERVER_ERROR).end();
});

var router = new Router();

router.get('/auth-token', catchHandler(async function (req, res) {
  // Technically it's the authentication header, but hey...
  var authHeader = req.headers.authorization;
  await authenticationController.getAuthToken(res.result, req.ip, authHeader, req.query['long-expiry'] == 'true');
  await res.result.end();
}));

router.delete('/auth-token/:tokenId?', authenticate, catchHandler(async function (req, res) {
  await authenticationController.deleteTokenPair(res.result, req.user, req.params.tokenId);
  await res.result.end();
}));

export default router;
