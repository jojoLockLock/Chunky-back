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
                firstTarget.addToFriendList(secondTarget._id),
                secondTarget.addToFriendList(firstTarget._id)
            ])
        }else{
            throw Error("add to friend list fail")
        }
    }).then(result=>{
        return result;
    })
}

becomeFriends("tester1",'tester2').catch(err=>{
    console.info(err.message,'xxx');
});

