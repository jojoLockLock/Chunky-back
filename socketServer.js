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
const getAuthTimer=(mc,second)=>{
    if(isEmpty([mc,second])){
        return undefined;
    }
    return setTimeout(()=>{
        if(Object.is(mc.isAuth,false)){
            mc.connection.close();
            console.info(`is not auth after ${second} second,close connection`);
        }
    },second*1000);

};

const {authController,redirectController,boardCastController}=socketControllers;
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


            const mc=new MessageControllers(ws,conList);

            //x秒未校验身份则断开连接；
            const authTimer=getAuthTimer(mc,10);
            mc.add('auth',authController);
            mc.add('boardCast',boardCastController);
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
        this.isAuth=false;
        this.userAccount=undefined;
        this.send=connection.send.bind(connection);
        connection.send=this.send;
        this.init();
    }
    init() {
        const {connection,controllers,callbacks,send}=this;
        connection.on('message',(message)=>{
            //绑定send方法；

            try{
                let _message=JSON.parse(message),
                    type=_message.type;

                if(!isEmpty([type])){
                    controllers[type](send,_message,this);
                    // if(!isEmpty(callbacks[type])){
                    //     callbacks[type](send,_message,this);
                    // }

                }else if(controllers["__redirect__"]){
                    controllers["__redirect__"](send,_message,this);
                    // if(!isEmpty(callbacks["__redirect__"])){
                    //     callbacks["__redirect__"](send,_message,this);
                    // }

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
            throw new Error('type must string');
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
        if(!Object.is(typeof controller,"function")){
            throw new Error('controller must a function');
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


