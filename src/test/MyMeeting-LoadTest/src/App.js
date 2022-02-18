import React from 'react';
import {MediaService} from "./MediaService";
import {postRequest} from "./Utils";
import {config} from "./Constants";
import global from "./global"
import {MediaStreamFactory} from "./MediaStreamFactory";

class App extends React.Component
{
    mediaService = new MediaService()
    mediaStreamFactory = new MediaStreamFactory()
    start = async () => {
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        const roomId = Number.parseInt(document.getElementById('roomId').value);
        const roomPassword = document.getElementById('roomPassword').value;
        const user = (await postRequest(config.baseURL + '/login', {email, password})).data.user;
        const room = (await postRequest(config.baseURL + '/getRoom', {id: roomId, password: roomPassword, token: user.token})).data.room;
        console.log(user, room)
        await this.mediaService.joinMeeting(room.token, user.token, user.id, user.nickname, user.nickname + '_test_device', global.defaultPortrait)
        const videoTrack = await this.mediaStreamFactory.getCameraTrack();
        // const audioTrack = await this.mediaStreamFactory.getMicrophoneTrack();
        await this.mediaService.sendMediaStream(new MediaStream([videoTrack]))
    }
    stop = async () => {
        await this.mediaService.leaveMeeting();
        await this.mediaStreamFactory.stopAll();
    }
    render() {
        return (
            <div className="App">
                <input id={'email'}/>
                <input id={'password'}/>
                <input id={'roomId'}/>
                <input id={'roomPassword'}/>
                <button id={'start'} onClick={this.start}>
                    start
                </button>
                <button onClick={this.stop}>
                    stop
                </button>
            </div>
        );
    }
}

export default App;
