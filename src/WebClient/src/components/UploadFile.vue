<template>
  <div class="file-card">
    <div class="file-content">
      <v-container>
        <v-row>
          <v-col cols="1">
            <v-badge
                bordered
                color="success"
                icon="mdi-check"
                overlap
                :value="uploaded"
            >
              <v-icon color="teal" size="25px">mdi-{{icon}}</v-icon>
            </v-badge>
          </v-col>
          <v-col cols="7">
            <p class="file-card-text"> {{this.file.name}} </p>
          </v-col>
          <v-col align="right" cols="2">
            <p class="file-card-progress"> {{this.progress}}% </p>
          </v-col>
          <v-col align="center" cols="2">
            <v-btn small icon  @click="upload" color="teal" :loading="uploading">
              <v-icon>
                mdi-reload
              </v-icon>
            </v-btn>
          </v-col>
        </v-row>
        <v-row dense>
          <v-col>
            <v-progress-linear v-model="progress" color="teal">
            </v-progress-linear>
          </v-col>
        </v-row>
      </v-container>
    </div>
  </div>
</template>

<script>
import axios from "axios";
import FormData from "form-data";

export default {
  name: "UploadFile",
  data(){
    return{
      progress : 0,
      icon : 'close',
      uploaded : false,
      uploading : false,
      map4icon : {
        'image/x-ms-bmp' : 'file-image-outline',
        'image/jpeg' : 'file-image-outline',
        'image/gif' : 'file-image-outline',
        'image/png' : 'file-image-outline',
        'image/tiff' : 'file-image-outline',
        'image/x-targa' : 'file-image-outline',
        'image/vnd.adobe.photoshop' : 'file-image-outline',
        'audio/mpeg' : 'file-music-outline',
        'audio/midi' : 'file-music-outline',
        'audio/ogg' : 'file-music-outline',
        'audio/mp4' : 'file-music-outline',
        'audio/wav' : 'file-music-outline',
        'audio/x-ms-wma' : 'file-music-outline',
        'video/x-msvideo' : 'file-video-outline',
        'video/x-dv' : 'file-video-outline',
        'video/mp4' : 'file-video-outline',
        'video/mpeg' : 'file-video-outline',
        'video/quicktime' : 'file-video-outline',
        'video/x-ms-wmv' : 'file-video-outline',
        'video/x-flv' : 'file-video-outline',
        'video/x-matroska' : 'file-video-outline',
        'text/plain' : 'file-document-outline',
        'text/x-php'  : 'language-php',
        'text/html' : 'language-html5',
        'text/javascript' : 'language-javascript',
        'text/css' : 'language-css3',
        'text/rtf' : 'file-document-outline',
        'text/rtfd' : 'file-document-outline',
        'text/x-python' : 'language-python',
        'text/x-java-source' : 'language-java',
        'text/x-ruby' : 'language-ruby',
        'text/x-shellscript' : 'powershell',
        'text/x-perl' : 'file-document-outline',
        'text/x-sql' : 'file-document-outline',
        'application/x-msdownload' : 'download',
        'application/postscript' : 'file-question-outline',
        'application/octet-stream' : 'file-question-outline',
        'application/vnd.ms-word' : 'file-word-outline',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document' :  'file-word-outline',
        'application/vnd.ms-excel' : 'file-excel-outline',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' : 'file-excel-outline',
        'application/vnd.ms-powerpoint' : 'file-powerpoint-outline',
        'application/vnd.openxmlformats-officedocument.presentationml.presentation' : 'file-powerpoint-outline',
        'application/pdf' : 'file-pdf-outline',
        'application/xml' : 'file-question-outline',
        'application/vnd.oasis.opendocument.text' : 'file-question-outline',
        'application/x-shockwave-flash' : 'file-question-outline',
        'application/x-gzip' : 'folder-zip-outline',
        'application/x-bzip2' : 'folder-zip-outline',
        'application/zip' : 'folder-zip-outline',
        'application/x-rar' : 'folder-zip-outline',
        'application/x-tar' : 'folder-zip-outline',
        'application/x-7z-compressed' : 'folder-zip-outline',
        'application/x-zip-compressed' : 'folder-zip-outline',
        'default':'file-question-outline',
      },
    }
  },
  props : ['message', 'file'],
  methods:{
    async upload(){
      let url = this.GLOBAL.baseURL + '/file?token=' + this.GLOBAL.userInfo.token;
      this.progress = 0;
      this.uploaded = false;
      this.uploading = true;
      console.log(this.file);
      const formData = new FormData();
      formData.append('file', this.file);
      try {
        const response = await axios({
          method: "post",
          url,
          data: formData,
          headers:{'Content-Type': 'multipart/form-data'},
          onUploadProgress: (evt) => {
            this.progress = ((evt.loaded / evt.total) * 100).toFixed(2);
          }
        })
        console.log(response);
        this.uploaded = true;
        this.uploading = false;
        this.$emit('file-sended', response.data, this.file)
      }catch(error){
        console.error(error)
        this.uploading = false;
      }
    }
  },
  mounted() {
    console.log(this.file.type);
    if (this.file.type in this.map4icon)
      this.icon = this.map4icon[this.file.type];
    else this.icon = this.map4icon['default'];
    this.upload();
  }
}
</script>

<style scoped>
.file-card{
  padding: 0px 10px 10px 10px;
}
.file-content{
  background : white;
  width: 350px;
  border-radius: 10px;
  border: 2px solid teal;
}
.file-card-text{
  font-family: "Microsoft YaHei UI", serif;
  font-size: 15px;
  color: #00796B;
  padding: 0;
  width: 195px;
  margin: 0 5px;
  overflow: hidden;
  text-overflow:ellipsis;
  white-space: nowrap;
}
.file-card-progress{
  font-family: "Microsoft YaHei UI", serif;
  font-size: 10px;
  color: #00796B;
  padding: 0;
  margin: 10px 10px 0 0;
  text-align: right;
}
</style>
