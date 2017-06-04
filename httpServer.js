/**
 * Created by jojo on 2017/4/27.
 */
const koa=require('koa');

const app=new koa();

const bodyParser = require('koa-bodyparser');
const router=require('./Controllers/httpControllers');
const operation=require('./db/Operations');
const {isVerifyToken}=operation;

const printTime= async (ctx,next)=>{
    const start=new Date().getTime();
    await next();
    const ms=new Date().getTime()-start;
    console.info(`${ctx.request.method} ${ctx.request.url} Time ${ms}ms`);
};

const isOpenUrl=(ctx)=>{
    const {method,url}=ctx;

    switch (url){
        case "/api/login":
            return Object.is(method,"POST");
        case "/":
            return Object.is(method,"GET");
        case "/api/register":
            return Object.is(method,"POST");
        // case "/static/index.css":
        //     return Object.is(method,"GET");
        // case "/static/index.js":
        //     return Object.is(method,"GET");
        // case "/routes/error.async.js":
        //     return Object.is(method,"GET");
        // case "/routes/home.async.js":
        //     return Object.is(method,"GET");
        default:
            return Object.is(method,"GET");
    }
};
const isAuth=(ctx)=>{

    const {userAccount,token}=ctx.request.body;

    return isVerifyToken(userAccount,token);
};

const checkRequest=async (ctx,next)=>{
    if(isOpenUrl(ctx)||isAuth(ctx)){
        await next();
    }else{
        ctx.response.body={
            message:"is wrong",
            status:-1
        }
    }
};

module.exports={
    start:({port=3000,socket})=>{
        console.info(`http Server running in http://127.0.0.1:${port}`);

        //bodyParser 必须在router注册前
        app.use(bodyParser());

        app.use(printTime);

        app.use(checkRequest);


        app.use(router.getRouter(socket).routes());
        //返回sever对象
        return app.listen(port);
    }
};