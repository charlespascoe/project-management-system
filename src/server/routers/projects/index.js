import { Router } from 'express';
import catchAsync from 'server/catch-async';
import httpStatuses from 'http-status-codes';
import loggers from 'server/loggers';
import membersRouter from 'server/routers/projects/members';
import projectsController from 'server/controllers/projects-controller';
import tasksRouter from 'server/routers/projects/tasks';
import Project from 'server/models/project';

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
  if (!Project.schema.id.validate(req.params.projectId)) {
    loggers.main.debug({ip: req.ip}, `Invalid project ID: ${req.params.projectId}`);
    res.result.delay().status(httpStatuses.BAD_REQUEST).end();
    return;
  }

  req.projectId = req.params.projectId

  next();
});

router.route('/:projectId')
  .get(catchHandler(async function (req, res) {
    // Get detailed info on a project
  }))
  .put(catchHandler(async function (req, res) {
    // Update details about a project
  }));

router.get('/:projectId/non-members', catchHandler(async function (req, res) {
  await projectsController.getNonMembers(res.result, req.user, req.projectId);
  await res.result.end();
}));

router.use('/:projectId/members', membersRouter);
router.use('/:projectId/tasks', tasksRouter);

export default router;

