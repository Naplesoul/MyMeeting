<template>
  <div class="login-page">
    <v-snackbar
        top
        color="teal lighten-1 white--text"
        timeout="1600"
        light
        v-model="snack">
      {{snackText}}
    </v-snackbar>
    <v-card
        class="teal lighten-5 password-card"
        elevation="10"
    >
      <v-form
          ref="form"
          v-model="valid">
      <v-container>
        <v-row>
          <v-col class="title1 teal--text">
            设 定
          </v-col>
        </v-row>
        <v-row>
          <v-text-field
              v-model="nickname"
              append-icon="mdi-format-title"
              label="昵称"
              :rules="nicknameRules"
              background-color="teal lighten-5"
              required
              color="teal darken-1"
          ></v-text-field>
        </v-row>
        <v-row>
          <v-text-field
              v-model="password"
              append-icon="mdi-dialpad"
              label="密码"
              type="password"
              :rules="passwordRules"
              background-color="teal lighten-5"
              required
              color="teal darken-1"
          ></v-text-field>
        </v-row>
        <v-row>
          <v-text-field
              v-model="password2"
              append-icon="mdi-dialpad"
              label="再次输入密码"
              type="password"
              :rules="passwordRules"
              background-color="teal lighten-5"
              required
              color="teal darken-1"
          ></v-text-field>
        </v-row>
        <v-row>
          <v-col align="center">
            <v-btn
                color="teal accent-4 white--text"
                class="mr-4"
                @click="setPassword"
                :loading="loading"
                :disabled="loading || !valid || password !== password2"
            >
              确 认
            </v-btn>
          </v-col>
        </v-row>
      </v-container>
      </v-form>
    </v-card>
  </div>
</template>

<script>

import axios from "axios";

export default {
  name: "Login",
  components: {
  },
  data(){
    return{
      email : "",
      loading : false,
      nickname: "",
      password: "",
      password2 : "",
      snack : false,
      snackText : "",
      valid : false,
      passwordRules: [
        v => !!v || '请输入密码',
        v => /^[a-zA-Z0-9_]{6,18}$/.test(v) || '密码是六到十八位字母、数字或下划线',
      ],
      nicknameRules: [
        v => v.length >= 2 || '昵称太短',
      ],
    }
  },
  methods:{
    async setPassword(){
      this.loading = true;
      try{
        const response = await axios(
            {
              method : 'post',
              url : this.GLOBAL.baseURL + '/register',
              data : {
                'token' : this.GLOBAL.token,
                'nickname' : this.nickname,
                'password' : this.password
              }
            })
        this.snackText = '设置成功';
        this.snack = true;
        this.loading = false;
        console.log(response);
        setTimeout(()=>{this.$emit('finish');},1000)
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
    },
  }
}
</script>

<style scoped>
.title1{
  font-size: 36px;
  font-weight: bold;
  text-align: center;
  margin-bottom: 15px;
}
.password-card{
//margin-top: 20%;
  padding: 5% 8%;
//width: 60%;
  margin: calc(20vh - 150px) 10%;
  //margin: auto;
}
</style>