/**
 * Created by 13944 on 2017/6/18.
 */
import moment from 'moment'

export const AppConfig={
    secretKey:"secretKey",
    tokenExpires:moment().add("days",7).valueOf()
};


export const inviteCode="secret";