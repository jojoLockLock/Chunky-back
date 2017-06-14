/**
 * Created by 13944 on 2017/6/14.
 */
const {User}=require("./Schema");

function createUser({userAccount="",userName="",userPassword=""}) {
    return new Promise((resolve,reject)=>{
        if(userAccount.trim()===""||userName.trim()===""||userPassword.trim()===""){
            reject(new Error(`function createUser arguments error`));
        }else{
            resolve(User.isExist(userAccount))
        }
    }).then((result)=>{
        if(result.isExist){
            throw new Error(`userAccount:${userAccount} is exist`)
        }else{
            const newUser=new User({
                userAccount,
                userName,
                userPassword,
            });
            return newUser.save();
        }
    }).then((result)=>{
        return {
            status:1,
            target:result
        }
    })
}

// createUser({userAccount:"123!!2222222222",userPassword:"123",userName:"123123"}).then((result)=>{
//
//
// });