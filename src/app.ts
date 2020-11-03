import path from 'path';
import Koa from 'koa';
import render from 'koa-ejs';

import router from './routes';

const app = new Koa();

render(app, {
  root: path.join(__dirname, '../templates'),
  layout: 'template',
  viewExt: 'html',
  cache: false,
  debug: false,
});

app.use(router.routes());

app.on('error', (err) => {
  console.error(err);
});

const port = process.env.PORT || 8080;
app.listen(port, () => {
  console.log(`Listening at http://localhost:${port}`);
});
