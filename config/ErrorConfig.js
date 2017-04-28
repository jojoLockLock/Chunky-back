const ARGUMENTS_ERROR=Symbol("ARGUMENTS_ERROR");

const USER_PASSWORD_ERROR=Symbol("USER_PASSWORD_ERROR");
const USER_NOT_EXIST=Symbol("USER_NOT_EXIST");
const USER_EXIST=Symbol("USER_EXIST");

const ADDRESS_LIST_NOT_EXIST=Symbol("ADDRESS_LIST_NOT_EXIST");
const ADDRESS_LIST_EXIST=Symbol("ADDRESS_LIST_EXIST");
const ACCOUNT_EXIST_IN_ADDRESS_LIST=Symbol("ACCOUNT_EXIST_IN_ADDRESS_LIST");

const CHAT_RECORD_NOT_EXIST=Symbol("CHAT_RECORD_NOT_EXIST");
const CHAT_RECORD_EXIST=Symbol("CHAT_RECORD_EXIST");

const errorMessage={
    [ARGUMENTS_ERROR]:"参数错误"
};
const errorType={
    ARGUMENTS_ERROR,
    USER_PASSWORD_ERROR,
    USER_NOT_EXIST,
    USER_EXIST,
    ADDRESS_LIST_NOT_EXIST,
    ADDRESS_LIST_EXIST,
    ACCOUNT_EXIST_IN_ADDRESS_LIST,
    CHAT_RECORD_NOT_EXIST,
    CHAT_RECORD_EXIST,
};
module.exports={
    errorMessage,
    errorType,
};

