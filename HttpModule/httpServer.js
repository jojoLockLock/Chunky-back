/**
 * Created by 13944 on 2017/6/24.
 */
import Koa from 'koa';
import bodyParser from 'koa-bodyparser';
import httpControllers from './httpControllers';
const app=new Koa();

const printTime= async (ctx,next)=>{
    const start=new Date().getTime();
    await next();
    const ms=new Date().getTime()-start;
    console.info(`${ctx.request.method} ${ctx.request.url} Time ${ms}ms`);
};



app.use(bodyParser());

app.use(printTime);

app.use(httpControllers.routes());

app.listen(3000);