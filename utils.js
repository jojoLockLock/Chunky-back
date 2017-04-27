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

//检测函数参数是否为null或者underfined 且是否满足个数 并抛出异常
const checkArguments=(args)=>{

    if(isEmpty(Array.from(args))||(args.length<args.callee.length)){

        throw setError(`function ${args.callee.name} need ${args.callee.length} argument not allow undefined or null `,1);
    }
};

//创建一个Error对象
const setError=(message,code)=>{
    let error=new Error(message);
    error.code=code;
    return error;
};

module.exports={
    isEmpty,
    checkArguments,
    setError,
};