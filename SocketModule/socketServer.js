/**
 * Created by 13944 on 2017/6/24.
 */
import WebSocket from 'ws';
import {verifyToken} from '../AuthModule';
import socketControllers from './socketControllers';
const WebSocketServer = WebSocket.Server;




const socketConList={};
export default function (server) {

    const wss=new WebSocketServer({
        server
    });


    wss.on("connection",(ws)=>{
        try{

            const mc=new SocketControllers(ws,socketConList,true);
            mc.add('boardCast',socketControllers.boardCastController);
        }catch(e){
            ws.close();
        }
    });

    console.info(`socket server is running`);
    return socketConList;
}

export const pushNotification=(userAccount,message)=>{
    if(userAccount in socketConList){
        console.info(userAccount,message);
        socketConList[userAccount].send(JSON.stringify({
            type:"notification",
            status:1,
            payload:message
        }))
    }else{
        console.warn(`${userAccount} is not online`);
    }
};



class SocketControllers {
    constructor(connection,socketConnectList,shouldAuth=false){
        this.connection=connection;
        this.controllers={};
        this.callbacks={};
        this.socketConnectList=socketConnectList;
        console.info(`con`,this.socketConnectList===socketConList);
        this.isAuth=false;
        this.connectionInfo={

        };
        this.send=connection.send.bind(connection);
        this.init();
        if(shouldAuth){
            this.auth();
        }
    }
    auth() {
        try{
            
            const ws=this.connection;
            const {url}=ws.upgradeReq;
            const token=url.substr(1).split("=")[1];
            const userAccount = verifyToken(token);
            this.socketConnectList[userAccount]=ws;
            console.info(this.socketConnectList===socketConList);
            this.connectionInfo["userAccount"]=userAccount;
            this.isAuth=true;

        }catch(e){
            this.connection.close();
            console.info(`close connection`,e.message);
        }
    };
    add(messageType,controller) {

        if(!Object.is(typeof controller,"function")){
            throw new Error('controller must a function');
        }
        if(!Object.is(typeof messageType,"string")){
            throw new Error('messageType must string');
        }

        this.controllers[messageType]=controller;

    };
    init() {
        const {connection,controllers,send}=this;
        connection.on('message',(message)=>{
            try{
                console.info("origin data",message);
                let _message=JSON.parse(message),
                    type=_message.type;

                if(type){

                    controllers[type](send,_message,this);

                }else if(controllers["__redirect__"]){

                    controllers["__redirect__"](send,_message,this);

                }
            }catch (e){
                console.error(e);
            }
        })
    }
}