/**
 * Created by 13944 on 2017/6/24.
 */
import koaRouter from 'koa-router';

const router=koaRouter();



router.get('/',async (ctx,next)=>{
   ctx.response.body="hello world";
});

router.get("/test",async (ctx,next)=>{
   ctx.response.body=ctx.request.body;
});

export default router;