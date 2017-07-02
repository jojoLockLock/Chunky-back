/**
 * Created by 13944 on 2017/6/24.
 */
import WebSocket from 'ws';
import {verifyToken} from '../AuthModule';
const WebSocketServer = WebSocket.Server;

const socketConList={};

const isAuth=(ws)=>{
    try{
        const {url}=ws.upgradeReq;
        const token=url.substr(1).split("=")[1];
        const userAccount = verifyToken(token);
        socketConList[userAccount]=ws;
    }catch(e){

        return false;
    }

};

export default function (server) {

    const wss=new WebSocketServer({
        server
    });

    const socketConList={};
    wss.on("connection",(ws)=>{
        // if(!isAuth(ws)){
        //     ws.close();
        // }
        ws.on("message",function (message) {
            console.info(message);
        })
    });

    console.info(`socket server is running`);
    return socketConList;
}