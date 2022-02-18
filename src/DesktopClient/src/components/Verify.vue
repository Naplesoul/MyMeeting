<template>
  <div class="verify-page">
    <v-snackbar
        top
        color="teal lighten-1 white--text"
        timeout="1600"
        light
        v-model="snack">
      {{snackText}}
    </v-snackbar>
    <v-card
        class="teal lighten-5 register-card"
        elevation="10"
    >
      <v-form
          ref="form"
          v-model="valid">
      <v-container>
        <v-row>
          <v-col class="title1 teal--text">
            验 证
          </v-col>

        </v-row>
        <v-row>
          <v-text-field
              v-model="verifyCode"
              append-icon="mdi-dialpad"
              label="验证码"
              counter="6"
              :rules="verifyRules"
              background-color="teal lighten-5"
              clearable
              required
              color="teal darken-1"
          ></v-text-field>
        </v-row>
        <v-row>
          <v-col align="center">
            <v-btn
                class="mr-4"
                @click="back"
            >
              返回
            </v-btn>
          </v-col>
          <v-col align="center">
            <v-btn
                color="teal accent-4 white--text"
                class="mr-4"
                @click="verify"
                :loading="loading"
                :disabled="loading || !valid"
            >
              验证
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
      verifyCode : "",
      loading : false,
      snack : false,
      snackText : "",
      valid : false,
      verifyRules: [
        v => !!v || '请输入验证码',
        v => /^[A-Z0-9]{6}$/.test(v) || '验证码是六位大写字母或数字',
      ],
    }
  },
  methods:{
    back(){
      this.$emit('back');
    },
    async verify(){
      this.loading = true;
      try{
        const response =await axios(
            {
              method : 'post',
              url : this.GLOBAL.baseURL + '/verify',
              data : {
                'email' : this.GLOBAL.email,
                'verify' : this.verifyCode
              }
            })
        this.GLOBAL.token = response.data.token;
        this.snackText = '验证成功';
        this.snack = true;
        this.loading = false;
        console.log(response);
        setTimeout(()=>{this.$emit('ok');},1000)
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

.register-card{
//margin-top: 20%;
  padding: 5% 8%;
//width: 60%;
  margin: calc(20vh - 80px) 10%;
  //margin: auto;
}
</style>