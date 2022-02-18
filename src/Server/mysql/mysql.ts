const mysql = require("mysql")
const moment = require('moment');
import { logger } from '../lib/global';
import {sendMail} from './send-email'

const randomString = require("string-random")

export class DB {
    private _connection;

    constructor() {
        this.connectDB()
    }

    connectDB() {
        this._connection = mysql.createConnection({
            host: 'localhost',
            user: 'root',
            password: '123456',
            database: 'test'
        });

        this._connection.on('error', (error) => {
            logger.error('DB_ERROR', error.message)
            if (error.code === 'PROTOCOL_CONNECTION_LOST') {
                logger.error('[DB_CONNECTION_LOST] Try to reconnect...')
                this.connectDB()
            }
        })
        this._connection.connect();
    }

    getUsers(callback){
        this._connection.query(
            'select * from users',
            (err, rows)=>{
                if(err){
                    logger.error('[SQL_SELECT_ERROR] ', err.message);
                    callback('SSE', null)
                }else{
                    callback(null, rows)
                }
            }
        )
    }

    getRooms(token, callback){
        this._connection.query(
            'select r.id, r.token, r.password, r.host, r.end_time, r.start_time, r.topic, r.max_num from rooms r, users u, reservations e where u.id=e.userId and r.id=e.roomId and u.token="' + token +'" order by r.start_time desc',
            (err, rows)=>{
                if(err){
                    logger.error('[SQL_SELECT_ERROR] ', err.message);
                    callback('SSE', null)
                }else{
                    rows.forEach((row)=>{
                        row.start_time = moment(row.start_time).format('YYYY-MM-DD HH:mm')
                        row.end_time = moment(row.end_time).format('YYYY-MM-DD HH:mm')
                    })
                    callback(null, rows)
                }
            }
        )
    }

    getHistory(token, callback){
        this._connection.query(
            'select r.id, r.token, r.password, r.host, r.end_time, r.start_time, r.topic, r.max_num, h.time from rooms r, users u, history h where u.id=h.userId and r.id=h.roomId and u.token="' + token +'" order by h.time desc',
            (err, rows)=>{
                if(err){
                    logger.error('[SQL_SELECT_ERROR] ', err.message);
                    callback('SSE', null)
                }else{
                    rows.forEach((row)=>{
                        row.start_time = moment(row.start_time).format('YYYY-MM-DD HH:mm')
                        row.end_time = moment(row.end_time).format('YYYY-MM-DD HH:mm')
                        row.time = moment(row.time).format('YYYY-MM-DD HH:mm')
                    })
                    callback(null, rows)
                }
            }
        )
    }

    isHost(userToken, roomToken, peerId: number, callback){
        const queryUserString = `select token from users where id=${peerId} limit 1`
        this._connection.query(queryUserString, (err, rows) => {
            if (err){
                logger.error('[SQL_SELECT_ERROR] ', err.message);
                callback('SSE', null);
            } else {
                if (rows.length === 0) {
                    callback('No Such User', null);
                    return;
                } else if (rows[0].token !== userToken) {
                    callback('Wrong userToken', null);
                    return;
                }
                const queryRoomString = `select host from rooms where token="${roomToken}" limit 1`
                this._connection.query(queryRoomString, (err, rows) => {
                    if (err) {
                        logger.error('[SQL_SELECT_ERROR] ', err.message);
                        callback('SSE', null);
                    } else {
                        if (rows.length === 0) {
                            callback('No Such Room', null);
                        } else {
                            if (peerId === rows[0].host){
                                callback(null, true);
                            } else{
                                callback(null, false);
                            }
                        }
                    }
                });
            }
        });
    }

    setHost(userId: number, roomToken, callback){
        const queryString = `select token from users where id=` + userId;
        this._connection.query(
            queryString,
            (err, rows)=>{
                if(err){
                    logger.error('[SQL_SELECT_ERROR] ', err.message);
                    callback('SSE', null)
                }else{
                    if (rows.length === 0){
                        callback('No Such User', null);
                    }else{
                        const queryString2 = 'update rooms set host='+userId+' where token="'+roomToken+'"';
                        this._connection.query(
                            queryString2,
                            (err, ok)=>{
                                if(err){
                                    logger.error('[SQL_SELECT_ERROR] ', err.message);
                                    callback('SSE', null)
                                }else{
                                    if (ok.changedRows === 0){
                                        callback('No Such Room', null);
                                    }else{
                                        callback(null, true);
                                    }
                                }
                            }
                        )
                    }
                }
            }
        )
    }

    register(token, nickname, password, callback){
        const queryString = 'update users set nickname="'+ nickname +'", password="'+password+'", verify=null where token="'+token+'"';
        this._connection.query(
            queryString,
            (err, ok)=>{
                if(err){
                    logger.error('[SQL_INSERT_ERROR] ', err.message);
                    callback("SIE", null)
                }else{
                    if (ok.changedRows > 0){
                        callback(null, ok)
                    }else{
                        callback("Wrong Token", null);
                    }
                }
            }
        )
    }

