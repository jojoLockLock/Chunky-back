/**
 * Created by 13944 on 2017/6/14.
 */
const {User,ChatRecordItem,ChatRecord}=require("./Schema");
//
function createUser({userAccount="",userName="",userPassword=""}) {
    return new Promise((resolve,reject)=>{
        userAccount=userAccount.toLowerCase();
        if(userAccount.trim()===""||userName.trim()===""||userPassword.trim()===""){
            throw new Error(`function createUser arguments error`);
        }else{
            resolve(User.isExist(userAccount))
        }
    }).then((result)=>{
        if(result.isExist){
            throw new Error(`userAccount:${userAccount} is exist`)
        }else{
            return new User({
                userAccount,
                userName,
                userPassword,
            }).save();
        }
    }).then((result)=>{
        return {
            status:1,
            target:result
        }
    })
}
//
function queryUser(value,options) {
    return User.queryUser(value,options)
}
//
function becomeFriends(firstUserAccount,secondUserAccount) {
    return Promise.all([
        User.isExist(firstUserAccount),
        User.isExist(secondUserAccount)
    ]).then((result)=>{

        const [firstResult,secondResult]=result;

        if(firstResult.isExist&&secondResult.isExist){
            const firstTarget=firstResult.target;
            const secondTarget=secondResult.target;
            return Promise.all([
                firstTarget.addToFriendList(secondUserAccount),
                secondTarget.addToFriendList(firstUserAccount)
            ])
        }else{
            throw Error("add to friend list fail")
        }
    }).then(result=>{
        return result;
    })
}
//


function createChatRecords(firstUserAccount,secondUserAccount) {
    return ChatRecord.isExist(firstUserAccount,secondUserAccount)
        .then((result)=>{
            if(result.isExist===false){
                return new ChatRecord({
                    owner:`${firstUserAccount}#${secondUserAccount}`
                }).save();
            }else{
                throw new Error(`chat records is exist between ${firstUserAccount} and ${secondUserAccount}`)
            }
        }).then((result)=>{
            return {
                status:1,
                target:result
            }
        })
}
//
function becomeFriendsAndCreateChatRecords(firstUserAccount,secondUserAccount) {
    return becomeFriends(firstUserAccount,secondUserAccount)
        .then(()=>{
            createChatRecords(firstUserAccount,secondUserAccount)
    })
}
//
function createChatRecordItem({from,to,content}) {
    return new ChatRecordItem({
        from,
        to,
        content
    });
}
//
function addChatRecordItems(firstUserAccount,secondUserAccount,items) {
    return ChatRecord.isExist(firstUserAccount,secondUserAccount)
        .then(result=>{
            if(result.isExist){
                result.target.records.push(...items);
                return result.target.save();
            }else{
                throw new Error(`chat records is not exist between ${firstUserAccount} and ${secondUserAccount}`)
            }
        }).then((result)=>{
            return {
                status:1,
                target:result,
            }
    }   )
}
//
function createChatRecordItemAndAddToChatRecords({from,to,content}) {
    return addChatRecordItems(from,to,[createChatRecordItem({from,to,content})])
        .then(result=>{
            return increaseUnreadMessagesCount(to,from)
        })
}


// createChatRecordItemAndAddToChatRecords({from:"tester1",to:"tester2",content:"fucking test"});
//
function sendMakeFriendsRequest(userAccount,targetAccount) {
    return Promise.all([
        User.isExist(targetAccount),
        User.isExist(userAccount)
    ]).then(result=>{
        if(result[0].isExist&&result[1].isExist){
            return result[0].target.addFriendNotifications(userAccount)
        }else{
            throw new Error(`${targetAccount} or ${userAccount} is not exist`);
        }
    }).then(result=>{
        return {
            status:1,
            target:result,
        }
    })
}
//
function resMakeFriendsRequest(userAccount,targetAccount,resCode=-1) {
    return User.isExist(userAccount)
        .then(result=>{
            if(result.isExist){
                return result.target.updateFriendNotifications(targetAccount,resCode)
            }else{
                throw new Error(`${userAccount} is not exist`);
            }
        })
}

