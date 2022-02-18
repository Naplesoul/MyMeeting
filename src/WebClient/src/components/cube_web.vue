<template>
  <div :class="['td-cube', {'td-cube-main': !account}]">
    <transition name="cols-transition" mode="out-in">
      <login @register="currentPage='Register'" @login="currentPage='Settings'" v-if="currentPage === 'Login'"></login>
      <Register @back="currentPage='Login'" @next="currentPage='Verify'" v-if="currentPage === 'Register'"></Register>
      <Verify @back="currentPage='Register'" @ok="currentPage='Password'" v-if="currentPage === 'Verify'"></Verify>
      <Password @finish="currentPage='Login'" v-if="currentPage === 'Password'"></Password>
      <Settings @logout="currentPage='Login'" @back="backToMain" v-if="currentPage==='Settings' && account"></Settings>
    </transition>
    <div class="fake-page" v-if="account"></div>

    <div v-if="!account">
      <v-icon class="hint" @click="openSettings" size="40px">mdi-cogs</v-icon>
    </div>
  </div>
</template>

<script>
import Login from './Login_Web'
import Register from "./Register_Web";
import Verify from "./Verify_Web";
import Password from "./Password_Web";
import Settings from "./Settings_Web"

export default {
  components:{
    Login,
    Register,
    Verify,
    Password,
    Settings,
  },

  data() {
    return {
      pages : ['Login', 'Register', 'Verify', 'Password', 'Settings'],
      currentPage : 'Login',
      rot : false,
    };
  },

  props:{
    account : Boolean,
  },

  methods: {
    backToMain(){
      this.$emit('back');
      setTimeout(()=>{
        this.rot = true;
      }, 1000)
    },
    openSettings(){
      if (this.rot){
        this.rot = false;
        setTimeout(()=>{
          this.$emit('settings');
        }, 200);
      }
    }
  },

  created() {
  }
};
</script>
<style lang="scss" scoped>

.td-cube {
  width: 100vh;
  height: 100vh;
  transition: 0.5s ease-out;
  position: absolute;
  left: 0;
  top: 0;
}
.td-cube.td-cube-main {
  transition: 0.5s ease-out;
  top: 0;
  left: 100vw;
}
.hint{
  text-align: center;
  position: relative;
  top: 10px;
  left: -50px;
  color: white;
  transition: 0.15s ease-in-out;
}
.hint:hover{
  cursor: pointer;
  transform: scale(1.2);
  transition: 0.15s ease-in-out;
}

.cols-transition-enter, .cols-transition-leave-to{
  opacity: 0;
}
.cols-transition-leave, .cols-transition-enter-to{
  opacity: 1;
}
.cols-transition-enter-active, .cols-transition-leave-active{
  transition: all 0.3s ease-in-out;
}

.fake-page{
  width: calc(312px + 10vw);
  height: 12px;
  position: absolute;
  bottom: calc(60vh - 220px);
  z-index: 1;
  left: calc(45vw - 156px);
  border: 6px solid #A7FFEB;
}
</style>