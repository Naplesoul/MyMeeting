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
        class="teal lighten-5 register-card"
        elevation="10"
    >
      <v-form
          ref="form"
          v-model="valid">
      <v-container>
        <v-row>
          <v-col class="title1 teal--text">
            注 册
          </v-col>

        </v-row>
        <v-row>
          <v-text-field
              v-model="email"
              append-icon="mdi-email"
              :rules="emailRules"
              label="邮箱"
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
                @click="sendEmail"
                :loading="loading"
                :disabled="loading ||!valid"
            >
              {{btnText}}
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
      btnText : "发送邮件",
      loading : false,
      snack : false,
      snackText : "",
      valid : false,
      emailRules: [
        v => !!v || '请输入邮箱地址',
        v => /.+@.+\..+/.test(v) || '邮箱地址格式错误',
      ],
    }
  },
  methods:{
    back(){
      this.$emit('back');
    },
    async sendEmail(){
      this.loading = true;
      try{
        const response =await axios(
            {
              method : 'post',
              url : this.GLOBAL.baseURL + '/email',
              data : {
                'email' : this.email,
              }
            })
        this.GLOBAL.email = this.email
        this.snackText = '发送成功';
        this.snack = true;
        this.btnText = '再次发送';
        this.loading = false;
        console.log(response);
        setTimeout(()=>{this.$emit('next');},1000)
      }catch(error){
        if (error.response){
          this.snackText = error.response.data.error;
        }
        else{
          this.snackText = '无法连接至服务器'
        }
        this.snack = true;
        this.btnText = '再次发送邮件';
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