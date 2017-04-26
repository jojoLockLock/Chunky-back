/**
 * Created by jojo on 2017/4/26.
 */

const Collections=require('./Collections');
const {User,ChatRecord,AddressList}=Collections;
const utils=require('../utils');
const {isEmpty}=utils;
//创建角色
function createUser(userAccount,userPassword,userName){
    if(isEmpty(Array.from(arguments))){
        throw Error("function createUser need 3 argument not allow undefined or null ")
    }
    return new Promise((resolve,reject)=>{
        User.isExist(userAccount).then((user)=>{
            reject(`userAccount :${userAccount} have exist`);
        },(msg)=>{
            const newUser=new User({
                userAccount,
                userPassword,
                userName,
            });
            newUser.save((err,newUser)=>{
                if(err){
                    throw Error(err);
                }else{
                    createAddressList(newUser).then(()=>{
                        resolve(newUser);
                    },(err)=>{
                        reject(err);
                    });
                }
            });
        });
    })
}

//创建通讯录
function createAddressList(user) {
    if(! (user instanceof  User)){
        throw Error(`function createAddressList arguments must instanceof User ${User}`);
    }
    return new Promise((resolve,reject)=>{
            const {userAccount}=user;
            //若不存在则创建
            AddressList.isExist(userAccount).then((al)=>{
                reject(`addressList from ${userAccount} have exist`);
            },(msg)=>{
                const newAddressList=new AddressList({
                    userAccount
                });
                newAddressList.save((err,newAddressList)=>{
                    if(err){
                        reject(err);
                    }else{
                        resolve(newAddressList);
                    }
                })
            })

    })
}
//加入通讯录
function addToAddressList(userAccount,targetAccount) {
    if(isEmpty([userAccount,targetAccount])){
        throw Error(`function addToAddressList need 2 argument not allow undefined or null`)
    }
    return new Promise((resolve,reject)=>{
        AddressList.isExist(userAccount).then(
            (al)=>{

                User.isExist(targetAccount).then(
                    (u)=>{
                        AddressList.isAccountExistInAddressList(userAccount,targetAccount).then(
                            (msg)=>{
                                reject(msg);
                            },
                            (msg)=>{
                                AddressList.update({userAccount},
                                    {$push:{addressList:{targetAccount}}},
                                    (err,res)=>{
                                        if(err){
                                            throw err;
                                        }else{
                                            resolve(`add success`);
                                        }

                                    })
                            }
                        )
                    },
                    (msg)=>{
                        reject(msg);
                    })
            },
            (msg)=>{
                reject(msg);
            })
    })
}
//将双方相互加为好友
function addToAddressListTogether(before,after) {
    if(isEmpty([before,after])){
        throw Error (`function addToAddressListTogether need 2 argument not allow undefined or null`)
    }
    return new Promise((resolve,reject)=>{
        addToAddressList(before,after).then(
            ()=>{
                addToAddressList(after,before).then(
                    ()=>{
                        resolve(`${before} and ${after} add addressList success`);
                        createChatRecord(before,after).then(()=>{
                            console.info('success');
                        },()=>{
                            console.info(`error`)
                        });
                    },
                    (err)=>{
                        reject(err)
                    }
                )
            },
            (err)=>{
                reject(err)
            }
            )
    })
}
//创建聊天记录
function createChatRecord(beforeAccount,afterAccount) {
    if(isEmpty([beforeAccount,afterAccount])){
        throw Error (`function createChatRecord need 2 argument not allow undefined or null`)
    }
    return new Promise((resolve,reject)=>{
        ChatRecord.isExist(beforeAccount,afterAccount).then(
            (cr)=>{
                reject(`chatRecord between ${beforeAccount} and ${afterAccount} have  exist`)
            },
            (msg)=>{
                const newChatRecord=new ChatRecord({
                    beforeAccount,
                    afterAccount,
                });

                newChatRecord.save((err,cr)=>{
                    if(err){
                        reject(err);
                    }else{
                        resolve(cr);
                    }

                })
            }
        )
    })
}
// createChatRecord("1","2").then((cr)=>{
//     console.info(cr);
// },(err)=>{
//     console.info(err);
// })
// createUser('2','1','one').then((u)=>{
//     console.info(u)
// },(err)=>{
//     console.info(err)
// })
// createUser('1','1','one').then((u)=>{
//     console.info(u)
// },(err)=>{
//     console.info(err)
// })
// addToAddressListTogether('1','2').then((user)=>{
//     console.info(user);
// },(err)=>{
//     console.info(err);
// });



