import { Router } from 'express';

var router = new Router();

router.get('/', (req, res) => res.render('index'));

export default router;
