/**
 * Created by jojo on 2017/4/26.
 */
const writeDbLog=require('./../writeLog').writeDbLog;


const mongoose=require('mongoose');

db=mongoose.connection;

db.on('error', ()=>{
    let msg='db connection error';
    console.error(msg);
    writeDbLog(msg);
});
db.on('open', ()=>{
    let msg='db open';
    console.log(msg);
    setTimeout(()=>{
        writeDbLog(msg);
    })

});
db.on('connecting', ()=>{
    let msg='db connecting...';
    console.log(msg);
    setTimeout(()=>{
        writeDbLog(msg);
    },1000)
});
db.on('connected', ()=>{
    let msg='db connected';
    console.log(msg);
    setTimeout(()=>{
        writeDbLog(msg);
    },1000)
});
db.on('disconnecting', ()=>{
    let msg='db disconnecting...';
    console.log(msg);
    setTimeout(()=>{
        writeDbLog(msg);
    },1000)
});
db.on('disconnected', ()=>{
    let msg='db disconnected';
    console.log(msg);
    setTimeout(()=>{
        writeDbLog(msg);
    },1000)
});
db.on('close', ()=>{
    let msg='db close';
    console.log(msg);
    setTimeout(()=>{
        writeDbLog(msg);
    },1000)
});

const dbUrl=require('./../Config').url.db;

module.exports={
    connect() {
        mongoose.connect(dbUrl);

    },
    disconnect() {
        mongoose.disconnect();
    }
};