<template>
  <video :id="myId" :autoplay="srcObject"></video>
</template>

<script>
  export default {
    name: "myVideo",
    mounted() {
      this.videoElement = document.getElementById(this.myId)
      this.videoElement.style.transform = this.mirror ? "rotateY(180deg)" : ""
      this.videoElement.srcObject = this.srcObject;
    },
    props: ["srcObject", "mirror", "myId"],
    watch: {
      srcObject(newValue) {
          this.videoElement.srcObject = newValue
      },
      mirror(newValue) {
        this.videoElement.style.transform = newValue ? "rotateY(180deg)" : ""
        this.videoElement.srcObject = this.srcObject
      }
    }
  }
</script>

<style scoped>

</style>
