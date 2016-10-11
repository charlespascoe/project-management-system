import { Router } from 'express';

export function RootRouter() {
  var router = new Router();

  router.get('/', (req, res) => res.render('index'));

  return router;
}

export default RootRouter();
