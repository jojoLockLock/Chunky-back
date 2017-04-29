/**
 * Created by jojo on 2017/4/27.
 */
const router=require('koa-router')();
let fs = require("fs");
let path = require('path');
const operation=require('../db/Operations');
const utils=require('../utils');
const {isEmpty} = utils;
const {loginVerify,getToken,getUserData,getUserAddressList,delToken,getChatRecord}=operation;
router.get('/', async (ctx, next) => {
    let path="/static/index.html";
    await getFile(path)
        .then(result=>{
            let type = path.substr(path.lastIndexOf(".")+1,path.length);
            ctx.set({
                "Content-Type":`text/${type};charset=UTF-8`
            });
            ctx.response.body=result;
        })
});
router.get('/routes/:name',async(ctx,next)=>{
    let path=ctx.url;

    await getFile("/static"+path)
        .then(result=>{
            let type = path.substr(path.lastIndexOf(".")+1,path.length);
            ctx.set({
                "Content-Type":`text/${type};charset=UTF-8`
            });
            ctx.response.body=result;
        })
});
router.get('/static/:name',async(ctx,next)=>{
    let path=ctx.url;

    await getFile(path)
        .then(result=>{
            let type = path.substr(path.lastIndexOf(".")+1,path.length);
            ctx.set({
                "Content-Type":`text/${type};charset=UTF-8`
            });
            ctx.response.body=result;
        })
});
function getFile(path){
    return new Promise((resolve,reject)=>{
        path = process.cwd()+path;
        console.info(path);
        fs.readFile(path,function(err,stdout,stderr){
            if(!err){

                //在这里设置文件类型，告诉浏览器解析方式
                resolve(stdout.toString())
            }else{
                reject(err);
            }

        })
    })
}

router.post('/api/login',async(ctx,next)=>{
    const body=ctx.request.body;
    const {userAccount,userPassword}=body;
    if(isEmpty([userAccount,userPassword])){
        ctx.response.body={
            status:-1,
            message:"please offer userAccount and userPassword"
        };
    }else{
        await loginVerify(userAccount,userPassword)
            .then(()=>{
                return Promise.all([getUserData(userAccount),
                    getUserAddressList(userAccount)]);
            })
            .then((result)=>{
                const userData=result[0];
                const addressList=result[1];
                ctx.response.body= {
                    message:"login success",
                    token:getToken(userAccount),
                    userData:{
                        userName:userData.userName
                    },
                    addressList,
                    status:1,
                }
            })
            .catch(err=>{
                ctx.response.body={
                    status:-1,
                    message:err.message
                };
        });
    }
});

router.post("/api/auth",async(ctx,next)=>{
   ctx.response.body={
       status:1,
       message:"auth success"
   }
});

router.post("/api/chatrecords",async(ctx,next)=>{
    const body=ctx.request.body;
    const {userAccount,targetAccount}=body;
    if(isEmpty([userAccount,targetAccount])){
        ctx.response.body={
            status:-1,
            message:"please offer userAccount token and targetAccount",
        }
    }else{
        await getChatRecord(userAccount,targetAccount)
            .then(result=>{
                ctx.response.body={
                    status:1,
                    message:"get chat records success",
                    chatRecords:result
                }
            })
            .catch(err=>{
                ctx.response.body={
                    status:-1,
                    message:err.message
                }
            })
    }
});
router.post("/api/chatrecords/all",async(ctx,next)=>{
    const body=ctx.request.body;
    const {userAccount}=body;
    if(isEmpty([userAccount])){
        ctx.response.body={
            status:-1,
            message:"please offer userAccount",
        }
    }else{
        let alAccount=[];
        await getUserAddressList(userAccount)
            .then(addressList=>{
                let promiseArr=[];
                addressList.forEach(item=>{
                    alAccount.push(item.userAccount);
                    promiseArr.push(getChatRecord(userAccount,item.userAccount));
                });
                return Promise.all(promiseArr);
            })
            .then(result=>{
                let chatRecords={};
                alAccount.forEach((account,index)=>{
                    chatRecords[account]=result[index];
                });
                ctx.response.body={
                    status:1,
                    message:"get chat records success",
                    chatRecords,
                }
            })
            .catch(err=>{
                ctx.response.body={
                    status:-1,
                    message:err.message
                }
            })
    }
});
router.post("/api/logout",async(ctx,next)=>{
    const body=ctx.request.body;
    const {userAccount}=body;
    delToken(userAccount);

    ctx.response.body={
        status:-1,
        message:"logout success"
    }
});
module.exports=router;