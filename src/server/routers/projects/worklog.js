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
    // Gets list of work log entries
  }))
  .post(catchHandler(async function (req, res) {
    // Create a work log entry
  }));

router.param('workLogId', function (req, res, next) {
  // Valdiate workLogId
  next();
});

router.delete('/:workLogId', catchHandler(function (req, res, next) {
  // Delete work log entry
}));
