/**
 * Created by jojo on 2017/4/26.
 */

const Collections=require('./Collections');
const {User,ChatRecord,AddressList,AddressListNotification}=Collections;
const utils=require('../utils');
const {isEmpty,checkArguments,getError}=utils;
const {errorType}=require("../config/ErrorConfig");
//创建角色
function createUser(userAccount,userPassword,userName){
    return new Promise((resolve,reject)=>{
        checkArguments(arguments);

        User.isExist(userAccount)
            //判断用户是否已经存在
            .then(result=>{
                if(result.isExist){
                    throw getError(`Create User failed, userAccount :${userAccount} have exist`,errorType.USER_EXIST);
                }else{
                    const newUser=new User({
                        userAccount,
                        userPassword,
                        userName,
                    });
                    return newUser.save();

                }
            })
            //创建新用户后成功后创建通讯录
            .then(user=>{
                return createAddressList(user)
            })
            //创建新的通讯录成功
            .then(()=>{
                resolve();
            })
            //抛出异常
            .catch(err=>{
                reject(err);
            });
    })
}


//创建通讯录
function createAddressList(user) {

    return new Promise((resolve,reject)=>{
        if(! (user instanceof  User)){
            throw getError(`function createAddressList arguments must instanceof User ${User}`);
        }
        const {userAccount}=user;
        AddressList.isExist(userAccount)
            //不存在则创建
            .then(result=>{
                if(result.isExist){
                    throw getError(`addressList from ${userAccount} have exist`,errorType.ADDRESS_LIST_EXIST);
                }else{
                    const newAddressList=new AddressList({
                        userAccount
                    });
                    return newAddressList.save()
                }
            })
            //创建的回调
            .then(addressList=>{
                resolve(addressList);
            })
            //抛出异常
            .catch(err=>{
                reject(err);
            })


    })
}

//加入通讯录
function addToAddressList(userAccount,targetAccount) {

    return new Promise((resolve,reject)=>{
        checkArguments(arguments);
        AddressList.isAccountExistInAddressList(userAccount,targetAccount)
            //判断目标是否已经在通讯录内
            .then(result=>{
                if(result.isExist){
                    throw getError(`targetAccount:${targetAccount} have exist in AddressList from userAccount ${userAccount}`,
                            errorType.ACCOUNT_EXIST_IN_ADDRESS_LIST)
                }else{
                    return User.isExist(targetAccount);
                }
            })
            //判断目标用户是否存在
            .then(result=>{
                if(result.isExist){
                    return AddressList.update({userAccount},{$push:{addressList:{targetAccount}}});
                }else{
                    throw getError(`targetAccount:${targetAccount} have not exist`,errorType.USER_NOT_EXIST);
                }
            })
            //加入成功
            .then(()=>{
                resolve();
            })
            .catch(err=>{
               reject(err);
            });
    })
}

//将双方相互加为好友
function addToAddressListTogether(before,after) {
    return new Promise((resolve,reject)=>{
        checkArguments(arguments);
        Promise.all([addToAddressList(before,after),addToAddressList(after,before)])
            //互加成功 创建聊天记录
            .then(()=>{
                return createChatRecord(before,after);
            })
            .then(()=>{
                resolve();
            })
            .catch((err)=>{
                reject(err);
            })
    })
}

//创建聊天记录
function createChatRecord(beforeAccount,afterAccount) {
    return new Promise((resolve,reject)=>{
        checkArguments(arguments);
        ChatRecord.isExist(beforeAccount,afterAccount)
            //判断聊天记录是否已经存在
            .then(result=>{
                if(result.isExist){
                    throw getError(`chatRecord between ${beforeAccount} and ${afterAccount} have exist`
                        ,errorType.CHAT_RECORD_EXIST)
                }else{
                    const newChatRecord=new ChatRecord({
                        beforeAccount,
                        afterAccount
                    });

                    return newChatRecord.save();
                }
            })
            //创建成功
            .then(()=>{
                resolve();
            })
            .catch(err=>{
                reject(err);
            })
    })
}

