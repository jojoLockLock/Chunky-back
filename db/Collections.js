/**
 * Created by jojo on 2017/4/26.
 */
const mongoose=require('mongoose');
const Schema=mongoose.Schema;
const utils=require('../utils');
const {isEmpty}=utils;
const userSchema=new Schema({
    userAccount:String,
    userName:String,
    userPassword:String,
    isFreeze:{type:Boolean,default:false},
});
userSchema.methods.isVerify=function (userPassword) {
    return Object.is(this.userPassword,userPassword);
};
userSchema.methods.getKey=function () {
    return `${Date.now.toString()}?${this.userAccount}`
};

//判断userAccount是否存在
userSchema.statics.isExist=function (userAccount) {
    if(isEmpty([userAccount])){
        throw Error(`function userSchema.statics.isExist need 1 argument not allow undefined or null`)
    }
    return new Promise((resolve,reject)=>{
        this.find({userAccount}).exec((err,users)=>{
            if(err){
                throw err;
            }
            if(Object.is(users.length,0)){
                reject(`userAccount:${userAccount} have not exist`);
            }else{
                resolve(users[0]);
            }

        })
    })
};


const addressListSchema=new Schema({
    userAccount:String,
    addressList:[{targetAccount:String}]
});

//判断通讯录是否存在
addressListSchema.statics.isExist=function (userAccount) {
    if(isEmpty([userAccount])){
        throw Error(`function addressListSchema.statics.canCreate need 1 argument not allow undefined or null`)
    }
    return new Promise((resolve,reject)=>{
        this.find({userAccount}).exec((err,al)=>{
            if(err){
                throw err;
            }
            if(Object.is(al.length,0)){
                reject(`addressList from userAccount:${userAccount} have not exist`);
            }else{
                resolve(al[0]);
            }

        })
    })
};
//判断目标是否已在通讯录内
addressListSchema.statics.isAccountExistInAddressList=function (userAccount,targetAccount) {
    if(isEmpty([userAccount,targetAccount])){
        throw Error(`function addressListSchema.statics.isAccountInExist need 2 argument not allow undefined or null`)
    }
    return new Promise((resolve,reject)=>{
        this.isExist(userAccount).then(
            (al)=>{
                let isExist=false;

                al.addressList.forEach(a=>{
                    if(Object.is(a.targetAccount,targetAccount)){
                        isExist=true
                    }
                });

                if(isExist){
                    resolve(`${targetAccount} is exist in addressList from ${userAccount}`);
                }else{
                    reject();
                }
            },
            (msg)=>{
              reject(msg);
            }
        )
    })
};


const chatRecordSchema=new Schema({
    beforeAccount:String,
    afterAccount:String,
    records:[
        {
            senderAccount:String,
            date:{type:Date,default:Date.now},
            content:String,
        }
    ]

});
//判断聊天记录是否已经存在
chatRecordSchema.statics.isExist=function (beforeAccount,afterAccount) {
    if(isEmpty([beforeAccount,afterAccount])){
        throw Error(`function addressListSchema.statics.isExist need 2 argument not allow undefined or null`)
    }
    return new Promise((resolve,reject)=>{
        this.find({$or:[
            {beforeAccount,afterAccount},
            {afterAccount,beforeAccount}
        ]}).exec((err,cr)=>{
            if(err){
                throw err;
            }
            if(Object.is(cr.length,0)){
                reject(`chatRecord between ${beforeAccount} and ${afterAccount} have not exist`);
            }else{
                resolve(cr[0]);
            }
        })
    })
};

const User=mongoose.model('User',userSchema);

const AddressList=mongoose.model('AddressList',addressListSchema);

const ChatRecord=mongoose.model('ChatRecord',chatRecordSchema);


module.exports={
    User,
    AddressList,
    ChatRecord,
};