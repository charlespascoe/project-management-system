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
    // Get summary details of all tasks in project
  }))
  .post(catchHandler(async function (req, res) {
    // Create a task
  }));

router.param('taskId', function (req, res, next) {

  next();
});

router.route('/:taskId')
  .get(catchHandler(async function (req, res) {
    // Get detailed info on task
  }))
  .put(catchHandler(async function (req, res) {
    // Update task
  }));

export default router;
