/**
 * Created by 13944 on 2017/6/24.
 */
import operations from "../DBModule/Operation";
import {verifyToken} from '../AuthModule';
const {createChatRecordItemAndAddToChatRecords} = operations;

const getJsonMessage=(obj)=>{
    return JSON.stringify(obj);
};



const boardCastController=(send,message,mc)=>{
    const {to,content}=message.payload;
    const {connectionInfo,socketConnectList}=mc;
    const {userAccount}=connectionInfo;
    try{

        createChatRecordItemAndAddToChatRecords({
            from:userAccount,
            to:to,
            content:content,

        }).then(result=>{
            if(to in socketConnectList){
                socketConnectList[to].send(getJsonMessage({
                        payload:{
                            from:userAccount,
                            content
                        },
                        type:"boardCast",
                        status:1,
                }))
            }
        }).catch(e=>{
          send(getJsonMessage({
              payload:e.message,
              type:"boardCast",
              status:-1,
          }))
        })
    }catch(e){
        send(getJsonMessage({
            payload:e.message,
            type:"boardCast",
            status:-1,
        }))
    }
};



export default {

    boardCastController,
}