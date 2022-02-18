<template>
  <div class="settings-page">
    <v-snackbar
        top
        color="teal lighten-1 white--text"
        timeout="1600"
        light
        v-model="snack">
      {{snackText}}
    </v-snackbar>
    <div
        class="settings-card"
    >
      <v-container>
        <v-row>
          <v-col class="title1 white--text">
            用 户
          </v-col>
        </v-row>
        <v-row no-gutters dense>
          <v-col align="center">
            <v-avatar
                size="80px"
                class="transparent"
            >
              <img
                  alt="Avatar"
                  :loading="loading"
                  :src="GLOBAL.baseURL + GLOBAL.userInfo.portrait"
              >
            </v-avatar>
          </v-col>

          <v-col align="left">
            <p class="nickname">{{GLOBAL.userInfo.nickname}}</p>
            <p class="userid">ID: {{GLOBAL.userInfo.id}}</p>
          </v-col>
        </v-row>
        <v-row dense class="settings-row">
          <v-col align="center" class="title2">
            <v-switch
                v-model="GLOBAL.openMicrophoneWhenEnter"
                label="麦克风默认开启"
                color="teal"
                hide-details
            ></v-switch>
          </v-col>
        </v-row>
        <v-row dense class="settings-row">
          <v-col align="center" class="title2">
            <v-switch
                v-model="GLOBAL.openCameraWhenEnter"
                label="摄像头默认开启"
                color="teal"
                hide-details
            ></v-switch>
          </v-col>
        </v-row>
        <v-row dense>
          <v-col align="center">
            <v-btn
                color="red accent-4 white--text"
                class="mr-4"
                @click="logout"
                :loading="loading"
                :disabled="loading"
            >
              退出登录
            </v-btn>
          </v-col>
          <v-col align="center">
            <v-btn
                class="mr-4 white"
                @click="back"
                :loading="loading"
                :disabled="loading"
            >
              会议 >
            </v-btn>
          </v-col>
        </v-row>
      </v-container>
    </div>
  </div>
</template>

<script>
import axios from "axios";
const FormData = require("form-data");
const fs = require('fs');

export default {
  name: "Settings",
  components: {
  },
  data(){
    return{
      email : "",
      password : "",
      loading: false,
      file: null,
      snack : false,
      snackText : "",
    }
  },
  methods:{
    logout(){
      this.$emit('logout');
    },
    back(){
      this.$emit('back');
    },
    getPortrait(){

    },
    async uploadPortrait(){
      this.loading = true;
      this.file = fs.createReadStream('local/path/image.jpg');
      const formData = new FormData();
      formData.append('file', this.file);
      console.log(this.file);
      try{
        const response =await axios(
            {
              method : 'post',
              url : this.GLOBAL.baseURL + '/portrait?token='+this.GLOBAL.userInfo.token,
              headers:{'Content-Type': 'multipart/form-data'},
              data : formData
            })
        this.GLOBAL.userInfo.portrait = response.data.filename;
        this.snackText = '上传成功';
        this.snack = true;
        this.loading = false;
        console.log(response.data.filename);
      }catch(error){
        if (error.response){
          this.snackText = error.response.data.error;
        }
        else{
          this.snackText = '无法连接至服务器'
        }
        this.snack = true;
        this.loading = false;
      }
    }
  },
}
</script>

<style scoped>
.title1{
  font-size: 36px;
  font-weight: bold;
  text-align: center;
  margin-bottom: 15px;
}
.title2{
  padding: 1% 10%;
  color: white;
}
.settings-card{
  padding: 0 8%;
  width: calc(300px + 10vw);
  position: absolute;
  z-index: 2;
  bottom: calc(60vh - 220px);
  left: calc(45vw - 150px);
  background-position-y: 20px;
  background-image: linear-gradient(to bottom, #26A69A00, #26A69Add);
  border-bottom: 5px solid #A7FFEB;
}
.userid{
  font-family: "Microsoft YaHei UI", serif;
  font-size: 14px;
  text-align: left;
  color: white;
}
.nickname{
  font-family: "Microsoft YaHei UI", serif;
  font-size: 28px;
  text-align: left;
  margin-bottom: 10px;
  color: white;
}
.file-input{
  cursor: default;
  position: absolute;
  opacity: 0;
  top: 0;
  left: 0;
}
.file-input:hover{
  cursor: pointer;
}
.settings-row{
  margin: 0;
}
</style>