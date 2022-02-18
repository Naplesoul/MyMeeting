import {Server} from "socket.io"
import {Room} from "./lib/room"
import {DB} from "./mysql/mysql"
import {_notify} from "./lib/global";

const http = require('http')
const https = require('https')
const express = require("express");
const mediasoup = require('mediasoup');
const fs = require('fs');
const multer = require('multer')
const config = require('./config/config.js');
const app = express();
const mysqlDB = new DB();
const {logger} = require('./lib/global');

let options = {
    key:fs.readFileSync('./keys/server.key'),
    cert:fs.readFileSync('./keys/server.crt')
}
const httpsServer = https.createServer(options,app);
const httpServer = http.createServer(app);

let workers = [];
let workerIter = 0;
let rooms = new Map();

app.use((req, res, next) => {
    //设置请求头
    res.set({
        'Access-Control-Allow-Credentials': true,
        'Access-Control-Allow-Origin': req.headers.origin || '*',
        'Access-Control-Allow-Headers': 'X-Requested-With,Content-Type',
        'Access-Control-Allow-Methods': 'PUT,POST,GET,DELETE,OPTIONS',
    })
    next()
})
app.use(express.json());
app.use('/static', express.static('uploads'));
app.use(multer({ dest: '/tmp/'}).array('file'));

app.get(
    '/users',
    (req, res)=>{
        mysqlDB.getUsers((err, rows)=>{
            res.status(200).json({
                "users": rows
            })
        });
    }
)

app.post(
    '/getReservations',
    (req, res)=>{
        const {token} = req.body;
        logger.info(`Post GetReservation : token-${token}`);
        mysqlDB.getRooms(token, (err, rows)=>{
            res.status(200).json({
                "rooms": rows
            })
        });
    }
)

app.post(
    '/getHistory',
    (req, res)=>{
        const {token} = req.body;
        logger.info(`Post GetHistory : token-${token}`);
        mysqlDB.getHistory(token, (err, rows)=>{
            res.status(200).json({
                "history": rows,
            })
        });
    }
)

app.post(
    '/register',
    (req, res)=>{
        const {token, nickname, password} = req.body
        logger.info(`Post Register : token-${token} nickname-${nickname} password-${password}`);
        mysqlDB.register(token, nickname, password, (err, ok)=>{
            if (err){
                res.status(401).json({
                    "error": err
                })
            }else{
                res.status(200).json({
                    "status": "OK"
                })
            }
        });
    }
)

app.post(
    '/verify',
    (req, res)=>{
        const {email, verify} = req.body
        logger.info(`Post Verify : email-${email} verify-${verify}`)
        mysqlDB.verify(email, verify, (err, token)=>{
            if (err){
                res.status(401).json({
                    "error": err
                })
            }else{
                res.status(200).json({
                    "status": "OK",
                    "token": token
                })
            }
        });
    }
)

app.post(
    '/email',
    (req, res)=>{
        const {email} = req.body
        logger.info(`Post email : email-${email}`)
        mysqlDB.sendEmail(email, (err, ok)=>{
            if (err){
                res.status(401).json({
                    "error": err
                })
            }else{
                res.status(200).json({
                })
            }
        });
    }
)

app.post(
    '/login',
    (req, res)=>{
        const {email, password} = req.body;
        logger.info(`Post Login : email-${email} password-${password}`)
        mysqlDB.login(email, password,(err, user)=>{
            if (err){
                res.status(401).json({
                    "error": err
                })
            }else{
                res.status(200).json({
                    "user": user
                })
            }
        });
    }
)

app.post(
    '/autoLogin',
    (req, res)=>{
        const {token} = req.body;
        logger.info(`Post AutoLogin : token-${token}`)
        mysqlDB.autoLogin(token,(err, user)=>{
            if (err) {
                res.status(401).json({
                    "error": err
                })
            } else {
                res.status(200).json({
                    "user": user
                })
            }
        });
    }
)

app.post(
    '/getRoom',
    (req, res)=>{
        const {id, password, token} = req.body
        logger.info(`Post GetRoom : id-${id} password-${password}`)
        mysqlDB.getRoom(id, password, token,(err, room)=>{
            if (err){
                res.status(401).json({
                    "error": err,
                    "room" : room
                })
            }else{
                res.status(200).json({
                    "room": room
                })
            }
        });
    }
)

app.post(
    '/reserve',
    (req, res)=>{
        const {token, password, topic, start_time, end_time, max_num} = req.body
        logger.info(`Post Reserve : token-${token} password-${password} topic-${topic} start_time${start_time} end_time-${end_time} max_num-${max_num}`)
        mysqlDB.appoint(token, password, start_time, end_time, max_num, topic, (err, room)=>{
            if (err){
                res.status(401).json({
                    "error": err
                })
            }else{
                res.status(200).json({
                    "room": room
                })
            }
        });
    }
)

app.post(
    '/reserveOther',
    (req, res)=>{
        const {token, roomId, password} = req.body
        logger.info(`Post ReserveOther : token-${token} roomId-${roomId} password-${password}`)
        mysqlDB.reserve(token, roomId, password, (err, rows)=>{
            if (err){
                res.status(401).json({
                    "error": err
                })
            }else{
                res.status(200).json({
                    "status" : "OK",
                })
            }
        });
    }
)

app.get(
    '/portrait',
    (req, res)=>{
        const token = req.query.token;
        mysqlDB.getPortrait(token, (err, rows)=>{
            if (err){
                res.status(401).json({
                    "error": err,
                })
            }else {
                res.status(200).json({
                    "path": rows,
                })
            }
        });
    }
)

