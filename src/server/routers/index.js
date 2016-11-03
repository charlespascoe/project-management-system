import rootRouter from 'server/routers/root';
import authRouter from 'server/routers/auth-router';

export default function routers(app) {
  app.use('/', rootRouter);
  app.use('/auth/', authRouter);
};
