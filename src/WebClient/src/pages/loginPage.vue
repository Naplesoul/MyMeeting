<template>
  <v-app class="mymeeting-app">
    <v-main class="main">
      <cube :account="page === 'account'" @settings="page = 'account'" @back="page = 'main'"></cube>
      <transition name="test">
        <Main v-show="page === 'main'" @join="$emit('join')"></Main>
      </transition>
    </v-main>

    <v-footer padless v-if="page === 'account'" color="grey darken-4" class="white--text">
      <v-col
          class="text-center"
          cols="12"
      >
        - {{ new Date().getFullYear() }} — <strong>MyMeeting® </strong>-
      </v-col>
    </v-footer>
  </v-app>
</template>

<script>
import cube from "../components/cube_web";
import Main from "../components/Main_Web";
export default {
  name: 'loginPage',

  components: {
    cube,
    Main,
  },

  data(){
    return{
      page : 'account',
    }
  },
};
</script>
<style>
html::-webkit-scrollbar{
  display: none;
}
.test-enter,.test-leave-to{
  opacity: 0;
}
.test-enter-to,.test-leave{
  opacity: 1;
}
.test-leave-active{
  transition: all 0.5s;
}
.main{
  background-color: #102220;
}
.appbar-title{
  -webkit-app-region: drag;
  width: 100%;
}
</style>