/**
 * Created by JoJo on 2017/4/11.
 */
let fs= require('fs'),
    path = require('path');

const serverLogPath=path.join(__dirname,"./log/webServerLog.txt");
const dbLogPath=path.join(__dirname,"./log/dbLog.txt");
function getWriteLog(path){
    return (content)=>{
        fs.appendFile(path,` ${new Date().toLocaleString()} | ${content} \n`, function (err) {
            if(err){
                throw err;
            }
        });
    }
}

module.exports={
    writeServerLog:getWriteLog(serverLogPath),
    writeDbLog:getWriteLog(dbLogPath)
};