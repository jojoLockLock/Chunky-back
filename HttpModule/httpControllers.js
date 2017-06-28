/**
 * Created by 13944 on 2017/6/24.
 */
import koaRouter from 'koa-router';
import operations from "../DBModule/Operation";
import {getToken} from '../AuthModule';
const {userLogin}=operations;

const router=koaRouter();

router.get('/',async (ctx,next)=>{

   ctx.response.body="hello world";
   
});

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

export default router;