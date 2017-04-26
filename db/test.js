/**
 * Created by jojo on 2017/4/26.
 */
const Collections=require('./Collections');
const {User,ChatRecord,AddressList}=Collections;
const test=()=>{
    // let tester=new User({
    //     userAccount:"test",
    //     userPassword:"123456",
    //     userName:"tester"
    // });
    //
    // tester.save((err,tester)=>{
    //     if(err){
    //         console.info(err)
    //     }else{
    //         console.info(tester);
    //     }
    // })

    // let cr=new ChatRecord({
    //     userAccount:"tester",
    //     targetId:"xxxxxx",
    //     records:[
    //         {
    //             isReceiver:false,
    //             content:"hello"
    //         }
    //     ]
    //
    // });
    // cr.save((err,cr)=>{
    //     if(err){
    //         console.info(err);
    //     }else{
    //         console.info(cr)
    //     }
    // })

    ChatRecord.find({userAccount:"tester",targetId:"xxxxxx"},(err,crs)=>{
        if(err){
            console.info(err);
        }else{
            console.info(crs);
            ChatRecord.update({
                _id:crs[0]._id,
            },
                {$push:{records:{isReceiver:true,content:"world"}}},
            (err,res)=>{
                if(err){

                }else{
                    console.info(res);
                }
            })
        }
    })




};

module.exports={
  test
};