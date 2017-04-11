/**
 * Created by JoJo on 2017/4/11.
 */
const tempUser=[
    {
        "userId":1,
        "userName":"manno",
        "password":"iampiggy",
        "userKey":"123",
        "message":"登录成功",
        "addressList":[
            {
                "userId":2,
                "userName":"jojo"
            }
        ]
    },
    {
        "userId":2,
        "userName":"jojo",
        "userKey":"123",
        "password":"admin",
        "message":"登录成功",
        "addressList":[
            {
                "userId":1,
                "userName":"manno"
            }
        ]
    }

];

function verity(userName,userPassword) {
    let result={
        "responseCode":-1,
    };
    tempUser.forEach(u=>{
        if(u.userName==userName&&u.password==userPassword){
            result={
                "responseCode":1,
                "userData":Object.assign({},u,{
                    userPassword:null,
                })
            }
        }
    });
    return result;
}


module.exports={
    verity
};