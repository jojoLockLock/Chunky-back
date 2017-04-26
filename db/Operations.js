/**
 * Created by jojo on 2017/4/26.
 */

const Collections=require('./Collections');
const {User,ChatRecord,AddressList}=Collections;
const utils=require('../utils');
const {isEmpty,checkArguments}=utils;
//创建角色
function createUser(userAccount,userPassword,userName){
    return new Promise((resolve,reject)=>{
        checkArguments(arguments);

        User.isExist(userAccount)
            //判断用户是否已经存在
            .then(result=>{
                if(result.isExist){
                    throw new Error(`Create User failed, userAccount :${userAccount} have exist`);
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
            throw Error(`function createAddressList arguments must instanceof User ${User}`);
        }
        const {userAccount}=user;
        AddressList.isExist(userAccount)
            //不存在则创建
            .then(result=>{
                if(result.isExist){
                    throw new Error(`addressList from ${userAccount} have exist`);
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
                    throw new Error(`targetAccount:${targetAccount} have exist in AddressList from userAccount ${userAccount}`)
                }else{
                    return User.isExist(targetAccount);
                }
            })
            //判断目标用户是否存在
            .then(result=>{
                if(result.isExist){
                    return AddressList.update({userAccount},{$push:{addressList:{targetAccount}}});
                }else{
                    throw new Error(`targetAccount:${targetAccount} have not exist`);
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
                    throw new Error(`chatRecord between ${beforeAccount} and ${afterAccount} have  exist`)
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
                    return ChatRecord.update({_id},{$push:{records:{senderAccount,content}}})
                }else{
                    throw new Error(`ChatRecord between ${beforeAccount} and ${afterAccount} have not exist`);
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

// Promise.all([createUser("1","123","one"),createUser("2","123","two")])
//     .then(()=>{
//         return addToAddressListTogether("1","2")
//     })
//     .then(()=>{
//         console.info(`success`);
//     })
//     .catch(err=>{
//         console.info(err);
//     });

// addChatRecord("1","2","1","hello").then(()=>{
//     console.info('add success');
// }).catch((err)=>{
//     console.info(err);
// });


