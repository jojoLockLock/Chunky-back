/**
 * Created by jojo on 2017/4/27.
 */
const koa=require('koa');

const app=new koa();


app.use(async (ctx,next)=>{
    await next();
    ctx.response.type="text/html";
    ctx.response.body= "<h1>hello wrold</h1>"

});


app.listen(3000);