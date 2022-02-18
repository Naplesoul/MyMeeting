
export default {
    userInfo : {
        token : "",
        nickname: "",
        password: "",
        portrait: "",
        email: "",
        id: 0
    },
    email : "",
    password : "",
    token : "",
    roomInfo : {
        topic : "",
        id : "",
        token : "",
        password : "",
        host : 0,
        end_time : "",
        start_time: ""
    },
    baseURL : "http://122.112.175.61:4446",
    defaultPortrait: "http://122.112.175.61:4446/static/portraits/default.png",
    subPageSize: 4,
    openCameraWhenEnter : false,
    openMicrophoneWhenEnter : false,
    videoConstraint : {
        width : {min : 640, ideal : 800, max: 960},
        height : {min : 360, ideal : 450, max: 540},
    }
}
