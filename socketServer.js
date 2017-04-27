/**
 * Created by jojo on 2017/4/27.
 */
const WebSocket = require('ws');

const WebSocketServer = WebSocket.Server;

const server=require('./koaServer');

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

function parseUser(obj) {
    if (!obj) {
        return;
    }
    console.log('try parse: ' + obj);
    let s = '';
    if (typeof obj === 'string') {
        s = obj;
    } else if (obj.headers) {
        let cookies = new Cookies(obj, null);
        s = cookies.get('name');
    }
    if (s) {
        try {
            let user = JSON.parse(Buffer.from(s, 'base64').toString());
            console.log(`User: ${user.name}, ID: ${user.id}`);
            return user;
        } catch (e) {
            // ignore
        }
    }
}
