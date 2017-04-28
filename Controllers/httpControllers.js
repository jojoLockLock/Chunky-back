/**
 * Created by jojo on 2017/4/27.
 */
const router=require('koa-router')();

const operation=require('../db/Operations');
const utils=require('../utils');
const {isEmpty} = utils;
const {loginVerify,getToken,getUserData,getUserAddressList,delToken}=operation;
router.get('/', async (ctx, next) => {
    ctx.response.body = `<h1>Hello World</h1>`;
});
router.get('/hello/:name',async(ctx,next)=>{
    let name=ctx.params.name;
    ctx.response.body=`<h1>Hello ,${name}</h1>`;
});

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