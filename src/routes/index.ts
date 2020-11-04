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

router.get('/users', async (ctx: koa.Context) => {
  const users = await ReqResService.getAll();

  ctx.body = users;
});

router.get('/affluent', async (ctx: koa.Context) => {
  const affluent = await AffluentService.getAll();

  ctx.body = affluent;
});

router.get('/', async (ctx: koa.Context) => {
  await ctx.render('content');
});

export default router;
