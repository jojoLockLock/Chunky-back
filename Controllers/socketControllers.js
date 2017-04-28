/**
 * Created by jojo on 2017/4/28.
 */
const operations=require('../db/Operations');
const utils=require('../utils');
const {isVerifyToken}=operations;
const {isEmpty,checkArguments}=utils;
const {isAccountExistInAddressList,addChatRecord}=operations;
const getJsonMessage=(obj)=>{
    return JSON.stringify(obj);
};

const redirectController=(send,message,mc)=>{
    send(getJsonMessage({
        message:"type not dispose",
        status:-1,
        type:message.type
    }))
};

const authController=(send,message,mc)=>{
    const {userAccount,token}=message;
    const {connection,conList}=mc;
    if(isVerifyToken(userAccount,token)){
        mc.isAuth=true;
        mc.userAccount=userAccount;
        conList[userAccount]=connection;
        send(getJsonMessage({
            message:"auth socket link success",
            status:1,
            type:"auth"
        }));
        // 身份验证成功后 在连接关闭时，将连接移出列表；


    }else{
        mc.isAuth=false;
        send(getJsonMessage({
            message:"auth socket link fail",
            status:-1,
            type:"auth"
        }))
    }

    connection.on('close',()=> {
        if(userAccount in conList){
            delete conList[userAccount];
            console.info(`del connection with ${userAccount}`)
        }
    });

};



const boardCastController=(send,message,mc)=>{
    const {targetAccount,content}=message;
    const {userAccount,conList}=mc;
    if(!mc.isAuth){
        send(getJsonMessage({
            message:"not auth connection",
            type:"boardCast",
            status:-1,
        }));
        return ;
    }
    isAccountExistInAddressList(userAccount,targetAccount)
        .then(()=>{
            return addChatRecord(userAccount,targetAccount,userAccount,content);
        })
        .then(()=>{
            if(targetAccount in conList){
                conList[targetAccount].send(getJsonMessage({
                    type:"boardCast",
                    senderAccount:userAccount,
                    content,
                }));
                send(getJsonMessage({
                    message:"send message success",
                    status:1,
                    type:"boardCast"
                }));
            }else{
                send(getJsonMessage({
                    message:"targetAccount not on line",
                    status:-2,
                    type:"boardCast"
                }))
            }

        })
        .catch(err=>{
            send(getJsonMessage({
                message:err.message,
                type:"boardCast",
                status:-1,
            }))
        })
};

module.exports={
    authController,
    redirectController,
    boardCastController,
};