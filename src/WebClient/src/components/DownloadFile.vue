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
                :value="downloaded"
            >
            <v-icon color="teal" size="25px">mdi-{{icon}}</v-icon>
            </v-badge>
          </v-col>
          <v-col cols="7">
            <p class="file-card-text"> {{this.message.filename}} </p>
          </v-col>
          <v-col align="right" cols="2">
            <p class="file-card-progress"> {{this.progress}}% </p>
          </v-col>
          <v-col align="center" cols="2">
            <v-btn small icon @click="download" color="teal" :loading="downloading">
              <v-icon>
                {{downloaded?'mdi-reload':'mdi-download-outline'}}
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

export default {
  name: "DownloadFile",
  data(){
    return{
      progress : 0,
      icon : 'close',
      downloaded : false,
      downloading : false,
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
  props : ['message'],
  methods:{
    async download(){
      let url = this.message.fileURL;
      this.progress = 0;
      this.downloaded = false
      this.downloading = true
      try {
        const response = await axios({
          method: "get",
          url,
          responseType: "blob",
          onDownloadProgress: (evt) => {
            this.progress = ((evt.loaded / evt.total) * 100).toFixed(1);
          }
        })
        console.log(response);
        this.downloaded = true;
        this.downloading = false;
        const filename = this.message.filename;
        const blob = new Blob([response.data]);
        var downloadElement = document.createElement("a");
        var href = window.URL.createObjectURL(blob);
        downloadElement.href = href;
        downloadElement.download = decodeURIComponent(filename);
        document.body.appendChild(downloadElement);
        downloadElement.click();
        document.body.removeChild(downloadElement);
        window.URL.revokeObjectURL(href);
      }catch(error){
        console.error(error)
        this.downloading = false;
      }
    }
  },
  mounted() {
    if (this.message.fileType in this.map4icon)
      this.icon = this.map4icon[this.message.fileType];
    else this.icon = this.map4icon['default'];
  }
}
</script>

<style scoped>
.file-card{
  padding: 10px 15px;
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
  margin: 8px 0 0 0;
  text-align: right;
}
</style>
