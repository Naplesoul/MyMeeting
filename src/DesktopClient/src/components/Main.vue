<template>
  <div class="main-page">
    <v-snackbar
        top
        color="teal lighten-1 white--text"
        timeout="1600"
        light
        v-model="snack">
      {{snackText}}
    </v-snackbar>
    <div class="teal-cover">
      <h1 class="title1 white--text" :class="[{'active':click1||click2||click3}]">
        开始你的视频会议
      </h1>
      <h1 class="title2 white--text" :class="[{'active':click1||click2||click3}]">
        MyMeeting — 见我想见的人
      </h1>
      <v-container :class="['cards-container', {'active':click1||click2||click3}]">
        <v-row dense>
          <v-col align="center" v-show="click1||(!click1&&!click2&&!click3)" @click="click1=true; click4 = click5 = false">
            <v-card
                class="teal lighten-4 function-card"
                :class="[{'active':click1||click2||click3}]"
                elevation="10"
                :loading="loading"
                :disabled="loading"
                color="teal"
                @mouseenter="hover1=true" @mouseleave="hover1=false"
            >
              <v-icon
                  color="#004D4099" size="60px" class="close" v-show="click1" @click.stop="click1=false">
                mdi-close
              </v-icon>
              <v-icon
                  color="white" size="150px" :class="['arrow',{'pos1':hover1, 'pos2':click1}]" :disabled="!valid1 || loading" @click="sendReq">
                mdi-arrow-right-thick
              </v-icon>
              <p class="card-title teal--text text--darken-4">
                加入会议
              </p>
              <p class="card-text teal--text text--darken-4">
                立即加入一场正在进行的会议
              </p>
              <v-form v-model="valid1" ref="form">
                <v-container v-if="click1">
                  <v-row dense>
                    <v-col>
                      <v-text-field
                          v-model="roomId"
                          height="60px"
                          outlined
                          :rules="idRules"
                          append-icon="mdi-email"
                          label="会议号"
                          color="teal darken-1"
                          required
                      ></v-text-field>
                    </v-col>
                  </v-row>
                  <v-row dense>
                    <v-col>
                      <v-text-field
                          v-model="password"
                          outlined
                          height="60px"
                          type="password"
                          :rules="passwordRules"
                          append-icon="mdi-dialpad"
                          label="密码"
                          color="teal darken-1"
                          required
                      ></v-text-field>
                    </v-col>
                  </v-row>
                </v-container>
              </v-form>
            </v-card>
          </v-col>
          <v-col align="center" v-show="click2||(!click1&&!click2&&!click3)" @click="click2=true; click4 = click5 = false">
            <v-card
                class="teal lighten-4 function-card"
                :class="[{'active':click1||click2||click3}]"
                elevation="10"
                :loading="loading"
                :disabled="loading"
                @mouseenter="hover2=true" @mouseleave="hover2=false"
            >
              <v-icon
                  color="#004D4099" size="60px" class="close" v-show="click2" @click.stop="click2=false">
                mdi-close
              </v-icon>
              <v-icon
                  color="white" size="150px" :class="['arrow',{'pos1':hover2, 'pos2':click2}]" :disabled="!valid2 || loading" @click="sendReq">
                mdi-arrow-right-thick
              </v-icon>
              <p class="card-title teal--text text--darken-4">
                创建会议
              </p>
              <p class="card-text teal--text text--darken-4">
                立即创建并开始一次会议
              </p>
              <v-form v-model="valid2" ref="form">
                <v-container v-if="click2">
                  <v-row dense>
                    <v-col>
                      <v-text-field
                          v-model="topic"
                          :rules="topicRules"
                          height="60px"
                          outlined
                          append-icon="mdi-format-title"
                          label="会议主题"
                          color="teal darken-1"
                          required
                      ></v-text-field>
                    </v-col>
                    <v-col>
                      <v-text-field
                          v-model="max_num"
                          height="60px"
                          outlined
                          append-icon="mdi-numeric"
                          label="最大人数"
                          color="teal darken-1"
                          required
                      ></v-text-field>
                    </v-col>
                  </v-row>
                  <v-row dense>
                    <v-col>
                      <v-text-field
                          v-model="password"
                          outlined
                          height="60px"
                          type="password"
                          :rules="passwordRules"
                          append-icon="mdi-dialpad"
                          label="设置密码"
                          color="teal darken-1"
                          required
                      ></v-text-field>
                    </v-col>
                  </v-row>
                </v-container>
              </v-form>
            </v-card>
          </v-col>
          <v-col align="center" v-show="click3||(!click1&&!click2&&!click3)" @click="click3=true; click4 = click5 = false">
            <v-card
                class="teal lighten-4 function-card"
                :class="[{'active':click1||click2||click3}]"
                elevation="10"
                :loading="loading"
                :disabled="loading"
                @mouseenter="hover3=true" @mouseleave="hover3=false"
            >
              <v-overlay
                  v-show="selecting_start_time || selecting_end_time || selecting_end_date || selecting_start_date">
                <v-icon @click="selecting_start_date = selecting_start_time = selecting_end_time = selecting_end_date = false" class="close-picker"> mdi-close</v-icon>
                <v-date-picker
                    v-show="selecting_start_date"
                    v-model="start_date"
                    class="mt-4"
                    elevation="8"
                    color="teal"
                    light
                    :min="now_date"
                ></v-date-picker>
                <v-time-picker
                    v-show="selecting_start_time"
                    v-model="start_time"
                    class="mt-4"
                    light
                    elevation="8"
                    format="24hr"
                    color="teal"
                    scrollable
                    :min="now_time"
                ></v-time-picker>
                <v-date-picker
                    v-show="selecting_end_date"
                    v-model="end_date"
                    class="mt-4"
                    elevation="8"
                    color="teal"
                    light
                    :min="start_date"
                ></v-date-picker>
                <v-time-picker
                    v-show="selecting_end_time"
                    v-model="end_time"
                    class="mt-4"
                    light
                    elevation="8"
                    format="24hr"
                    color="teal"
                    scrollable
                    :min="start_time"
                ></v-time-picker>
              </v-overlay>
              <v-icon
                  color="#004D4099" size="60px" class="close" v-show="click3" @click.stop="click3=false">
                mdi-close
              </v-icon>
              <v-icon
                  color="white" size="150px" :class="['arrow',{'pos1':hover3, 'pos2':click3}]"  :disabled="!valid3||loading" @click="sendReq">
                mdi-arrow-right-thick
              </v-icon>
              <p class="card-title teal--text text--darken-4">
                预约会议
              </p>
              <p class="card-text teal--text text--darken-4">
                预约或创建未来某时刻的会议
              </p>
              <v-form v-model="valid3" ref="form">
                <v-container v-if="click3">
                  <v-row dense>
                    <v-col>
                      <v-text-field
                          v-model="topic"
                          :rules="topicRules"
                          height="50px"
                          outlined
                          append-icon="mdi-format-title"
                          label="会议主题"
                          color="teal darken-1"
                          required
                      ></v-text-field>
                    </v-col>
                    <v-col>
                      <v-text-field
                          v-model="max_num"
                          height="50px"
                          outlined
                          append-icon="mdi-numeric"
                          label="最大人数"
                          color="teal darken-1"
                          required
                      ></v-text-field>
                    </v-col>
                  </v-row>
                  <v-row dense>
                    <v-col>
                      <v-text-field
                          v-model="password"
                          outlined
                          height="50px"
                          type="password"
                          :rules="passwordRules"
                          append-icon="mdi-dialpad"
                          label="设置密码"
                          color="teal darken-1"
                          required
                      ></v-text-field></v-col>
                  </v-row>
                  <v-row dense>
                    <v-col>
                      <v-text-field
                          v-model="start_date"
                          outlined
                          height="45px"
                          append-icon="mdi-calendar-range"
                          label="开始日期"
                          color="teal darken-1"
                          required
                          @focusin="selecting_start_date = true"
                      ></v-text-field>
                    </v-col>
                    <v-col>
                      <v-text-field
                          v-model="start_time"
                          outlined
                          height="45px"
                          append-icon="mdi-clock-time-four-outline"
                          label="开始时间"
                          color="teal darken-1"
                          required
                          @focusin="selecting_start_time = true"
                      ></v-text-field>
                    </v-col>
                  </v-row>
                  <v-row dense>
                    <v-col>
                      <v-text-field
                          v-model="end_date"
                          height="45px"
                          outlined
                          append-icon="mdi-calendar"
                          label="结束日期"
                          color="teal darken-1"
                          required
                          @focusin="selecting_end_date = true"
                      ></v-text-field>
                    </v-col>
                    <v-col>
                      <v-text-field
                          v-model="end_time"
                          height="45px"
                          outlined
                          append-icon="mdi-clock-time-five-outline"
                          label="结束时间"
                          color="teal darken-1"
                          required
                          @focusin="selecting_end_time = true"
                      ></v-text-field>
                    </v-col>
                  </v-row>
                </v-container>
              </v-form>
            </v-card>
          </v-col>
        </v-row>
      </v-container>
    </div>
    <button
        :class="['mymeeting-btn', {'active':click4}]"
        @click="getMeetings" v-show="!click5">
      {{'我的预约'+ (click4 ? '>' : '&lt;')}}</button>
    <div :class="['mymeeting-list', {'active':click4}]">
      <v-container>
        <h2 class="title3">
          我的预约
        </h2>
        <v-row v-for="room in rooms" :key="room.id">
          <v-card
              elevation="5"
              class="mx-auto teal room-card"
              color="teal lighten-3"
              max-width="350"
          ><v-img
              :src="GLOBAL.baseURL + '/static/images/'+(1+room.id % 8)+'.jpeg'"
              height="90px"
          ></v-img>
            <v-card-title class="room-card-title">
              <v-icon color="teal darken-2" v-if="room.host === GLOBAL.userInfo.id"> mdi-crown-outline</v-icon>
              {{room.topic}}
            </v-card-title>
            <v-card-subtitle>
              {{room.start_time + ' ~ ' + room.end_time}}
            </v-card-subtitle>

            <v-card-actions>
              <v-btn
                  color="orange lighten-1"
                  :disabled="room.ended"
                  text
                  @click="quickJoin(room)"
              >
                JOIN
              </v-btn>

              <v-spacer></v-spacer>

              <v-btn
                  icon
                  @click="room.show = !room.show"
              >
                <v-icon>{{ room.show ? 'mdi-chevron-up' : 'mdi-chevron-down' }}</v-icon>
              </v-btn>
            </v-card-actions>

            <v-expand-transition>
              <div v-show="room.show">
                <v-divider></v-divider>
                <v-card-text class="meeting-card-text">
                  {{'会议号：'+room.id}}
                </v-card-text>
                <v-card-text class="meeting-card-text">
                  {{'会议密码：'+room.password}}
                </v-card-text>
              </div>
            </v-expand-transition>
          </v-card>
        </v-row>
      </v-container>
    </div>
    <button
        :class="['history-btn', {'active':click5}]"
        @click="getHistory" v-show="!click4">
      {{'历史会议'+ (click5 ? '>' : '&lt;')}}</button>
    <div :class="['history-list', {'active':click5}]">
      <v-container>
        <h2 class="title3">
          历史会议
        </h2>
        <v-row v-for="(room, index) in history" v-bind:key="index">
          <v-card
              elevation="5"
              class="mx-auto teal room-card"
              color="teal lighten-3"
              max-width="350"
          >
            <v-card-title class="room-card-title">
              <v-icon color="teal darken-2" v-if="room.host === GLOBAL.userInfo.id"> mdi-crown-outline</v-icon>
              {{room.topic}}
            </v-card-title>
            <v-card-subtitle>
              {{room.start_time + ' ~ ' + room.end_time}}
            </v-card-subtitle>

            <v-card-actions>
              <v-btn
                  color="orange lighten-1"
                  :disabled="room.ended"
                  text
                  @click="quickJoin(room)"
              >
                JOIN
              </v-btn>

              <v-spacer></v-spacer>

              <v-btn
                  icon
                  @click="room.show = !room.show"
              >
                <v-icon>{{ room.show ? 'mdi-chevron-up' : 'mdi-chevron-down' }}</v-icon>
              </v-btn>
            </v-card-actions>

            <v-expand-transition>
              <div v-show="room.show">
                <v-divider></v-divider>
                <v-card-text class="meeting-card-text">
                  {{'会议号：'+room.id}}
                </v-card-text>
                <v-card-text class="meeting-card-text">
                  {{'会议密码：'+room.password}}
                </v-card-text>
                <v-card-text class="meeting-card-text">
                  {{'我入会的时间：'}}
                </v-card-text>
                <v-card-text class="meeting-card-text-time" v-for="(time, index) in room.time" :key="index">
                  {{'· ' + time}}
                </v-card-text>
              </div>
            </v-expand-transition>
          </v-card>
        </v-row>
      </v-container>
    </div>

  </div>
