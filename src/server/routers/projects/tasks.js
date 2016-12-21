import { Router } from 'express';
import catchAsync from 'server/catch-async';
import httpStatuses from 'http-status-codes';
import loggers from 'server/loggers';
import tasksController from 'server/controllers/tasks-controller';

const catchHandler = catchAsync(function (err, req, res) {
  loggers.main.error({err: err});
  res.result.delay().status(httpStatuses.INTERNAL_SERVER_ERROR).end();
});

var router = new Router();

router.route('/')
  .get(catchHandler(async function (req, res) {
    await tasksController.getTasks(res.result, req.user, req.projectId);
    await res.result.end();
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
