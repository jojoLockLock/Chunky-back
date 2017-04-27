/**
 * Created by JoJo on 2017/4/9.
 */
const ErrorConfig=require('./config/ErrorConfig');
const {errorType}=ErrorConfig;
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

        throw getError(`function ${args.callee.name} need ${args.callee.length} argument not allow undefined or null `
            ,errorType.ARGUMENTS_ERROR);
    }
};

//创建一个Error对象
const getError=(message,type)=>{
    let error=new Error(message);
    error.tpye=type;
    return error;
};

module.exports={
    isEmpty,
    checkArguments,
    getError,
};