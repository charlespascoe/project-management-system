import { Router } from 'express';
import loggers from 'server/loggers';
import catchAsync from 'server/catch-async';
import membersRouter from 'server/routers/projects/members';
import tasksRouter from 'server/routers/projects/tasks';
import validate from 'server/validation';
import projectsController from 'server/controllers/projects-controller';

const catchHandler = catchAsync(function (err, req, res) {
  loggers.main.error({err: err});
  res.result.delay().status(500).end();
});

var router = new Router();

router.route('/')
  .get(catchHandler(async function (req, res) {
    var result = await projectsController.getProjects(res.result, req.user);
    await result.end();
  }))
  .post(catchHandler(async function (req, res) {
    var result = await projectsController.createProject(res.result, req.user, req.body || {});
    await result.end();
  }));

router.param('projectId', function (req, res, next) {
  if (!validate(req.params.projectId).matches(/^\d+$/).isValid()) {
    res.result.delay().status(400).end();
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

