import path from 'path';
import Koa from 'koa';
import render from 'koa-ejs';

import ReqResService from './services/req-res';

const app = new Koa();

render(app, {
  root: path.join(__dirname, '../templates'),
  layout: 'template',
  viewExt: 'html',
  cache: false,
  debug: false,
});

app.use(async function (ctx) {
  const users = await ReqResService.scrape();

  await ctx.render('content', {
    users
  });
});

app.on('error', (err) => {
  console.error(err);
});

app.listen(3000, () => {
  console.log('Server ready at http://localhost:3000');
});
