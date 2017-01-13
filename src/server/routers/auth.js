import { Router } from 'express';
import authenticate from 'server/middleware/authenticate';
import antihammering from 'server/middleware/antihammering';
import authenticationController from 'server/controllers/authentication-controller';
import catchAsync from 'server/catch-async';
import httpStatuses from 'http-status-codes';
import loggers from 'server/loggers';

const catchHandler = catchAsync(function (err, req, res) {
  loggers.security.error({err: err});
  res.result.delay().status(httpStatuses.INTERNAL_SERVER_ERROR).end();
});

var router = new Router();

router.get('/auth-token', antihammering(), catchHandler(async function (req, res) {
  // Technically it's the authentication header, but hey...
  var authHeader = req.headers.authorization;
  await authenticationController.getAuthToken(res.result, req.ip, authHeader, req.query['long-expiry'] == 'true');
  await res.result.end();

  if (res.result.changes.status == httpStatuses.UNAUTHORIZED) {
    req.hit();
  }
}));

router.delete('/auth-token/:tokenId?', authenticate, catchHandler(async function (req, res) {
  await authenticationController.deleteTokenPair(res.result, req.user, req.params.tokenId);
  await res.result.end();
}));

router.route('/elevation')
  .get(authenticate, catchHandler(async function (req, res) {
    var base64Pass = req.headers['x-additional-auth'];
    await authenticationController.elevateUser(res.result, req.user, base64Pass);
    await res.result.end();
  }))
  .delete(authenticate, catchHandler(async function (req, res) {
    await authenticationController.dropElevation(res.result, req.user);
    await res.result.end();
  }));

export default router;
