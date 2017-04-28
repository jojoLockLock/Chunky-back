/**
 * Created by JoJo on 2017/4/1.
 */
const ws = require("nodejs-websocket");

console.log("start connect..");




let connList=[];
let server = ws.createServer(function(conn){

    connList.push(conn);
    let flag=connList.length-1;

    conn.on("text", function (str) {
        console.log("text:"+str);
        let req=JSON.parse(str);

        if(Object.is(req['operaCode'],2)){
            getBroadcast(conn,connList)(req.context);
        }

    });
    conn.on("close", function (code, reason) {
        connList.splice(flag,1);
        console.log("close connect ,and remove connect");
    });
    conn.on("error", function (code, reason) {
        console.log("exception");
    });


}).listen(8001);


function getBroadcast(conn,connList) {
    return (message)=>{
        let cleanup=[];
        connList.forEach(c=>{
            if(conn!==c){
                conn.sendText(JSON.stringify({
                    responseCode:3,
                    content:message,
                }))
            }
        });

    }
}



























//创建web服务器
let http = require("http");
let fs = require("fs");
let path = require('path');
let writeServerLog=require('./writeLog').writeServerLog;
const db=require('./db/dbServer');

//连接数据库
db.connect();



http.createServer(function(req,res){
    let path = req.url;
    let remoteAddress=getClientIp(req);
    let requestContent=` ${remoteAddress} ${path}`;
    writeServerLog(requestContent);
    console.log(requestContent);
    req.on('data',(data)=>{
        try{
            let reqData=data.toString();
            console.info('http获得数据',reqData);
            if(path=='/api/login'){
                writeServerLog(`${remoteAddress} loginData：${reqData}`);
                res.write(login(JSON.parse(reqData)));
                res.end();
            }
        }catch (ex){
            res.write(getRes({
                "responseCode":-1,
                "message":ex
            }));
            res.end();
        }
    });
    
    
    if(path == "/"){
        path = "/static/index.html";
    }else if(path == "/index.css"){
        path = "/static/index.css";
    }else if(path == "/index.js"){
        path = "/static/index.js";
    }else if(path== "/routes/error.async.js"){
        path="/static/routes/error.async.js"
    }else if(path=="/routes/home.async.js"){
        path="/static/routes/home.async.js"
    }
    sendFile(res,path);
}).listen(3000);

function getClientIp(req) {
    try{
        return req.headers['x-forwarded-for'] ||
            req.connection.remoteAddress ||
            req.socket.remoteAddress ||
            req.connection.socket.remoteAddress;
    }catch (e){
        console.info(e);
    }
}

function sendFile(res,path){
    path = process.cwd()+path;
    fs.readFile(path,function(err,stdout,stderr){
        if(!err){
            let data = stdout,
                type = path.substr(path.lastIndexOf(".")+1,path.length);
            res.writeHead(200,{'Content-type':"text/"+type});   //在这里设置文件类型，告诉浏览器解析方式
            res.write(data);
        }
        res.end();
    })
}
function login(userData) {
    return JSON.stringify(tempVerify(userData));
}
let tempUser=require('./mock/tempUser');
function tempVerify(userData) {
    const {userName,userPassword}=userData;
    return tempUser.verity(userName,userPassword);
}
function getRes(content) {
    return JSON.stringify(content);
}