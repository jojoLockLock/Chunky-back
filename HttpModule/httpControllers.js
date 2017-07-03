/**
 * Created by 13944 on 2017/6/24.
 */
import koaRouter from 'koa-router';
import operations from "../DBModule/Operation";
import {getToken,delToken} from '../AuthModule';
import {pushNotification} from '../SocketModule/socketServer';
const {
    userLogin,
    queryUser,
    sendMakeFriendsRequest,
    resMakeFriendsRequest,
    becomeFriendsAndCreateChatRecords,
    getChatRecords,
}=operations;

const router=koaRouter();

router.get('/',async (ctx,next)=>{

   ctx.response.body="hello world";
   
});

router.get("/test",async(ctx,next)=>{
    let basicAuth=ctx.header["authorization"].split(" ")[1];

    let b = new Buffer(basicAuth, 'base64');

    ctx.response.body=b.toString();
});

/*
* 验证token正确性
* */
router.post("/api/auth",async(ctx,next)=>{

    ctx.response.body={
        status:1,
        message:"auth success"
    }

});

/*
* 登陆获得基础信息和token
* */
router.get("/api/login",async(ctx,next)=>{
   try{
       const {userAccount,userPassword}=ctx.query;

       await userLogin(userAccount,userPassword)
           .then(result=>{

              ctx.response.body={
                  status:1,
                  payload:{
                      data:result,
                      token:getToken(userAccount)
                  }
              }

           }).catch(e=>{

               ctx.response.body={
                   status:-1,
                   message:e.message,
               }

           });

   }catch(e){

      return {
          status:-1,
          message:e.message,
      }
   }
});

/*
* 删除token
* */
router.delete("/api/token",async(ctx,next)=>{
    try{

        const token=ctx.request.body.token||ctx.header["access-token"];

        delToken(token);

        ctx.response.body={
            status:1,
            message:"del token success"
        }

    }catch(e){

        ctx.response.body={
            status:-1,
            message:e.message,
        }
    }
});

/*
* 查询用户
* */
router.get("/api/user",async(ctx,next)=>{

    try{

        const {value}=ctx.query;
        if(value.trim().length===0){
            ctx.response.body={
                status:-1,
                message:`value is required`,
            }
        }
        await queryUser(value).then(result=>{
            ctx.response.body={
                status:1,
                payload:result,
            }
        }).catch(e=>{
            ctx.response.body={
                status:-1,
                message:e.message,
            }
        })

    }catch(e){
        ctx.response.body={
            status:-1,
            message:e.message
        }
    }
});

/*
* 发送添加好友请求
* */
router.put("/api/user/friend-request",async(ctx,next)=>{

    try{
        const {userAccount}=ctx.state;
        const {targetAccount}=ctx.request.body;

        await sendMakeFriendsRequest(userAccount,targetAccount)
            .then(result=>{
                ctx.response.body={
                    status:1,
                    message:"send make friend request success"
                };
                pushNotification(targetAccount,{
                    type:"friend-request/req",
                    userAccount
                })
            }).catch(e=>{
                ctx.response.body={
                    status:-1,
                    message:e.message,
                }
            })

    }catch(e){
        ctx.response.body={
            status:-1,
            message:e.message,
        }
    }
});

/*
* 回复添加好友请求
* */
router.patch("/api/user/friend-request",async(ctx,next)=>{
    try{

        const {userAccount}=ctx.state;
        let {targetAccount,resCode}=ctx.request.body;

        resCode=parseInt(resCode);

        if(resCode!==1||resCode!==-1){
            ctx.response.body={
                status:-1,
                message:`resCode:${resCode} is not allowed`
            }
        }
        await resMakeFriendsRequest(userAccount,targetAccount,resCode)
            .then(result=>{
                if(resCode===1){
                    return becomeFriendsAndCreateChatRecords(userAccount,targetAccount);
                }else{
                    return false;
                }

            })
            .then(result=>{
                ctx.response.body={
                    status: 1,
                    message:`response make friend request success `,
                };

                pushNotification(targetAccount,{
                    type:"friend-request/res",
                    resCode,
                    userAccount,
                })

            }).catch(e=>{

                ctx.response.body={
                    status:-1,
                    message:e.message,
                }
            })

    }catch(e){
        ctx.response.body={
            status:-1,
            message:e.message,
        }
    }
});

/*
* 获得聊天记录
* */
router.get("/api/user/chat-record",async(ctx,next)=>{
   try{
       const {limit=15,skip=0,targetAccount}=ctx.query;
       const {userAccount}=ctx.state;

       await getChatRecords(userAccount,targetAccount,{limit,skip})
           .then(result=>{
               ctx.response.body={
                   status:1,
                   payload:result,
               }
           })
           .catch(e=>{
               ctx.response.body={
                   status:-1,
                   message:e.message
               }
           })
   }catch(e){
       ctx.response.body={
           status:-1,
           message:e.message,
       }
   }
});



export default router;