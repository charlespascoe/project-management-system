import { Router } from 'express';
import catchAsync from 'server/catch-async';
import httpStatuses from 'http-status-codes';
import loggers from 'server/loggers';
import membersRouter from 'server/routers/projects/members';
import projectsController from 'server/controllers/projects-controller';
import tasksRouter from 'server/routers/projects/tasks';
import validate from 'server/validation';

const catchHandler = catchAsync(function (err, req, res) {
  loggers.main.error({err: err});
  res.result.delay().status(httpStatuses.INTERNAL_SERVER_ERROR).end();
});

var router = new Router();

router.route('/')
  .get(catchHandler(async function (req, res) {
    await projectsController.getProjects(res.result, req.user);
    await res.result.end();
  }))
  .post(catchHandler(async function (req, res) {
    await projectsController.createProject(res.result, req.user, req.body || {});
    await res.result.end();
  }));

router.param('projectId', function (req, res, next) {
  if (!validate(req.params.projectId).matches(/^\d+$/).isValid()) {
    res.result.delay().status(httpStatuses.BAD_REQUEST).end();
    return;
  }

  req.params.projectId = parseInt(req.params.projectId);

  next();
});

router.route('/:projectId')
  .get(catchHandler(async function (req, res) {
    // Get detailed info on a project
  }))
  .put(catchHandler(async function (req, res) {
    // Update details about a project
  }));

router.use('/:projectId/members', membersRouter);
router.use('/:projectId/tasks', tasksRouter);

export default router;

