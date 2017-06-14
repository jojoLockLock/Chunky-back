/**
 * Created by 13944 on 2017/6/14.
 */

const mongoose=require("mongoose");
const Schema=mongoose.Schema;


const userSchema=new Schema({
    userAccount:{type:String,required:'{PATH} is required!'},
    userName:{type:String,required:'{PATH} is required!'},
    userPassword:{type:String,required:'{PATH} is required!'},
    registerDate:{type:Date,default:Date.now,required:'{PATH} is required!'},
    icon:{type:String,default:""},
    status:{type:Number,default:0},
    isFreeze:{type:Boolean,default:false},
    friends:[
        {
            //好友的_id
            type:Schema.ObjectId,
            required:'{PATH} is required!'
        }
    ],
    friendsNotifications:[
        {
            //发送该消息的用户的_id
            userId:{type:Schema.ObjectId,required:'{PATH} is required!'},
            //通知消息最后更新时间
            activeDate:{type:Date,default:Date.now,required:'{PATH} is required!'},
            //消息状态 0 表示未回复 1表示接受 -1表示拒绝
            resCode:{type:Number,default:0,required:'{PATH} is required!'}
        }
    ]
});

userSchema.statics.isExist=function (userAccount="") {
    return new Promise((resolve,reject)=>{
        userAccount=userAccount.toLowerCase();
        this.findOne({userAccount},(err,user)=>{
            if(err){
                reject(err);
            }else{
                resolve({isExist:user!==null,target:user});
            }
        })
    })
};

userSchema.methods.getLoginData=function () {
  return {
      userName:this.userName,
      addressList:this.addressList,
      addressListNotifications:this.addressListNotifications
  }
};
const chatRecordItemSchema=new Schema({
    from:{type:String,required:'{PATH} is required!'},
    to:{type:String,required:'{PATH} is required!'},
    activeDate:{type:Date,default:Date.now,required:'{PATH} is required!'},
    content:{type:String,required:'{PATH} is required!'}
});
const chatRecordSchema=new Schema({
    owner:{type:String,required:'{PATH} is required!'},
    records:[chatRecordItemSchema]
});

const User=mongoose.model("User",userSchema);

const ChatRecord=mongoose.model("ChatRecord",chatRecordSchema);
const ChatRecordItem=mongoose.model("ChatRecordItem",chatRecordItemSchema);

c.save((err,result)=>{
    console.info(err);
    console.info(result);
});

module.exports={
  User
};
// for(let i=10;i<=10;++i){
//     const newUser=new User({
//         userAccount:"123_"+i,
//         userPassword:"123123_"+i,
//         userName:"xxxxx_"+i,
//     });
//     newUser.save((err,result)=>{
//         console.info(err);
//         console.info(result)
//     });
// }
// User.find({}).sort({registerDate:-1}).count().exec((err,result)=>{
//     console.info(err)
//     console.info(result);
// })
// User.count({},(err,result)=>{
//     console.info(err)
//     console.info(result);
// })
// User.isExist("123222222222").then((result)=>{
//     console.info(result)
// }).catch(err=>{
//     console.info(err);
// });