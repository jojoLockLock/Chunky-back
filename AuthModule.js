/**
 * Created by 13944 on 2017/6/18.
 */
import moment from 'moment';
import jwt from  'jwt-simple';
import {AppConfig,tokenExpiresHours} from './Config/AppConfig';


export const tokenList={};

export function getToken(userAccount) {

	const iss=`${userAccount}#${Math.random()}`;
	
	tokenList[userAccount]=iss;

    return jwt.encode({
        iss,
        exp:AppConfig.tokenExpires
    },AppConfig.secretKey);

}


export function verifyToken(token){

	const result=jwt.decode(token,AppConfig.secretKey);
	const userAccount=result.iss.split('#')[0];

	if(tokenList[userAccount]!==result.iss){
		throw new Error("token is not true");
	}
	if(result.exp<=new Date().getTime()){
		throw new Error("token is overdue");
	}
	return userAccount;

}

export function delToken(token) {

	const userAccount=verifyToken(token);

	delete tokenList[userAccount];

	return true;
}


