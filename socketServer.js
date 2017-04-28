/**
 * Created by jojo on 2017/4/27.
 */
const WebSocket = require('ws');
const WebSocketServer = WebSocket.Server;

const utils=require('./utils');
const {isEmpty,checkArguments}=utils;
const socketControllers=require('./Controllers/socketControllers');
const conList={};
const getJsonMessage=(obj)=>{
    return JSON.stringify(obj);
};
const checkConnection=(ws)=>{
    const {headers,url}=ws.upgradeReq;
    const {host}=headers;
    return Object.is(url,'/chat');
};
const getAuthTimer=(connection,second)=>{
    if(isEmpty([connection,second])){
        return undefined;
    }
    return setTimeout(()=>{
        if(Object.is(connection.isAuth,false)){
            connection.ws.close();
            console.info(`is not auth after ${second} second,close connection`);
        }
    },second*1000);

};

const {authController,redirectController}=socketControllers;
module.exports={
    start:(server)=>{
        const wss = new WebSocketServer({
            server
        });
        wss.on('connection',function (ws) {
            //验证是否为预定的url，否则直接断开
            if(!checkConnection(ws)){
                ws.close();
            }

            let connection={
                isAuth:false,
                ws,
            };
            //10秒未校验身份则断开连接；
            const authTimer=getAuthTimer(connection,30);
            const mc=new MessageControllers(ws,conList);
            mc.add('auth',authController,()=>{
                if(connection.isAuth){
                   clearTimeout(authTimer);
                }
            });
            mc.redirect(redirectController);

        });

    }
};


class MessageControllers {
    constructor(connection,conList) {
        this.connection=connection;
        this.controllers={};
        this.callbacks={};
        this.conList=conList;
        this.init();
    }
    init() {
        const {connection,controllers,conList,callbacks}=this;
        ws.on('message',(message)=>{
            //绑定send方法；
            let send=connection.send.bind(connection);
            try{
                let content=JSON.parse(message),
                    type=content.type;

                if(!isEmpty([type])){
                    controllers[type](send,content,connection,conList);
                    callbacks[type]();
                }else if(controllers["__redirect__"]){
                    controllers["__redirect__"](send,content,connection,conList);
                    callbacks["__redirect__"]();
                }
            }catch (e){
                console.info(e);
            }
        })
    }
    add(type,controller,callback) {
        if(isEmpty([type,controller])){
            console.info('arguments error');
            return;
        }

        if(!Object.is(typeof controller,"function")){
            throw new Error('controller must a function');
        }
        if(!Object.is(typeof type,"string")){
            throw new Error('controller must string');
        }

        this.controllers[type]=controller;


        if(!isEmpty([callback])){
            if(!Object.is(typeof controller,"function")){
                throw new Error('callback must a function');
            }else{
                this.callbacks[type]=callback;
            }
        }

    }
    redirect(controller,callback){
        if(isEmpty([controller])){
            console.info('arguments error');
            return;
        }
        if(!Object.is(typeof type,"string")){
            throw new Error('controller must string');
        }
        this.controllers["__redirect__"]=controller;

        if(!isEmpty([callback])){
            if(!Object.is(typeof controller,"function")){
                throw new Error('callback must a function');
            }else{
                this.callbacks["__redirect__"]=callback;
            }
        }
    }
}


