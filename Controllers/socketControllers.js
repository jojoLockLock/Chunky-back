/**
 * Created by jojo on 2017/4/28.
 */
const operations=require('../db/Operations');
const {isVerifyToken}=operations;
const getJsonMessage=(obj)=>{
    return JSON.stringify(obj);
};

const authController=(send,content,mc)=>{
    const {userAccount,token}=content;
    const {connection,conList}=mc;
    if(isVerifyToken(userAccount,token)){
        mc.isAuth=true;
        mc.userAccount=userAccount;
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

const redirectController=(send,content,mc)=>{
    send(getJsonMessage({
        message:"type not dispose",
        status:-1,
        type:content.type
    }))
};

const boardCastController=(send,content,mc)=>{

};

module.exports={
    authController,
    redirectController,
};