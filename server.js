/**
 * Created by JoJo on 2017/4/1.
 */
const ws = require("nodejs-websocket");
console.log("开始建立连接...");
let connList=[];
let server = ws.createServer(function(conn){

    let ip=conn.headers.origin;
    console.info('连接进入'+ip);
    connList.push(conn);
    let flag=connList.length-1;

    conn.on("text", function (str) {
        console.log("收到的信息为:"+str);
        let req=JSON.parse(str);
        
        if(req['operaCode']==2){
            connList.forEach((c,i)=>{
                if(i!=flag){
                    console.info('推送给大家');
                    c.sendText(JSON.stringify({
                        responseCode:3,
                        content:req.content
                    }));
                }
            })
        }
        
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
    req.on('data',(data)=>{
        console.info('http获得数据',data);
    });
    let path = req.url;
    console.log("path1: "+path);
    if(path == "/"){
        path = "/static/index.html";
    }else if(path == "/index.css"){
        path = "/static/index.css";
    }else if(path == "/index.js"){
        path = "/static/index.js";
    }else if(path == "/api/login"){
        res.write(login())
    }else if(path== "/routes/error.async.js"){
        path="/static/routes/error.async.js"
    }else if(path=="/routes/home.async.js"){
        path="/static/routes/home.async.js"
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
function login() {
    return JSON.stringify({
        "responseCode":1,
        "userData":{
            "userName":"tester",
            "userKey":"123",
            "message":"登录成功"
        }
    })
}