import koa from 'koa';
import Router from 'koa-router';

import AffluentService from '../services/affluent';
import ReqResService from '../services/req-res';

const router: Router = new Router<koa.DefaultState, koa.Context>();

router.get('/reload', async (ctx: koa.Context) => {
  await Promise.all([
    ReqResService.reset(),
    AffluentService.reset(),
  ]);

  ctx.redirect('/');
});

router.get('/', async (ctx: koa.Context) => {
  const [users, affluent] = await Promise.all([
    ReqResService.getAll(),
    AffluentService.getAll(),
  ]);

  await ctx.render('content', {
    users,
    affluent,
  });
});

export default router;
