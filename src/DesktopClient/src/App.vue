<template>
  <div>
    <login-page v-show="page==='login'" @join="page='main'"></login-page>
    <main-page v-if="page==='main'" @back="page='login'"></main-page>
  </div>
</template>

<script>
import loginPage from "./pages/loginPage";
import mainPage from "./pages/mainPage";
export default {
  name: 'App',

  components: {
    mainPage,
    loginPage,
  },

  data(){
    return{
      page : 'login',
    }
  },

  methods :{
  }
};
</script>
<style>
html::-webkit-scrollbar{
  display: none;
}
</style>
