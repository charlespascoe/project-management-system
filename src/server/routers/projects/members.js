import { Router } from 'express';
import loggers from 'server/loggers';
import catchAsync from 'server/catch-async';

const catchHandler = catchAsync(function (err, req, res) {
  loggers.main.error({err: err});
  res.result.delay().status(500).end();
});

var router = new Router();

router.route('/')
  .get(catchHandler(async function (req, res) {
    // List all members
  }))
  .post(catchHandler(async function (req, res) {
    // Add a member, or update their role
  }));

router.param('userId', function (req, res, next) {
  if (!validate(req.params.userId).matches(/^\d+$/).isValid()) {
    res.result.delay().status(400).end();
    return;
  }

  req.params.userId = parseInt(req.params.userId);

  next();
});

router.delete('/:userId', catchHandler(async function (req, res) {
  // Remove a member
}));

export default router;
