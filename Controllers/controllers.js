/**
 * Created by jojo on 2017/4/27.
 */
const router=require('koa-router')();

const operation=require('../db/Operations');
const utils=require('../utils');
const {isEmpty} = utils;
const {loginVerify}=operation;
router.post('/', async (ctx, next) => {

    ctx.response.body = `${JSON.stringify(ctx.request.body,null,4)}`;
},function () {
    console.info('yes');
});
router.get('/hello/:name',async(ctx,next)=>{
    let name=ctx.params.name;
    ctx.response.body=`<h1>Hello ,${name}</h1>`;
});

router.post('/api/login',async(ctx,next)=>{
    const body=ctx.request.body;
    const {userAccount,userPassword}=body;
    if(isEmpty([userAccount,userPassword])){
        ctx.response.body='fail .....';
    }else{

        return new Promise(function (resolve,reject) {
            loginVerify(userAccount,userPassword)
                .then(()=>{
                    ctx.response.body='success';
                    resolve();
                })
                .catch(err=>{
                    ctx.response.body=err;
                    reject();
                })
        })

    }
});


module.exports=router;