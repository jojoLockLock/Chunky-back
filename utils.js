/**
 * Created by JoJo on 2017/4/9.
 */


//args必须为数组
//判断args是否有null或者undefined
const isEmpty=(args)=>{

    if(args instanceof Array){
        return !Object.is(args.filter(arg=>Object.is(arg,undefined)||Object.is(arg,null)).length,0);
    }
};


module.exports={
    isEmpty
};