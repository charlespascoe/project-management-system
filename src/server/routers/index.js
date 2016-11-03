import authenticate from 'server/middleware/authenticate';
import rootRouter from 'server/routers/root';
import authRouter from 'server/routers/auth';
import projectsRouter from 'server/routers/projects';

export default function routers(app) {
  app.use('/', rootRouter);
  app.use('/auth', authRouter);
  app.use('/projects', authenticate, projectsRouter);
};
