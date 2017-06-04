/**
 * Created by jojo on 2017/4/27.
 */
const UrlConfig=require('./config/UrlConfig');
const dbServer=require('./db/dbServer');


//连接到数据库
const db=dbServer.connect(UrlConfig.db);

const socket={

};

const httpServer=require('./httpServer').start({port:3000,socket});
const socketServer=require('./socketServer').start(httpServer);

socket["connectionList"]=socketServer.conList;