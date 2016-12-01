import authRouter from 'server/routers/auth';
import authenticate from 'server/middleware/authenticate';
import projectsRouter from 'server/routers/projects';
import usersRouter from 'server/routers/users';
import rolesRouter from 'server/routers/roles';

export default function routers(app) {
  app.use('/auth', authRouter);
  app.use('/projects', authenticate, projectsRouter);
  app.use('/users', authenticate, usersRouter);
  app.use('/roles', authenticate, rolesRouter);
};
