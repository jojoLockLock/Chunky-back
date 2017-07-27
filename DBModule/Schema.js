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
    friendList:[
        {type:String, required:'{PATH} is required!'}
    ],
    friendsNotifications:[
        {
            //发送该消息的用户的账号
            userAccount:{type:String,required:'{PATH} is required!'},
            //通知消息最后更新时间
            activeDate:{type:Date,default:Date.now,required:'{PATH} is required!'},
            //消息状态 0 表示未回复 1表示接受 -1表示拒绝
            resCode:{type:Number,default:0,required:'{PATH} is required!'}
        }
    ]
});

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

userSchema.statics.isExist=function (userAccount="") {
    return new Promise((resolve,reject)=>{
        // userAccount=userAccount.toLowerCase();
        this.findOne({userAccount},(err,user)=>{
            if(err){
                reject(err);
            }else{
                resolve({isExist:user!==null,target:user});
            }
        })
    })
};

userSchema.statics.queryUser=function (value,options={}) {
    return new Promise((resolve,reject)=>{
        this.find({$or:[
            {userAccount:{$regex:new RegExp(value)}},
            {userName:{$regex:new RegExp(value)}}
        ]},
            null,
            options
        ,(err,users)=>{
            console.info(err);
            if(err){
                reject(err)
            }else{
                resolve(users.map(u=>u.getPublicData()));
            }
        })
    })
};

userSchema.methods.getLoginData=function () {
  return {
      userName:this.userName,
      _id:this._id,
      friendList:this.friendList,
      icon:this.icon,
  }
};

userSchema.methods.verifyPassword=function (userPassword) {
    return this.userPassword===userPassword;
};

userSchema.methods.addToFriendList=function (userAccount) {




    return new Promise((resolve,reject)=>{
        if(this.friendList.some(i=>i===userAccount)){
            resolve()
        }else{
            this.friendList.push(userAccount);
            this.save((err,result)=>{
                if(err){
                    reject(err);
                }else{
                    resolve(result);
                }
            })
        }

    })
};

userSchema.methods.setBasicInfo=function ({icon,userName}) {
    return new Promise((resolve,reject)=>{
        if(icon.trim().length===0||userName.trim().length===0){
            return reject(new Error("field are not full"))
        }

        this.userName=userName;
        this.icon=icon;

        this.save((err,result)=>{
            err?reject(err):resolve(result);
        })


    })
}

userSchema.methods.modifyPassword=function (oldPassword,newPassword) {
    return new Promise((resolve,reject)=>{
        if(oldPassword.trim().length===0||newPassword.trim().length===0){
            return reject(new Error("field are not full"))
        }
        if(!this.verifyPassword(oldPassword)){
            return reject(new Error(`password for ${this.userAccount} is wrong`));
        }

        this.userPassword=newPassword;

        this.save((err,result)=>{
            err?reject(err):resolve(result);
        })


    })
}

userSchema.methods.getPublicData=function () {
  return {
      userAccount:this.userAccount,
      userName:this.userName,
      icon:this.icon,
  }
};

userSchema.methods.addFriendNotifications=function (userAccount) {
    return new Promise((resolve,reject)=>{
        if(userAccount===this.userAccount){
            throw new Error('can not add self to friendList');
        }
        if(this.friendList.some(i=>i===userAccount)){
            throw new Error(`${userAccount} has exist in friend list form ${this.userAccount}`);
        }
        this.friendsNotifications=[
            ...this.friendsNotifications.filter(i=>i.userAccount!==userAccount)
        ,{userAccount}];

        this.save((err,result)=>{
            if(err){
                reject(err)
            }else{
                resolve(result);
            }
        })
    })
};

userSchema.methods.updateFriendNotifications=function (userAccount,resCode) {
    return new Promise((resolve,reject)=>{
        if(!this.friendsNotifications.some(i=>i.userAccount===userAccount)){
            throw new Error(`friend notifications can not found from ${userAccount}`);
        }else{
            this.friendsNotifications=[
                ...this.friendsNotifications.filter(i=>i.userAccount!==userAccount)
                ,{userAccount,resCode}];
            this.save((err,result)=>{
                if(err){
                    reject(err)
                }else{
                    resolve(result);
                }
            })
        }

    })
};

userSchema.methods.getFriendNotifications=function ({limit=15,skip=0}={}) {

    let length=this.friendsNotifications.length,
        end=length-skip,
        start=end-limit;
        start=start<0?0:start;

        return {
            total:length,
            data:this.friendsNotifications.slice(start,end).map(i=>{
                const {userAccount,activeDate,resCode,_id}=i;

                return {
                    userAccount,
                    activeDate:activeDate.getTime(),
                    resCode,
                    _id,
                }

            })
        }
}

chatRecordSchema.statics.isExist=function(firstUserAccount,secondUserAccount) {
    return new Promise((resolve,reject)=>{
        this.findOne({
                owner:{
                    $in:
                        [`${firstUserAccount}#${secondUserAccount}`,
                            `${secondUserAccount}#${firstUserAccount}`]
                }},
            (err,chatRecords)=>{
                if(err){
                    reject(err)
                }else{
                    resolve({isExist:chatRecords!==null,target:chatRecords});
                }
            })
    })
};
//获取过去的聊天记录 limit为获得的条数 skip为开始查询的位置
chatRecordSchema.methods.getChatRecordsData=function({limit=15,skip=0}={}) {
    
    let length=this.records.length,
        end=length-skip,
        start=end-limit;
        start=start<0?0:start;

        return {
        total:length,
        data:this.records.slice(start,end).map(i=>{
            const {from,to,activeDate,content,_id}=i;
            return {
                from,
                to,
                content,
                _id,
                activeDate:activeDate.getTime()
            };
        })
    }
};
const User=mongoose.model("User",userSchema);
const ChatRecord=mongoose.model("ChatRecord",chatRecordSchema);
const ChatRecordItem=mongoose.model("ChatRecordItem",chatRecordItemSchema);


module.exports={
    User,
    ChatRecord,
    ChatRecordItem
};
