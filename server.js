/**
 * Created by JoJo on 2017/4/1.
 */
const ws = require("nodejs-websocket");
console.log("开始建立连接...");
let connList={};
let server = ws.createServer(function(conn){

    let ip=conn.headers.origin;
    console.info('连接进入'+ip);
    connList[ip]=conn;


    conn.on("text", function (str) {
        console.log("收到的信息为:"+str);
        // let req=JSON.parse(str);

        Object.keys(connList).forEach(ip=>{
            connList[ip].sendText(str);
        })
    });
    conn.on("close", function (code, reason) {
        if(ip in connList){
            delete connList[ip];
            console.info('移出list');
        }
        console.log("关闭连接");
    });
    conn.on("error", function (code, reason) {
        console.log("异常关闭");
    });


}).listen(8001);
console.log("WebSocket建立完毕");


const response=(req,conn,connList)=>{
    let ip=conn.headers.origin;
    switch (req['operaCode']){
        case 1:
            break;
        default:
            break;
    }
};



//创建web服务器
let http = require("http");
let fs = require("fs");

http.createServer(function(req,res){
    let path = req.url;
    console.log("path1: "+path);
    if(path == "/"){
        path = "/static/index.html";
    }else if(path == "/index.css"){
        path = "/static/index.css";
    }else if(path == "/index.js"){
        path = "/static/index.js";
    }
    sendFile(res,path);
}).listen(3000);

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