/**
 * Created by jojo on 2017/4/27.
 */
const koa=require('koa');
const router=require('./Controllers/controllers');
const app=new koa();

const bodyParser = require('koa-bodyparser');
app.use(async (ctx,next)=>{
    console.info(`${ctx.request.method} ${ctx.request.url}`);
    await next();
});
app.use(async (ctx,next)=>{
    const start=new Date().getTime();
    await next();
    const ms=new Date().getTime()-start;
    console.info(`Time ${ms}ms`);
});


//bodyParser 必须在router注册前
app.use(bodyParser());
app.use(router.routes());
let server=app.listen(3000);

module.exports=server;