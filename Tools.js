/**
 * Created by 13944 on 2017/6/14.
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

const getJsonMessage=(obj)=>{
    return JSON.stringify(obj);
};

function getRandomNum(min,max)
{
    [min,max]=min>max?[max,min]:[min,max];
    let Range = max - min,
        Rand = Math.random();
    return(Min + Math.round(Rand * Range));
}
const  chars=['0','1','2','3','4','5','6'
,'7','8','9','A','B','C','D','E','F','G','H',
'I','J','K','L','M','N','O','P','Q','R','S','T',
'U','V','W','X','Y','Z'];
function getRandomString(length) {

}
module.exports={
    isEmpty,
    checkArguments,
    getError,
    getJsonMessage,
    getRandomNum,
};