//添加到聊天记录
function addChatRecord(beforeAccount,afterAccount,senderAccount,content) {
    return new Promise((resolve,reject)=>{
        checkArguments(arguments);
        ChatRecord.isExist(beforeAccount,afterAccount)
            .then(result=>{
                if(result.isExist){
                    let _id=result.target._id;
                    return ChatRecord.update({_id},{$push:{records:{senderAccount,content,date:Date.now()}}})
                }else{
                    throw getError(`ChatRecord between ${beforeAccount} and ${afterAccount} have not exist`
                    ,errorType.CHAT_RECORD_NOT_EXIST);
                }
            })
            .then(()=>{
                resolve();
            })
            .catch(err=>{
                reject(err);
        })
    })
}


//获得聊天记录
function getChatRecord(beforeAccount,afterAccount) {
    return new Promise((resolve,reject)=>{
        checkArguments(arguments);
        ChatRecord.isExist(beforeAccount,afterAccount)
            .then(result=>{
                if(result.isExist){
                    return result.target;
                }else{
                    throw getError(`ChatRecord between ${beforeAccount} and ${afterAccount} have not exist`
                    ,errorType.CHAT_RECORD_NOT_EXIST);
                }
            })
            .then(chatRecord=>{
                const records=chatRecord.records.map(item=>{
                    const {senderAccount,date,content}=item;
                    return {
                        senderAccount,
                        content,
                        date:date.getTime()
                    }
                });
                resolve(records);
            })
            .catch(err=>{
                reject(err);
            })
    })
}

//登录
function loginVerify(userAccount,userPassword) {
    return new Promise((resolve,reject)=>{

        checkArguments(arguments);

        User.isExist(userAccount)
            .then(result=>{
                if(result.isExist){

                    return result.target.isVerify(userPassword);
                }else{
                    throw getError(`userAccount:${userAccount} have not exist`,errorType.USER_NOT_EXIST);
                }
            })
            .then(isVerify=>{
                if(isVerify){
                    resolve(isVerify);
                }else{
                    throw getError(`userPassword for ${userAccount} is wrong`,errorType.USER_PASSWORD_ERROR);
                }
            })
            .catch(err=>{
                reject(err);
            })
    })
}



//获得用户数据
function getUserData(userAccount) {
    return new Promise((resolve,reject)=>{
        checkArguments(arguments);
        User.isExist(userAccount)
            .then(result=>{
                if(result.isExist){
                    const user=result.target;
                    const {userName}=user;
                    resolve({
                        userName,
                        userAccount,
                    })
                }else{
                    throw getError(`userAccount:${userAccount} have not exist`
                    ,errorType.USER_NOT_EXIST);
                }
            })
            .catch(err=>{
                reject(err);
            })
    })
}
//获得用户好友列表
function getUserAddressList(userAccount) {
    return new Promise((resolve,reject)=>{
        checkArguments(arguments);
        AddressList.isExist(userAccount)
            .then(result=>{
                if(result.isExist){
                    return result.target.addressList;
                }else{
                    throw getError(`AddressList from userAccount:${userAccount} have not exist`
                    ,errorType.ADDRESS_LIST_NOT_EXIST);
                }
            })
            .then(addressList=>{
                let proArr=[];
                addressList.forEach(item=>{
                    proArr.push(getUserData(item.targetAccount));
                });
                return Promise.all(proArr);

            })
            .then(userDataList=>{
                resolve(userDataList);
            })
            .catch(err=>{
                reject(err);
            })
    })
}


//创建通讯录请求信息列表
function createAddressListNotification(userAccount) {
    return new Promise((resolve,reject)=>{
        checkArguments(arguments);
        AddressListNotification.isExist(userAccount)
        //判断通讯录请求信息列表是否已经存在
            .then(result=>{
                if(result.isExist){
                    throw getError(`AddressListNotification for ${userAccount} have exist`
                        ,errorType.ADDRESS_NOTIFICATION_EXIST)
                }else{
                    const newAddressListNotification=new AddressListNotification({
                        userAccount
                    });
                    return newAddressListNotification.save();
                }
            })
            //创建成功
            .then(()=>{
                resolve();
            })
            .catch(err=>{
                reject(err);
            })
    })
}

