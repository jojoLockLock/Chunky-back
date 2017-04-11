/**
 * Created by JoJo on 2017/4/11.
 */
let fs= require('fs'),
    path = require('path');

const logPath=path.join(__dirname,"webServerLog.txt");
function writeLog(content) {
    fs.readFile(logPath,function (err,bytesRead) {
        if(err){
            throw err;
        }
        fs.writeFile(logPath,`${bytesRead.toString()}${content} \n`, function (err) {
            if(err){
                throw err;
            }
        });

    })
}



module.exports={
    writeLog:writeLog
};