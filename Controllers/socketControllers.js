/**
 * Created by jojo on 2017/4/28.
 */
const operations=require('../db/Operations');
const {isVerifyToken}=operations;
const getJsonMessage=(obj)=>{
    return JSON.stringify(obj);
};

const authController=(send,content,connection,conList)=>{
    const {userAccount,token}=content;
    if(isVerifyToken(userAccount,token)){
        connection.isAuth=true;
        conList[userAccount]=connection;
        send(getJsonMessage({
            message:"auth socket link success",
            status:1,
            type:"auth"
        }));
        // 身份验证成功后 在连接关闭时，将连接移出列表；
        ws.on('close',()=> {
            if(userAccount in conList){
                delete conList[userAccount];
                console.info(`del connection with ${userAccount}`)
            }
        });

    }else{

        send(getJsonMessage({
            message:"auth socket link fail",
            status:-1,
            type:"auth"
        }))
    }
};

const redirectController=(send,content,connection,conList)=>{
    send(getJsonMessage({
        message:"type not dispose",
        status:-1,
        type:content.type
    }))
};


module.exports={
    authController,
    redirectController,
};