    sendEmail(email, callback){
        const verify = randomString(6).toUpperCase();
        const queryString = 'insert into users set email="'+email+'",verify="'+verify+'"';
        sendMail(email, verify, (succ)=>{
            if (succ){
                logger.info("Email Send: ", verify);
            }else{
                logger.error("Email Send Failed!")
            }
        })
        this._connection.query(
            queryString,
            (err, ok)=>{
                if(err){
                    const queryString = 'update users set verify="'+verify+'" where email="'+email+'"';
                    this._connection.query(
                        queryString,
                        (err, ok)=>{
                            if(err){
                                logger.error('[SQL_UPDATE_ERROR] ', err.message);
                                callback("SUE", null)
                            }else{
                                callback(null, ok)
                            }
                        }
                    )
                }else{
                    callback(null, ok)
                }
            }
        )
    }

    verify(email, verify, callback){
        const token = randomString(32);
        const queryString = 'update users set token="'+ token +'" where verify="'+verify+'" and email="'+email+'"';
        this._connection.query(
            queryString,
            (err, ok)=>{
                if(err){
                    logger.error('[SQL_UPDATE_ERROR] ', err.message);
                    callback("SUE", null)
                }else{
                    if (ok.changedRows > 0){
                        callback(null, token);
                    }else{
                        callback("Wrong Verify Code", null);
                    }
                }
            }
        )
    }

    login(email, password, callback){
        const selectString = `select * from users where email="${email}" and password="${password}" limit 1`
        this._connection.query(selectString, (err, rows) => {
            if (err) {
                logger.error('[SQL_SELECT_ERROR] ', err.message)
                callback('SSE', null)
            } else if (rows.length === 0) {
                callback('Unauthorized', null)
            } else {
                const user = rows[0]
                const token = randomString(32)
                user.token = token
                const updateString = `update users set token="${token}" where id=${user.id} limit 1`
                this._connection.query(updateString, (err, ok) => {
                    if (err) {
                        logger.error('[SQL_UPDATE_ERROR] ', err.message);
                        callback('SUE', null)
                    } else {
                        callback(null, user)
                    }
                })
            }
        })
    }

    autoLogin(token, callback){
        const queryString = `select * from users where token="${token}" limit 1`
        this._connection.query(
            queryString,
            (err, rows)=>{
                if (err) {
                    logger.error('[SQL_SELECT_ERROR] ', err.message);
                    callback('SSE', null)
                } else if (rows.length === 0) {
                    callback('Unauthorized', null)
                } else {
                    callback(null, rows[0])
                }
            }
        )

    }

    appoint(token, password, start_time, end_time, max_num, topic, callback) {
        if (start_time >= end_time) {
            callback("Invalid End Time", null);
            return;
        // } else if (moment(start_time, moment.ISO_8601).format('YYYY-MM-DD HH:mm') < moment().format('YYYY-MM-DD HH:mm')){
        //     callback("Invalid Start Time", null);
        //     return;
        }
        const verifyUserString = `select users.id from users where token="${token}" limit 1`;
        this._connection.query(verifyUserString, (err, rows)=> {
            if (err) {
                logger.error('[SQL_SELECT_ERROR] ', err.message);
                callback('SSE', null);
            } else if (rows.length === 0) {
                callback('Wrong Token', null);
            } else {
                const hostId = rows[0].id
                const roomToken = randomString()
                const insertRoomString = `insert into rooms set host=${hostId},start_time="${start_time}",end_time="${end_time}",max_num=${max_num},topic="${topic}",token="${roomToken}",password="${password}"`
                this._connection.query(insertRoomString, (err, ok) => {
                    if (err) {
                        logger.error('[SQL_INSERT_ERROR] ', err.message)
                        callback('SIE', null)
                    } else {
                        const roomId = ok.insertId
                        const insertReservationString = `insert into reservations set userId=${hostId}, roomId=${roomId}`
                        this._connection.query(insertReservationString, (err, ok) => {
                            if (err) {
                                logger.error('[SQL_INSERT_ERROR] ', err.message)
                                callback('SIE', null)
                            } else {
                                const room = {
                                    id: roomId,
                                    token: roomToken,
                                    password,
                                    host: hostId,
                                    end_time,
                                    start_time,
                                    topic,
                                    max_num
                                }
                                callback(null, room)
                            }
                        })
                    }
                })
            }
        })
    }

