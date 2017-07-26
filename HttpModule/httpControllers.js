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
    createUser,
    getNotificationsByUserAccount,
    getUserPublicData,
    modifyPassword,
    setUserInfo,
    getUserLoginData,
}=operations;

const router=koaRouter();

router.get('/',async (ctx,next)=>{

   return ctx.response.body="hello world";
   
});

router.get("/test",async(ctx,next)=>{
    let basicAuth=ctx.header["authorization"].split(" ")[1];

    let b = new Buffer(basicAuth, 'base64');

    return ctx.response.body=b.toString();
});

/*
* 验证token正确性
* */
router.post("/api/auth",async(ctx,next)=>{

    return ctx.response.body={
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

              return ctx.response.body={
                  status:1,
                  payload:{
                      data:result,
                      token:getToken(userAccount)
                  }
              }

           }).catch(e=>{

               return ctx.response.body={
                   status:-1,
                   message:e.message,
               }

           });

   }catch(e){

      return ctx.response.body={
          status:-1,
          message:e.message,
      }
   }
});
/*
* 获得个人用户数据
* */
router.get("/api/user/basic",async(ctx,next)=>{
    try{
        const {userAccount}=ctx.state;
        await getUserLoginData(userAccount)
            .then(result=>{

                return ctx.response.body={
                    status:1,
                    payload:{
                        data:result,
                    }
                }

            }).catch(e=>{

                return ctx.response.body={
                    status:-1,
                    message:e.message,
                }

            });

    }catch(e){

        return ctx.response.body={
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

        return ctx.response.body={
            status:1,
            message:"del token success"
        }

    }catch(e){

        return ctx.response.body={
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
            return ctx.response.body={
                status:-1,
                message:`value is required`,
            }
        }
        await queryUser(value).then(result=>{
            return ctx.response.body={
                status:1,
                payload:result,
            }
        }).catch(e=>{
            return ctx.response.body={
                status:-1,
                message:e.message,
            }
        })

    }catch(e){
        return ctx.response.body={
            status:-1,
            message:e.message
        }
    }
});

/*
 * 注册用户
 * */
router.post("/api/user",async(ctx,next)=>{

    try{

        const {userAccount,userPassword,userName,inviteCode}=ctx.request.body;

        if(inviteCode!=="123456"){
            return ctx.response.body={
                status:-1,
                message:`invite code error`,
            }
        }

        if(userAccount.trim().length===0||userPassword.trim().length===0||userName.trim().length===0){
            return ctx.response.body={
                status:-1,
                message:`data can not allow null`,
            }
        }
        await createUser({userAccount,userPassword,userName}).then(result=>{
            return ctx.response.body={
                status:1,
                message:"register success",
            }
        }).catch(e=>{
            return ctx.response.body={
                status:-1,
                message:e.message,
            }
        })

    }catch(e){
        return ctx.response.body={
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

                pushNotification(targetAccount,{
                    type:"friend-request/req",
                    userAccount
                })

                return ctx.response.body={
                    status:1,
                    message:"send make friend request success"
                };

            }).catch(e=>{
                return ctx.response.body={
                    status:-1,
                    message:e.message,
                }
            })

    }catch(e){
        return ctx.response.body={
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

        if(resCode!==1&&resCode!==-1){
            return ctx.response.body={
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
                return ctx.response.body={
                    status: 1,
                    message:`response make friend request success `,
                };

                pushNotification(targetAccount,{
                    type:"friend-request/res",
                    resCode,
                    userAccount,
                })

            }).catch(e=>{

                return ctx.response.body={
                    status:-1,
                    message:e.message,
                }
            })

    }catch(e){
        return ctx.response.body={
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
               return ctx.response.body={
                   status:1,
                   payload:result,
               }
           })
           .catch(e=>{
               return ctx.response.body={
                   status:-1,
                   message:e.message
               }
           })
   }catch(e){
       return ctx.response.body={
           status:-1,
           message:e.message,
       }
   }
});


/*
 * 获得多人的聊天记录
 * */
router.get("/api/user/chat-records",async(ctx,next)=>{
    try{
        const {limit=15,skip=0,targetAccount}=ctx.query;
        const {userAccount}=ctx.state;

        const targets=targetAccount.split(",")

        await Promise.all(targets.map(t=>{
                return getChatRecords(userAccount,t,{limit,skip})
            }))
            .then(result=>{

                const payload={};

                result.forEach((r,index)=>{
                    payload[targets[index]]=r;
                })

                return ctx.response.body={
                    status:1,
                    payload,
                }
            })
            .catch(e=>{
                return ctx.response.body={
                    status:-1,
                    message:e.message
                }
            })
    }catch(e){
        return ctx.response.body={
            status:-1,
            message:e.message,
        }
    }
});


/*
 * 获得好友相关通知
 * */
router.get("/api/notifications/friend-request",async(ctx,next)=>{
    try{
        const {limit=15,skip=0}=ctx.query;
        const {userAccount}=ctx.state;
        let notifications=null;
        await getNotificationsByUserAccount(userAccount,{limit,skip})
            .then(result=>{

                notifications=result;

                return Promise.all(result.data.map(i=>{
                    return getUserPublicData(i.userAccount)
                }))


            })
            .then(result=>{
                notifications.data.forEach((i,index)=>{
                    i.data=result[index];
                })

                return ctx.response.body={
                    status:1,
                    payload:notifications,
                }

            })
            .catch(e=>{
                return ctx.response.body={
                    status:-1,
                    message:e.message
                }
            })
    }catch(e){
        return ctx.response.body={
            status:-1,
            message:e.message,
        }
    }
});


/*
 * 修改用户信息
 * */
router.patch("/api/user",async(ctx,next)=>{
    try{
        let {userName="",icon=""}=ctx.request.body;
        const {userAccount}=ctx.state;

        if(userName.trim().length===0||icon.trim().length===0){
            return ctx.response.body={
                status:-1,
                message:"filed are not full"
            }

        }


        await setUserInfo(userAccount,{userName,icon})
            .then(result=>{

                return ctx.response.body={
                    status:1,
                    message:"patch success"
                }


            })
            .catch(e=>{
                return ctx.response.body={
                    status:-1,
                    message:e.message
                }
            })
    }catch(e){
        return ctx.response.body={
            status:-1,
            message:e.message,
        }
    }
});


/*
 * 修改用户密码
 * */
router.patch("/api/user/password",async(ctx,next)=>{
    try{
        let {oldPassword,newPassword}=ctx.request.body;
        const {userAccount}=ctx.state;

        if(oldPassword.trim().length===0||newPassword.trim().length===0){
            return ctx.response.body={
                status:-1,
                message:"filed are not full"
            }

        }


        await modifyPassword(userAccount,oldPassword,newPassword)
            .then(result=>{

                return ctx.response.body={
                    status:1,
                    message:"patch success"
                }


            })
            .catch(e=>{
                return ctx.response.body={
                    status:-1,
                    message:e.message
                }
            })
    }catch(e){
        return ctx.response.body={
            status:-1,
            message:e.message,
        }
    }
});


export default router;