//添加到通讯录请求信息列表 userAccount为接受请求方 /targetAccount 为发起请求方
function addToAddressListNotification(userAccount,targetAccount) {
    return new Promise((resolve,reject)=>{
        checkArguments(arguments);
        AddressListNotification.isExist(userAccount)
            .then(result=>{
                if(result.isExist){
                    let target=result.target,
                        _id=target._id,
                        notifications=target.notifications,
                        flag=-1;
                    //查找是否已经发出过请求
                    notifications.some((n,i)=>{
                        if(n.targetAccount===targetAccount){
                            flag=i;
                            return true
                        }
                        return false;
                    });
                    //存在则不添加新的 将旧的请求resResult改为0 （未回复） /更新时间
                    if(flag!==-1){
                        notifications[flag].resResult=0;
                        notifications[flag].date=Date.now();
                        target.notifications=notifications;
                        return target.save();
                    }
                    return AddressListNotification.update({_id},{$push:{notifications:{targetAccount,date:Date.now()}}});
                }else{
                    throw getError(`AddressListNotification for ${userAccount} have not exist`
                        ,errorType.ADDRESS_NOTIFICATION_NOT_EXIST)
                }
            })
            .then((result)=>{
                resolve();
            })
            .catch(err=>{
                reject(err);
            })
    })
}

//修改 通讯录回复结果
function setAddressListNotificationResponse(userAccount,targetAccount,resResult) {
    return new Promise((resolve,reject)=>{
        checkArguments(arguments);
        // let notifications=[];
        AddressListNotification.isExist(userAccount)
        //判断通讯录请求信息列表是否已经存在
            .then(result=>{
                // console.info(result);
                if(result.isExist){
                    // let notifications=result.target.notifications;
                    let target=result.target,
                        _id=target._id,
                        notifications=target.notifications,
                        flag=-1;
                    //查找是否已经发出过请求
                    notifications.some((n,i)=>{
                        if(n.targetAccount===targetAccount){
                            flag=i;
                            return true
                        }
                        return false;
                    });
                    if(flag===-1){
                        throw getError(`AddressListNotification item for ${userAccount} with ${targetAccount} have not exist`
                            ,errorType.ADDRESS_NOTIFICATION_ITEM_NOT_EXIST);
                    }else{
                        notifications[flag].resResult=resResult;
                        // notifications[flag].date=Date.now();
                        target.notifications=notifications;
                        return target.save();
                    }
                }else{
                    throw getError(`AddressListNotification for ${userAccount} have not exist`
                        ,errorType.ADDRESS_NOTIFICATION_NOT_EXIST);
                }
            })
            //获取成功
            .then((result)=>{
                resolve()
            })
            .catch(err=>{
                reject(err);
            })
    })
}
//获取通讯录通知信息
function getAddressListNotification(userAccount) {
    return new Promise((resolve,reject)=>{
        checkArguments(arguments);
        let notifications=[];
        AddressListNotification.isExist(userAccount)
        //判断通讯录请求信息列表是否已经存在
            .then(result=>{
                if(result.isExist){
                    notifications=result.target.notifications;
                    return Promise.all(notifications.map(n=>{
                        const {targetAccount}=n;
                        return getUserData(targetAccount)

                    }));
                }else{
                    throw getError(`AddressListNotification for ${userAccount} have not exist`
                        ,errorType.ADDRESS_NOTIFICATION_NOT_EXIST);
                }
            })
            //获取成功
            .then((result)=>{
                resolve(result.map((u,i)=>{
                    const {userAccount,userName}=u;
                    const {date,resResult}=notifications[i];
                    return {
                        date:date.getTime(),
                        targetAccount:userAccount,
                        userName,
                        resResult
                    }
                }))
            })
            .catch(err=>{
                reject(err);
            })
    })
}

const {getToken,isVerifyToken,delToken}=User;
let isAccountExistInAddressList=AddressList.isAccountExistInAddressList.bind(AddressList);
module.exports={
    createUser,
    createAddressList,
    createChatRecord,
    addToAddressListTogether,
    getUserData,
    getUserAddressList,
    loginVerify,
    addChatRecord,
    getChatRecord,
    createAddressListNotification,
    addToAddressListNotification,
    getAddressListNotification,
    setAddressListNotificationResponse,
    getToken,
    isVerifyToken,
    delToken,
    isAccountExistInAddressList,
};
