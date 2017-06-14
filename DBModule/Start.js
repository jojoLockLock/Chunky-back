/**
 * Created by 13944 on 2017/6/14.
 */
const mongoose=require('mongoose');
db=mongoose.connection;

db.on('connecting', ()=>{
    let msg='db connecting...';
    console.log(msg);
});
db.on('connected', ()=>{
    let msg='db connected';
    console.log(msg);
});
db.on('disconnecting', ()=>{
    let msg='db disconnecting...';
    console.log(msg);
});
db.on('disconnected', ()=>{
    let msg='db disconnected';
    console.log(msg);
});
db.on('close', ()=>{
    let msg='db close';
    console.log(msg);
});

module.exports={
    connect(dbUrl) {
        return new Promise((resolve,reject)=>{
            db.on('open', ()=>{
                let msg='db open';
                console.log(msg);
                resolve(db);
            });
            db.on('error', ()=>{
                let msg='db connection error';
                console.error(msg);
                reject(msg);
            });
            mongoose.connect(dbUrl);
        });
    },
    disconnect() {
        mongoose.disconnect();
        return db;
    }
};