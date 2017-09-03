/**
 * Created by 13944 on 2017/6/14.
 */
import AuthModule from './AuthModule';
import httpServer from './HttpModule/httpServer';
import socketServer from './SocketModule/socketServer';
require('./DBModule/Start')

    .connect("mongodb://localhost:27017/ChunkyRemodel")

    .then(()=>{

        require("./DBModule/Operation");

        const app=httpServer();

        socketServer(app);

    }).catch(msg=>{

        console.info(`err:${msg}`)
});


