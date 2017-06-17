/**
 * Created by 13944 on 2017/6/18.
 */
import moment from 'moment';
import jwt from  'jwt-simple';
import {AppConfig} from './Config/AppConfig';

const token=jwt.encode({
    iss:"123456",
    exp:AppConfig.tokenExpires
},AppConfig.secretKey);


console.info(token);


const result=jwt.decode(token,AppConfig.secretKey);

console.info(result);


export function getToken(userAccount,) {
    return jwt.encode({
        iss:`${userAccount}#${Math.getRandom()}`
    })
}