    getRoom(id, password, userToken, callback) {
        const verifyUserString = `select users.id from users where token="${userToken}" limit 1`
        this._connection.query(verifyUserString, (err, rows) => {
            if (err) {
                logger.error('[SQL_SELECT_ERROR] ', err.message);
                callback('SEE', null)
            } else if (rows.length === 0) {
                callback('Wrong userToken', null)
            } else {
                const userId = rows[0].id
                const selectRoomString = `select * from rooms where id=${id} limit 1`
                this._connection.query(selectRoomString, (err, rows) => {
                    if (err) {
                        logger.error('[SQL_SELECT_ERROR] ', err.message);
                        callback('SEE', null)
                    } else if (rows.length === 0) {
                        callback('No Such Room', null)
                    } else {
                        const room = rows[0]
                        if (room.password === password) {
                            const start_time = moment(room.start_time, moment.ISO_8601)
                            const end_time = moment(room.end_time, moment.ISO_8601)
                            const now_time = moment()
                            if (start_time.isAfter(now_time) || end_time.isBefore(now_time)) {
                                callback("Invalid Time", room);
                            } else {
                                const insertHistoryString = `insert into history set userId = ${userId}, roomId=${id}, time="${now_time.format('YYYY-MM-DD HH:mm')}"`
                                this._connection.query(insertHistoryString, (err, ok) => {
                                    if (err) {
                                        logger.error('[SQL_INSERT_ERROR] ', err.message);
                                        callback('SIE', null)
                                    } else {
                                        room.start_time = start_time.format('YYYY-MM-DD HH:mm')
                                        room.end_time = end_time.format('YYYY-MM-DD HH:mm')
                                        callback(null, room);
                                    }
                                })
                            }
                        } else {
                            callback('Unauthorized', null)
                        }
                    }
                })
            }
        })
    }

    getPortrait(token, callback){
        this._connection.query(
            'select users.portrait from users where token="'+token+'"',
            (err, rows)=>{
                if(err){
                    logger.error('[SQL_SELECT_ERROR] ', err.message);
                    callback('SSE', null)
                }else{
                    if (rows.length === 0){
                        callback("Wrong Token", null);
                    }else{
                        callback(null, rows[0].portrait);
                    }
                }
            }
        )
    }

    setNickname(token, nickname, callback) {
        const updateString = `update users set nickname="${nickname}" where token="${token}"`;
        this._connection.query(updateString, (err, ok) => {
            if (err) {
                logger.error('[SQL_UPDATE_ERROR] ', err.message);
                callback('SUE', null);
            } else if (ok.changedRows === 0) {
                callback('Wrong Token', null);
            } else {
                callback(null, ok);
            }
        });
    }

    savePortrait(token, path, callback){
        const queryString = 'update users set portrait="'+path+'" where token="'+token+'"';
        this._connection.query(
            queryString,
            (err, ok)=>{
                if(err){
                    logger.error('[SQL_SELECT_ERROR] ', err.message);
                    callback('SSE', null);
                }else if (ok.changedRows === 0){
                    callback('Wrong Token', null);
                }else{
                    callback(null, ok);
                }
            }
        )
    }
    saveFile(token, path, callback){
        this._connection.query(
            'select users.id from users where token="'+token+'"',
            (err, rows)=>{
                if(err){
                    logger.error('[SQL_SELECT_ERROR] ', err.message);
                    callback('SSE', null)
                }else{
                    if (rows.length === 0){
                        callback("Wrong Token", null);
                    }else{
                        const queryString = 'insert into files set path="'+path+'", owner='+rows[0].id;
                        this._connection.query(
                            queryString,
                            (err, ok)=>{
                                if(err){
                                    logger.error('[SQL_INSERT_ERROR] ', err.message);
                                    callback('SIE', null);
                                }else {
                                    callback(null, ok);
                                }
                            }
                        )
                    }
                }
            }
        )
    }

    reserve(token, roomId, password, callback) {
        const verifyUserString = `select users.id from users where token="${token}" limit 1`
        this._connection.query(verifyUserString, (err, rows) => {
            if (err) {
                logger.error('[SQL_SELECT_ERROR] ', err.message);
                callback('SEE', null)
            } else if (rows.length === 0) {
                callback('Wrong Token', null)
            } else {
                const userId = rows[0].id
                const selectRoomString = `select rooms.id from rooms where id=${roomId} and password="${password}" limit 1`
                this._connection.query(selectRoomString, (err, rows) => {
                    if (err) {
                        logger.error('[SQL_SELECT_ERROR] ', err.message);
                        callback('SEE', null)
                    } else if (rows.length === 0) {
                        callback('No Such Room', null)
                    } else {
                        const roomId = rows[0].id
                        const selectReservationString = `select reservations.id from reservations where userId=${userId} and roomId=${roomId} limit 1`
                        this._connection.query(selectReservationString, (err, rows) => {
                            if (err) {
                                logger.error('[SQL_SELECT_ERROR] ', err.message);
                                callback('SEE', null)
                            } else if (rows.length === 0) {
                                const insertString = `insert into reservations set userId=${userId}, roomId=${roomId}`
                                this._connection.query(insertString, (err, ok) => {
                                    if (err) {
                                        logger.error('[SQL_INSERT_ERROR] ', err.message);
                                        callback('SIE', null);
                                    } else {
                                        callback(null, ok);
                                    }
                                })
                            } else {
                                callback('Already Reserved', null)
                            }
                        })
                    }
                })
            }
        })
    }
}
