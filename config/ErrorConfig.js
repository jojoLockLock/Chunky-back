/**
 * Created by 13944 on 2017/6/14.
 */
const ARGUMENTS_ERROR=Symbol("ARGUMENTS_ERROR");

const USER_PASSWORD_ERROR=Symbol("USER_PASSWORD_ERROR");
const USER_NOT_EXIST=Symbol("USER_NOT_EXIST");
const USER_EXIST=Symbol("USER_EXIST");




const errorMessage={
    [ARGUMENTS_ERROR]:"参数错误"
};
const errorType={
    ARGUMENTS_ERROR,
    USER_PASSWORD_ERROR,
    USER_NOT_EXIST,
    USER_EXIST
};
module.exports={
    errorMessage,
    errorType,
};