/**
 * Created by jojo on 2017/4/27.
 */
const WebSocket = require('ws');
const WebSocketServer = WebSocket.Server;
const operations=require('./db/Operations');
const {isVerifyToken}=operations;

console.info(isVerifyToken);
const utils=require('./utils');
const {isEmpty,checkArguments}=utils;
const conList={

};
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
            const mc=new MessageControllers(ws);
            mc.add('auth',(send,content)=>{
                const {userAccount,token}=content;
                console.info(isVerifyToken(userAccount,token));
                if(isVerifyToken(userAccount,token)){

                    clearTimeout(authTimer);
                    connection.isAuth=true;
                    conList[userAccount]=connection;
                    send(getJsonMessage({
                        message:"auth socket link success",
                        status:1,
                        type:"auth"
                    }))
                }else{

                    send(getJsonMessage({
                        message:"auth socket link fail",
                        status:-1,
                        type:"auth"
                    }))
                }
            });
            mc.redirect((send,content)=>{
                ws.send(getJsonMessage({
                    message:"type not dispose",
                    status:-1,
                    type:content.type
                }))
            });

            ws.on('close',function () {
                console.info('close');
            });


        });

    }
};


class MessageControllers {
    constructor(ws) {
        this.ws=ws;
        this.controllers={};

        this.init();
    }
    init() {
        const {ws,controllers}=this;
        ws.on('message',(message)=>{
            //绑定send方法；
            let send=ws.send.bind(ws);
            try{
                let content=JSON.parse(message),
                    type=content.type;

                if(!isEmpty([type])){
                    controllers[type](send,content);
                }else if(controllers["__redirect__"]){
                    controllers["__redirect__"](send,content);
                }
            }catch (e){
                console.info(e);
            }
        })
    }
    add(type,controller) {
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

    }
    redirect(controller){
        if(isEmpty([controller])){
            console.info('arguments error');
            return;
        }
        if(!Object.is(typeof type,"string")){
            throw new Error('controller must string');
        }
        this.controllers["__redirect__"]=controller;
    }
}