//
function getUserPublicData(userAccount) {
    return User.isExist(userAccount)
        .then(result=>{
            if(result.isExist){
                return result.target.getPublicData();
            }else{
                throw new Error(`userAccount:${userAccount} is not exist`);
            }
        })
}
//
function getUserLoginData(userAccount) {
    let userData=null,
        target=null;
    return User.isExist(userAccount)
        .then(result=>{

            if(result.isExist){
                target=result.target;
                return target.getLoginData();
            }else{
                throw new Error(`userAccount:${userAccount} is not exist`);
            }

        }).then(result=>{

            userData=result;
            return Promise.all(result.friendList.map(f=>getUserPublicData(f)));

        }).then(result=>{

            userData.friendList=result;
            userData.unreadMessagesCount=target.getUnreadMessagesCount();
            return userData;
        })
}
//
function userLogin(userAccount,userPassword) {
    return User.isExist(userAccount)
        .then(result=>{
            if(result.isExist){
                return result.target.verifyPassword(userPassword);
            }else{
                throw new Error(`userAccount:${userAccount} is not exist`);
            }
        }).then(result=>{
            if(result){
                return getUserLoginData(userAccount);
            }else{
                throw new Error(`password is error`);
            }
    })
}
//
function getChatRecords(firstUserAccount,secondUserAccount,options={limit:15,skip:0}) {
    return ChatRecord.isExist(firstUserAccount,secondUserAccount)
        .then(result=>{
            if(result.isExist){
                return result.target.getChatRecordsData(options)
            }else{
                throw new Error(`chat records between:${firstUserAccount} and ${secondUserAccount} is not exist`);
            }
        })
}

/*
*
* */
function getChatRecordsById(firstUserAccount,secondUserAccount,options={limit:15}) {
    return ChatRecord.isExist(firstUserAccount,secondUserAccount)
        .then(result=>{
            if(result.isExist){
                return result.target.getChatRecordsById(options);
            }else{
                throw new Error(`chat records between:${firstUserAccount} and ${secondUserAccount} is not exist`);
            }
        })
}



function getNotificationsByUserAccount(userAccount,options) {
    return User.isExist(userAccount)
        .then(result=>{
            if(result.isExist){
                return result.target.getFriendNotifications(options);
            }else{
                throw new Error(`user:${userAccount} is not exist`);
            }
        })
}

function setUserBasicInfo(userAccount,{userName,icon}={}) {
    if(userName.trim().length===0||icon.trim().length===0){
        throw new Error("fields are not full");
    }
    return User.isExist(userAccount)
        .then(result=>{
            if(result.isExist){
                return result.target.setBasicInfo({userName,icon});
            }
        })
}

function modifyUserPassword(userAccount,oldPassword,newPassword) {
    if(oldPassword.trim().length===0||newPassword.trim().length===0){
        throw new Error("fields are not full");
    }
    return User.isExist(userAccount)
        .then(result=>{
            if(result.isExist){
                return result.target.modifyPassword(oldPassword,newPassword);
            }
        })
}



function increaseUnreadMessagesCount(userAccount,targetAccount) {
    return User.isExist(userAccount)
        .then(result=>{
            if(result.isExist){
                return result.target.increaseUnreadMessagesCount(targetAccount)
            }else{
                throw new Error(`userAccount:${userAccount} is not exist`);
            }
        })

}

function initUnreadMessagesCount(userAccount,targetAccount) {
    return User.isExist(userAccount)
        .then(result=>{
            if(result.isExist){
                return result.target.initUnreadMessagesCount(targetAccount)
            }else{
                throw new Error(`userAccount:${userAccount} is not exist`);
            }
        })
}



function findUserByAccount(userAccount) {
    return User.findUserByAccount(userAccount)
}

export default {
    createUser,
    becomeFriendsAndCreateChatRecords,
    createChatRecordItemAndAddToChatRecords,
    queryUser,
    sendMakeFriendsRequest,
    resMakeFriendsRequest,
    userLogin,
    getChatRecords,
    getNotificationsByUserAccount,
    getUserPublicData,
    setUserBasicInfo,
    modifyUserPassword,
    getUserLoginData,
    initUnreadMessagesCount,
    getChatRecordsById,
    findUserByAccount,
    // increaseUnreadMessagesCount,
}