</template>

<script>
import moment from "moment";
import axios from "axios";

export default {
  name: "Main",
  components: {
  },
  data(){
    return{
      hover1 : false,
      click1 : false,
      hover2 : false,
      click2 : false,
      hover3 : false,
      click3 : false,
      click4 : false,
      click5 : false,
      loading : false,
      snack : false,
      valid1 : false,
      show : false,
      valid2 : false,
      valid3 : false,
      snackText : "",
      roomId : "",
      password : "",
      topic : "",
      rooms : [],
      history : [],
      start_time :  moment().format("HH:mm"),
      end_time : moment().add(2, 'h').format("HH:mm"),
      start_date : moment().format("YYYY-MM-DD"),
      end_date :  moment().format("YYYY-MM-DD"),
      now_time : moment().format("HH:mm"),
      now_date : moment().format("YYYY-MM-DD"),
      max_num : 10,
      topicRules: [
        v => !!v || '请输入会议主题',
      ],
      idRules :[
        v => !!v || '请输入会议号',
        v => /^[0-9]*$/.test(v) || '会议号是数字',
      ],
      passwordRules: [
        v => /^[0-9]{8}$/.test(v) || '密码是八位数字',
      ],
      selecting_start_time: false,
      selecting_start_date: false,
      selecting_end_time: false,
      selecting_end_date: false,
    }
  },
  methods:{
    async sendReq(){
      if (this.click1){
        this.loading = true;
        try{
          const response = await axios(
              {
                method : 'post',
                url : this.GLOBAL.baseURL + '/getRoom',
                data : {
                  'id' : this.roomId,
                  'password' : this.password,
                  'token' : this.GLOBAL.userInfo.token
                }
              })
          this.GLOBAL.roomInfo = response.data.room;
          this.snackText = '加入成功';
          this.snack = true;
          this.loading = false;
          this.click1 = false;
          setTimeout(()=>{this.$emit('join');},1600)
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
      else if(this.click3){
        this.loading = true;
        try{
          const response = await axios(
              {
                method : 'post',
                url : this.GLOBAL.baseURL + '/reserve',
                data : {
                  'token' : this.GLOBAL.userInfo.token,
                  'topic' : this.topic,
                  'password' : this.password,
                  'start_time' : this.start_date + ' ' + this.start_time + ':00',
                  'end_time' : this.end_date + ' ' + this.end_time + ':00',
                  'max_num' : this.max_num,
                }
              })
          this.GLOBAL.roomInfo = response.data.room;
          this.snackText = '预约成功';
          this.snack = true;
          this.loading = false;
          this.click3 = false;
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
      else if(this.click2){
        this.loading = true;
        try{
          const response = await axios(
              {
                method : 'post',
                url : this.GLOBAL.baseURL + '/reserve',
                data : {
                  'token' : this.GLOBAL.userInfo.token,
                  'topic' : this.topic,
                  'password' : this.password,
                  'start_time' : moment().format("YYYY-MM-DD HH:mm:ss"),
                  'end_time' : moment().add(4, 'h').format("YYYY-MM-DD HH:mm:ss"),
                  'max_num' : this.max_num,
                }
              })
          this.GLOBAL.roomInfo = response.data.room;
          this.snackText = '创建成功';
          this.snack = true;
          this.loading = false;
          this.click2 = false;
          setTimeout(()=>{this.$emit('join');},1000)
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
    async getMeetings(){
      this.click4 = !this.click4;
      if (this.click4){
        try{
          const response =await axios(
              {
                method : 'post',
                url : this.GLOBAL.baseURL + '/getReservations',
                data : {
                  'token' : this.GLOBAL.userInfo.token,
                }
              })
          response.data.rooms.forEach((room)=>{
            room.show = false;
            room.ended = moment(room.end_time).isBefore(moment());
          });
          this.rooms = response.data.rooms
          console.log(response);
        }catch(error){
          console.log(error);
        }
      }
    },
    async getHistory(){
      this.click5 = !this.click5;
      if (this.click5){
        try{
          const response =await axios(
              {
                method : 'post',
                url : this.GLOBAL.baseURL + '/getHistory',
                data : {
                  'token' : this.GLOBAL.userInfo.token,
                }
              })
          const roomList = [];
          response.data.history.forEach((rec)=>{
            if(roomList.indexOf(rec.id) === -1){
              roomList.push(rec.id);
              rec.show = false;
              rec.time = [rec.time]
              rec.ended = moment(rec.end_time).isBefore(moment());
              this.history.push(rec)
            }else{
              this.history[roomList.indexOf(rec.id)].time.push(rec.time)
            }
          })
          console.log(response);
        }catch(error){
          console.log(error);
        }
      }
    },
    async quickJoin(room){
      this.loading = true;
      try{
        const response = await axios(
            {
              method : 'post',
              url : this.GLOBAL.baseURL + '/getRoom',
              data : {
                'id' : room.id,
                'password' : room.password,
                'token' : this.GLOBAL.userInfo.token
              }
            })
        this.GLOBAL.roomInfo = response.data.room;
        this.snackText = '加入成功';
        this.snack = true;
        this.loading = false;
        setTimeout(()=>{this.$emit('join');},1000)
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
  }
}
</script>

<style scoped>
.main-page{
  min-width: 600px;
  overflow: auto;
  width: 100%;
  height: 100%;
  background-size: cover;
  background: #000000;
//background-image: url("http://se-summer.cn:4446/static/images/bg2.gif");
}
.teal-cover{
  overflow: hidden;
  width: 100%;
  height: 100%;
  background-image: linear-gradient(to bottom left, #00897B00, #00897Bdd);
}
.title1{
  font-family: "Microsoft YaHei UI", serif;
  font-size: 72px;
  font-weight: bold;
  margin-top: 20vh;
  margin-left: 60px;
  transition: 0.25s ease-in-out;
}
.title1.active{
  margin-top: 50px;
  transition: 0.25s ease-in-out;
}
.title2{
  font-family: "Microsoft YaHei UI", serif;
  font-size: 24px;
  font-style: italic;
  font-weight: lighter;
  margin-top: 10px;
  margin-left: 60px;
  transition: 0.25s ease-in-out;
}
.title2.active{
  opacity: 0;
  height: 0;
  transition: 0.25s ease-in-out;
}
.title3{
  text-align: center;
  font-family: "Microsoft YaHei UI", serif;
  font-size: 40px;
  font-weight: bold;
  color: white;
  margin: 10px;
}
.card-title{
  font-family: "Microsoft YaHei UI", serif;
  font-size: 42px;
  font-weight: bold;
  text-align: left;
}
.card-text{
  font-family: "Microsoft YaHei UI", serif;
  font-size: 16px;
  text-align: left;
  margin-left: 10%;
}
.cards-container{
  margin-top: calc(36vh - 190px);
  transition: all 0.15s ease-out;
}
.cards-container.active{
  margin-top: 0;
  transition: all 0.15s ease-out;
}
.function-card{
  padding: 5% 8%;
  margin: 5vh 10%;
  transition: all 0.2s ease-out;
  overflow: hidden;
  background-image: linear-gradient(to bottom, #00897B00, #00695Cdd);
}
.function-card:hover{
  transition: all 0.15s ease-out;
  transform: scale(1.05);
  cursor: pointer;
}
.function-card.active{
  transform: scale(1);
  margin: 5% 15% 0 15%;
  padding: 1% 10% 0 10%;
  transition: all 0.2s ease-out;
}
.function-card.active:hover{
  cursor: default;
}
.arrow{
  position: absolute;
  bottom: -50px;
  left: -90px;
  transition: all 0.15s ease-in;
}
.arrow.pos1{
  transition: all 0.15s ease-in;
  left: -40px;
  cursor: default;
}
.arrow.pos2{
  transition: all 0.3s ease-in;
  bottom: auto;
  left: 80%;
  cursor: pointer;
}
.close{
  transition: 0.2s linear;
  position: absolute;
  top: 5px;
  left: 5px;
}
.close:hover{
  transition: 0.2s linear;
  transform: scale(1.1);
  position: absolute;
}

.mymeeting-btn{
  font-family: "Microsoft YaHei UI", serif;
  font-weight: bold;
  font-size: 18px;
  padding: 15px;
  position: absolute;
  width: 45px;
  bottom: 20px;
  background-image: linear-gradient(to bottom, #80CBC4ff, #00695Cdd);
  right: 0;
  outline: none;
  transition: 0.2s ease-in-out;
  border-bottom-left-radius: 10px;
  border-top-left-radius: 10px;
}
.mymeeting-btn:hover {
  background-image: linear-gradient(to bottom, #80CBC4cc, #00695Cdd);}
.mymeeting-btn.active:hover {
  background-image: linear-gradient(to bottom, #80CBC4ff, #00695Cdd);
}
.mymeeting-btn.active{
  right: 40%;
  bottom: 70%;
  transition: 0.2s ease-in-out;
  background-image: linear-gradient(to bottom, #80CBC4cc, #00695Cdd);
}
.history-btn{
  font-family: "Microsoft YaHei UI", serif;
  font-weight: bold;
  font-size: 18px;
  padding: 15px;
  position: absolute;
  width: 45px;
  bottom: 200px;
  background-image: linear-gradient(to bottom, #80CBC4ff, #00695Cdd);
  right: 0;
  outline: none;
  transition: 0.2s ease-in-out;
  border-bottom-left-radius: 10px;
  border-top-left-radius: 10px;
}
.history-btn:hover {
  background-image: linear-gradient(to bottom, #80CBC4cc, #00695Cdd);}
.history-btn.active:hover {
  background-image: linear-gradient(to bottom, #80CBC4ff, #00695Cdd);
}
.history-btn.active{
  right: 40%;
  bottom: 70%;
  transition: 0.2s ease-in-out;
  background-image: linear-gradient(to bottom, #80CBC4cc, #00695Cdd);
}

.mymeeting-list{
  position: absolute;
  right: 0;
  top: 0;
  width: 0;
  height: 100%;
  overflow: auto;
  transition: 0.3s ease-in-out;
  background-image: linear-gradient(to right, #00897B08, #00897Bff);
}
.mymeeting-list.active{
  width: 40%;
  transition: 0.3s ease-in-out;
}

.history-list{
  position: absolute;
  right: 0;
  top: 0;
  width: 0;
  height: 100%;
  overflow: auto;
  transition: 0.3s ease-in-out;
  background-image: linear-gradient(to right, #00897B08, #00897Bff);
}
.history-list.active{
  width: 40%;
  transition: 0.3s ease-in-out;
}
.room-card{
  margin: 20px;
}
.room-card-title{
  font-family: "Microsoft YaHei UI", serif;
}
.meeting-card-text{
  margin-left: 20px;
  margin-top: 10px;
  margin-bottom: 5px;
  padding: 0;
}
.meeting-card-text-time{
  margin-left: 60px;
  margin-top: 5px;
  margin-bottom: 3px;
  padding: 0;
}
@keyframes effect {
  from {
    background-image: linear-gradient(to bottom left, #00897B00, #00897Bdd);
  }
  to {
    background-image: linear-gradient(to bottom left, #00897Bdd, #00897B00);
  }
}
</style>
