/**
 * Created by jojo on 2017/4/27.
 */
const WebSocket = require('ws');

const WebSocketServer = WebSocket.Server;


module.exports={
    start:(server)=>{

        const wss = new WebSocketServer({
            server
        });
        wss.on('connection',function (ws) {
            console.log(`[SERVER] connection()`);
            console.info(ws.upgradeReq.headers);
            // console.info(parseUser(ws.upgradeReq));
            // console.info(ws.upgradeReq.headers);
            // console.info(ws.upgradeReq.url);
            ws.on('message', function (message) {
                console.log(`[SERVER] Received: ${message}`);
                ws.send(`ECHO: ${message}`, (err) => {
                    if (err) {
                        console.log(`[SERVER] error: ${err}`);
                    }
                });
            });

            ws.on('close',function () {
                console.info('close');
            });

            console.info('------------------');
            ws.close();
        });

    }
};
