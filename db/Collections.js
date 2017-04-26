/**
 * Created by jojo on 2017/4/26.
 */
const mongoose=require('mongoose');
const Schema=mongoose.Schema;
const utils=require('../utils');
const {isEmpty,checkArguments}=utils;
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

    return new Promise((resolve,reject)=>{

        checkArguments(arguments);

        this.find({userAccount}).exec((err,users)=>{
            if(err){
                reject(err);
            }
            Object.is(users.length,0)
                ?resolve({isExist:false})
                :resolve({isExist:true,target:users[0]});

        })
    })
};


const addressListSchema=new Schema({
    userAccount:String,
    addressList:[{targetAccount:String}]
});

//判断通讯录是否存在
addressListSchema.statics.isExist=function (userAccount) {
    return new Promise((resolve,reject)=>{
        checkArguments(arguments);
        this.find({userAccount}).exec((err,al)=>{
            if(err){
                reject(err);
            }
            Object.is(al.length,0)
                ?resolve({isExist:false})
                :resolve({isExist:true,target:al[0]});

        })
    })
};
//判断目标是否已在通讯录内
addressListSchema.statics.isAccountExistInAddressList=function (userAccount,targetAccount) {

    return new Promise((resolve,reject)=>{

        checkArguments(arguments);

        this.isExist(userAccount)
        //判断通讯录是否存在，存在则继续判断目标是否在通讯录内
            .then(result=>{
                if(result.isExist){
                    return result.target;
                }else{
                    throw Error(`addressList from ${userAccount} have not exist`);
                }
            })
            //判断目标是否在通讯录内
            .then(target=>{
                let isExistInAddressList=target.addressList.some(tc=>{
                    if(targetAccount==tc.targetAccount){
                        return true;
                    }
                });
                if(isExistInAddressList){
                    resolve({isExist:true,target:AddressList});
                }else{
                    resolve({isExist:false});
                }
            })
            //抛出异常
            .catch(err=>{
                throw Error(err);
            });
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
    return new Promise((resolve,reject)=>{

        checkArguments(arguments);

        this.find({$or:[
            {beforeAccount,afterAccount},
            {afterAccount,beforeAccount}
        ]}).exec((err,cr)=>{
            if(err){
                reject(err);
            }
            Object.is(cr.length,0)
                ?resolve({isExist:false})
                :resolve({isExist:true,target:cr[0]});

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