<template>
  <div :class="['td-cube', {'td-cube-main': !account}]">
    <ul :class="[{'page1': currentPage === 'Login',
         'page2': currentPage === 'Register',
         'page3': currentPage === 'Verify',
         'page4': currentPage === 'Password',
         'page5': currentPage === 'Settings',
         'page6': !account, 'rot':rot}, 'ul-page']">
      <li :class="[{'main':!account}, 'front']">
        <transition name="cols-transition">
          <login @register="currentPage='Register'" @login="currentPage='Settings'" v-if="!rot"></login></transition>
      </li>
      <li :class="[{'main':!account}, 'back']">
        <transition name="cols-transition">
          <Register @back="currentPage='Login'" @next="currentPage='Verify'" v-if="!rot"></Register></transition>
      </li>
      <li :class="[{'main':!account}, 'top']">
        <transition name="cols-transition">
          <Verify @back="currentPage='Register'" @ok="currentPage='Password'" v-if="!rot"></Verify></transition>
      </li>
      <li  :class="[{'main':!account}, 'bottom']">
        <transition name="cols-transition">
          <Password @finish="currentPage='Login'" v-if="!rot"></Password></transition>
      </li>
      <li  :class="[{'main':!account}, 'left']"></li>
      <li  :class="[{'main':!account}, 'right']">
        <transition name="cols-transition">
          <Settings id="setting-page" @logout="currentPage='Login'" @back="backToMain" v-if="currentPage==='Settings' && !rot"></Settings></transition>
      </li>
    </ul>
    <div v-if="rot">
      <v-icon class="hint" @click="openSettings" size="40px">mdi-cogs</v-icon>
    </div>
  </div>
</template>

<script>
import Login from './Login'
import Register from "./Register";
import Verify from "./Verify";
import Password from "./Password";
import Settings from "./Settings"

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
$width: 50vh;
$height: 50vh;
$length: 50vh;
.td-cube {
  width: $width;
  height: $height;
  perspective: 75vh;
  transition: 0.5s ease-out;
  position: absolute;
  top: 23vh;
  left: calc(50vw - 25vh);
}
.td-cube.td-cube-main {
  transition: 0.5s ease-out;
  top: -20vh;
  left: calc(100vw - 30vh);
}
.hint{
  text-align: center;
  position: relative;
  top: -27vh;
  left: 23vh;
  color: white;
  transition: 0.15s ease-in-out;
}
.hint:hover{
  cursor: pointer;
  transform: scale(1.2);
  transition: 0.15s ease-in-out;
}
li {
    position: absolute;
    width: $width;
    height: $height;
    overflow: hidden;
}
.ul-page{
  display: flex;
  width: 100%;
  height: 100%;
  transform-style: preserve-3d;
  transition: 0.5s ease-in-out;
  padding: 0;
}
.ul-page.rot {
  transition: 0.5s ease-in-out;
  animation: rotate 12s infinite linear;
}
.ul-page.page1{
  transform: rotateY(0deg);
  transition: 0.8s ease-in-out;
}
.ul-page.page2{
  transform: rotateY(180deg);
  transition: 0.8s ease-in-out;
}
.ul-page.page3{
  transform: rotateX(-90deg) rotateY(0);
  transition: 0.8s ease-in-out;
}
.ul-page.page4{
  transform: rotateX(90deg) rotateY(0);
  transition: 0.8s ease-in-out;
}
.ul-page.page5{
  transform: rotateX(0) rotateY(-90deg);
  transition: 0.8s ease-in-out;
}
.ul-page.page6{
  transition: 1s ease-out;
  //animation: rotate 8s infinite linear;
  transform: rotateY(0) rotateX(35deg) rotateZ(45deg) scaleX(0.1) scaleY(0.1) scaleZ(0.1);
}
.front {
  background-color: #10222077;
  transform: translateZ($length / 2);
}
.front.main {
  background-image: linear-gradient(to bottom left, #00695C55, #00897Bff);
  transition: 0.7s ease-in-out;
  border: 20px solid #80CBC4;
}
.back {
  background-color: #10222077;
  transform: rotateY(180deg) translateZ($length / 2);
}
.back.main {
  background-image: linear-gradient(to bottom left, #00695C55, #00897Bff);
  transition: 0.7s ease-in-out;
  border: 20px solid #80CBC4;
}
.top {
  background-color: #10222077;
  transform: rotateX(90deg) translateZ($height / 2);
}
.top.main {
  background-image: linear-gradient(to bottom left, #00695C55, #00897Bff);
  transition: 0.7s ease-in-out;
  border: 20px solid #80CBC4;
}
.bottom {
  background-color: #10222077;
  transform: rotateX(-90deg) translateZ($height / 2);
}
.bottom.main {
  background-image: linear-gradient(to bottom left, #00695C55, #00897Bff);
  transition: 0.7s ease-in-out;
  border: 20px solid #80CBC4;
}
.left {
  background-color: #10222077;
  transform: rotateY(-90deg) translateZ($width / 2);
}
.left.main {
  background-image: linear-gradient(to bottom left, #00695C55, #00897Bff);
  transition: 0.7s ease-in-out;
  border: 20px solid #80CBC4;
}
.right {
  background-color: #10222077;
  transform: rotateY(90deg) translateZ($width / 2);
}
.right.main {
  background-image: linear-gradient(to bottom left, #00695C55, #00897Bff);
  transition: 0.7s ease-in-out;
  border: 20px solid #80CBC4;
}

.cols-transition-enter, .cols-transition-leave-to{
  opacity: 0;
}
.cols-transition-leave, .cols-transition-enter-to{
  opacity: 1;
}
.cols-transition-enter-active, .cols-transition-leave-active{
  transition: all 0.7s ease-in-out;
}

@keyframes rotate {
 from {
   transform: rotateY(0) rotateX(35deg) rotateZ(45deg) scaleX(0.1) scaleY(0.1) scaleZ(0.1);
 }
 to {
   transform: rotateY(-1turn) rotateX(35deg) rotateZ(45deg) scaleX(0.1) scaleY(0.1) scaleZ(0.1);
 }
}
</style>