app.post(
    '/portrait',
    (req, res)=>{
        const token = req.query.token
        let filename = require("string-random")(32) + '.' +req.files[0].mimetype.split('/')[1];
        let des_file = "./uploads/portraits/" + filename; //文件名
        fs.readFile( req.files[0].path, function (err, data) {  // 异步读取文件内容
            fs.writeFile(des_file, data, function (err) { // des_file是文件名，data，文件数据，异步写入到文件
                if( err ){
                    logger.error( err );
                }else{
                    mysqlDB.savePortrait(token, '/static/portraits/'+filename, (err, ok)=>{
                        if (err){
                            res.status(401).json({
                                "error": err
                            })
                        }else{
                            res.status(200).json({
                                "status":"OK",
                                "filename": filename
                            })
                        }
                    });
                }
            });
        });
    }
)

app.post('/nickname', (req, res) => {
    const { token, nickname } = req.body;
    mysqlDB.setNickname(token, nickname, (err, ok) => {
        if (err) {
            res.status(401).json({ "error": err });
        } else {
            res.status(200).json({ "status": "OK" });
        }
    });
})

app.post(
    '/file',
    (req, res)=> {
        const token = req.query.token
        const filetype = req.files[0].originalname.split('.').pop();
        let filename = require("string-random")(32) + '.' + filetype;
        let des_file = "./uploads/files/" + filename; //文件名
        logger.info(`Post File : token-${token} filetype-${filetype} filename-${filename} des_file-${des_file}`)
        fs.readFile(req.files[0].path, function (err, data) {  // 异步读取文件内容
            fs.writeFile(des_file, data, function (err) { // des_file是文件名，data，文件数据，异步写入到文件
                if (err) {
                    logger.error(err)
                } else {
                    mysqlDB.saveFile(token, '/static/files/' + filename, (err, ok) => {
                        if (err) {
                            res.status(401).json({
                                "error": err
                            })
                        } else {
                            res.status(200).json({
                                "status": "OK",
                                "path": '/static/files/'+filename
                            })
                        }
                    });
                }
            });
        });
    }
)

createWorkers();

const io = new Server(httpServer, {
    pingTimeout : 5000,
    cors: { origin: '*' }
})

const ios = new Server(httpsServer, {
    pingTimeout : 5000,
    cors: { origin: '*' }
})

const handleRoomConnection = async (socket)=> {
    const {roomId, userToken, peerId} = socket.handshake.query;
    const _peerId = Number.parseInt(peerId);
    logger.info(`Connection: roomId: ${roomId}, userToken: ${userToken}, peerId: ${peerId}`);
    mysqlDB.isHost(userToken, roomId, _peerId, async (error, res) => {
        if (error) {
            logger.warn(`room ${roomId} or peer ${peerId} is illegal!`);
            _notify(socket, 'allowed', {allowed : false});
            setTimeout(() => {
                socket.disconnect(true);
            }, 5000);
            return;
        } else {
            const room = await getOrCreateRoom({ roomId, host: res, peerId: _peerId });
            if (room == null) {
                _notify(socket, 'allowed', {allowed : false});
                setTimeout(() => {
                    socket.disconnect(true);
                }, 5000);
                return;
            }
            _notify(socket, 'allowed', {allowed : true});
            room.handleConnection(_peerId, socket);
        }
    })
}

io.of('/room').on("connection", handleRoomConnection)
ios.of('/room').on("connection", handleRoomConnection);

httpServer.listen(4446, function () { logger.info('http Listening on port 4446') });
httpsServer.listen(4445, function () { logger.info('https Listening on port 4445') });
async function getOrCreateRoom({ roomId, host, peerId })
{
    let room = rooms.get(roomId);

    // If the Room does not exist create a new one.
    if (!room)
    {
        if (!host) {
            logger.warn(`Host of room ${roomId} hasn't joined!`);
            return null;
        }

        // logger.info('creating a new Room [roomId:%s]', roomId);
        let worker = getWorker();
        room = await Room.create({ worker , roomId, hostId: peerId });

        rooms.set(roomId, room);
        room.on('close', () => {
            rooms.delete(roomId);
            logger.info(`room [${roomId}] closed!`);
        });
    }

    return room;
}

async function createWorkers () {
    const {workerNum} = config.mediasoup;

    logger.info(`Running ${workerNum} Workers...`);

    for (let i = 0; i < workerNum; ++i) {
        const worker = await mediasoup.createWorker({
            logLevel   : config.mediasoup.workerSettings.logLevel,
            logTags    : config.mediasoup.workerSettings.logTags,
            rtcMinPort : Number(config.mediasoup.workerSettings.rtcMinPort),
            rtcMaxPort : Number(config.mediasoup.workerSettings.rtcMaxPort)
        })

        worker.on('died', ()=> {
            logger.error(`Worker ${worker.pid} DIED, exiting in 5 secs`);

            setTimeout(() => process.exit(1), 5000);
        })

        workers.push(worker);
        // setInterval(async () =>
        // {
        //     const usage = await worker.getResourceUsage();
        //
        //     logger.info('mediasoup Worker resource usage [pid:%d]: %o', worker.pid, usage);
        // }, 120000);
    }
}

/**
 * @extension : We can change the algorithm of allocating worker's workload
 */
function getWorker () {
    const worker = workers[workerIter];

    if (++workerIter === workers.length) {
        workerIter = 0;
    }

    return worker;
}
