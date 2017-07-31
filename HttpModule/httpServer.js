/**
 * Created by 13944 on 2017/6/24.
 */
import Koa from 'koa';
import bodyParser from 'koa-bodyparser';
import httpControllers from './httpControllers';
import {getToken,verifyToken} from '../AuthModule';
import koaStaticCache from 'koa-static-cache';
import koaBody from 'koa-body';
import path from 'path';
const app=new Koa();

const printTime= async (ctx,next)=>{

    const start=new Date().getTime();

    await next();

    const ms=new Date().getTime()-start;

    console.info(`${ctx.request.method} ${ctx.request.url} Time ${ms}ms`);
};


const isOpenUrl = (ctx)=>{
    const {method,path}=ctx;

    console.info(path);
    if(path.startsWith("/static/")){
        return Object.is(method,"GET");
    }

    switch (path){
        case "/api/user":
            return Object.is(method,"POST");
        case "/api/login":
            return Object.is(method,"GET");
        case "/":
            return Object.is(method,"GET");
        case "/test":
            return Object.is(method,"GET");
        default:
            return false;
    }
};

const isAuth=(ctx)=>{

    try{

        const token=ctx.request.body.token||ctx.header["access-token"];

        const userAccount= verifyToken(token);

        ctx.state={
            userAccount
        };

        return true;

    }catch(e){
        console.info(e);
        return false;
    }
};

const filterReq= async (ctx,next)=>{

    if(isOpenUrl(ctx)||isAuth(ctx)){

        await next();

    }else{

        ctx.response.body={
            message:"is wrong",
            status:-1
        }
    }
};

export default function ({port}={port:3000}) {

    app.use(bodyParser());

    app.use(printTime);

    app.use(koaBody({ multipart: true }));

    app.use(koaStaticCache(path.join(__dirname, '../static'), {
        maxAge: 365 * 24 * 60 * 60
    }))

    app.use(filterReq);

    app.use(httpControllers.routes());

    console.info(`http server running on port:${port}`);

    return app.listen(port);
};