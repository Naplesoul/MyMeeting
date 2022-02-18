<template>
  <v-app id="mainWindow">
    <v-snackbar
        top
        color="red white--text"
        timeout="1600"
        light
        v-model="snack">
      {{snackText}}
    </v-snackbar>
    <v-app-bar
        app
        clipped-right
        flat
        height="45"
    >
      <div>
        <v-menu
            bottom
            right
            nudge-right="40px"
            transition="scale-transition"
            attach
            max-width="400px"
            max-height="200px"
        >
          <template v-slot:activator="{ on, attrs }">
            <v-btn small v-bind="attrs" v-on="on" icon color="gray" style="margin-left: 5px">
              <v-icon>mdi-information-outline</v-icon>
            </v-btn>
          </template>
          <v-card>
            <v-card-text>
              <div>会议主题 : {{GLOBAL.roomInfo.topic}}</div>
              <div>会议号 : {{GLOBAL.roomInfo.id}}</div>
              <div>会议密码 : {{GLOBAL.roomInfo.password}}</div>
              <div>开始时间 : {{GLOBAL.roomInfo.start_time}}</div>
              <div>结束时间 : {{GLOBAL.roomInfo.end_time}}</div>
            </v-card-text>
          </v-card>
        </v-menu>
      </div>

      <v-spacer></v-spacer>

      <div style="font-size: small; color: grey;">会议号 : {{GLOBAL.roomInfo.id}}</div>

      <v-spacer></v-spacer>

      <div>
        <v-chip small>
          <v-icon left>
            mdi-clock-outline
          </v-icon>
          {{currTime}}
        </v-chip>
        <v-btn text color="red" @click="exitDialog = true">
          <v-icon color="red" left size="20">mdi-exit-to-app</v-icon>退出
        </v-btn>
        <v-dialog
                v-model="exitDialog"
                width="500"
                attach="#mainWindow"
        >
          <v-card style="text-align: center; ">
            <p style="font-weight: bold; font-size: 20px; color: firebrick">结束会议</p>
            <p style="font-size: 12px; color: gray; margin: 20px 0 20px 0">
              {{(GLOBAL.roomInfo.host === GLOBAL.userInfo.id) ?
              "如果您不想结束会议，您可以在退出前指定新的主持人。" : "您要退出会议吗？"}}
            </p>
            <v-checkbox color="teal" v-model="exportMemeCheckBox" label="导出会议纪要" style="margin-left: 36%"></v-checkbox>
            <v-divider></v-divider>
            <div style="margin: 10px 0 0 0;">
              <v-btn outlined class="ma-2" @click="exitDialog = false">取消</v-btn>
              <v-btn outlined color="teal" class="ma-2" @click="leaveMeeting">退出会议</v-btn>
              <v-btn outlined color="red" class="ma-2" @click="closeMeeting" v-if="GLOBAL.roomInfo.host === GLOBAL.userInfo.id">结束会议</v-btn>
            </div>
          </v-card>
        </v-dialog>
      </div>

    </v-app-bar>

    <v-navigation-drawer
        v-model="drawer"
        app
        width="280"
    >
      <v-navigation-drawer
          v-model="drawer"
          absolute
          color="grey lighten-3"
          mini-variant
      >
        <v-avatar
            class="d-block text-center mx-auto mt-4"
            color="grey darken-1"
            size="36"
        >
          <v-img :src="GLOBAL.baseURL + GLOBAL.userInfo.portrait">
            <template v-slot:placeholder>
              <div style="margin-top: 7px">
                <v-progress-circular
                    indeterminate
                    size="20"
                    color="grey lighten-5"
                ></v-progress-circular>
              </div>
            </template>
          </v-img>
        </v-avatar>

        <v-divider class="mx-3 my-5"></v-divider>

        <v-btn
            icon
            class="d-block text-center mx-auto mb-9"
            :color="videoIcon.color"
            @click="videoSwitch">
          <v-icon>{{ this.videoIcon.icon }}</v-icon>
        </v-btn>

        <v-btn
            icon
            class="d-block text-center mx-auto mb-9"
            :color="microIcon.color"
            @click="microSwitch">
          <v-icon>{{ this.microIcon.icon }}</v-icon>
        </v-btn>

        <v-btn
            icon
            class="d-block text-center mx-auto mb-9"
            :color="screenIcon.color"
            @click="screenSwitch">
          <v-icon>{{ this.screenIcon.icon }}</v-icon>
        </v-btn>

        <v-btn
                icon
                class="d-block text-center mx-auto mb-9"
                :color="captionIcon.color"
                @click="captionSwitch">
          <v-icon>{{ this.captionIcon.icon }}</v-icon>
        </v-btn>

        <setting-dialog @changeSettings="changeSettings"></setting-dialog>

        <v-btn
            icon
            class="d-block text-center mx-auto mb-9"
            color="yellow darken-3"
            v-if="isHost"
            @click="muteAll">
          <v-badge
              color="yellow darken-3"
              content="all"
              light
              offset-x="28px"
              offset-y="-1px">
            <v-icon>mdi-microphone-off</v-icon>
          </v-badge>
        </v-btn>

      </v-navigation-drawer>

      <v-sheet
          color="grey lighten-5"
          height="120"
          width="100%"
      >
        <div id="sheetDiv">
          <p id="sheetTitle">
            参会成员
          </p>
          <v-text-field
              label="搜索成员"
              id="userSearchBar"
              color="teal"
              prepend-inner-icon="mdi-account-circle-outline"
              outlined
              clearable
              style="margin-left: 2%; width: 95%"
              v-model="filterText"></v-text-field>
        </div>
      </v-sheet>

      <v-list
          class="pl-14"
      >
        <v-badge :value="isHost" icon="mdi-crown" color="orange--text" overlap offset-x="20px" offset-y="18px">
          <v-list-item :class="['lighten-4 not-host-item', {'host-item':isHost}]" dense>
            <v-fade-transition>
              <v-badge overlap offset-x="-40px" offset-y="0px" icon="mdi-video-outline" color="green--text" transition="fade-transition" v-show="this.video">
              </v-badge>
            </v-fade-transition>
            <v-fade-transition>
              <v-badge overlap offset-x="-40px" offset-y="15px" icon="mdi-microphone-outline" color="green--text" transition="scale-transition" v-show="this.audio">
              </v-badge>
            </v-fade-transition>
            <v-list-item-avatar style="border: 1px solid gray" size="40">
              <v-img :src="GLOBAL.baseURL + GLOBAL.userInfo.portrait">
                <template v-slot:placeholder>
                  <div style="margin-top: 7px; margin-left: 8px">
                    <v-progress-circular
                            indeterminate
                            size="20"
                            color="grey lighten-5"
                    ></v-progress-circular>
                  </div>
                </template>
              </v-img>
            </v-list-item-avatar>
            <v-list-item-content>
              <v-list-item-title class="item-title" align="center" style="font-size: 18px;font-weight: bold;width: 120px;padding-top: 8px;">
                {{GLOBAL.userInfo.nickname}}
              </v-list-item-title>
              <v-list-item-subtitle align="center">
                <v-btn icon @click="mainVideo(GLOBAL.userInfo.id)">
                  <v-icon color="teal" size="20">
                    mdi-account-star
                  </v-icon>
                </v-btn>
                <v-btn icon @click="subVideo(GLOBAL.userInfo.id)">
                  <v-icon color="teal" size="20">
                    mdi-account-plus
                  </v-icon>
                </v-btn>
              </v-list-item-subtitle>
            </v-list-item-content>
          </v-list-item>
        </v-badge>
        <v-badge :value="GLOBAL.roomInfo.host === user.getPeerInfo().id" icon="mdi-crown" color="orange--text"
                 overlap offset-x="20px" offset-y="18px"
                 v-for="(user, index) in this.filteredUsers"
                 :key="index">
          <v-list-item style="width: 100%" dense
               :class="['lighten-4 not-host-item', {'host-item':GLOBAL.roomInfo.host === user.getPeerInfo().id}]"
          >
            <v-fade-transition>
              <v-badge overlap offset-x="-40px" offset-y="0px" icon="mdi-video-outline" color="green--text" transition="fade-transition" v-show="user.hasVideo()">
              </v-badge>
            </v-fade-transition>
            <v-fade-transition>
              <v-badge overlap offset-x="-40px" offset-y="15px" icon="mdi-microphone-outline" color="green--text" transition="scale-transition" v-show="user.hasAudio()">
              </v-badge>
            </v-fade-transition>
            <v-list-item-avatar style="border: 1px solid gray" size="40">
              <v-img :src="user.getPeerInfo().avatar">
                <template v-slot:placeholder>
                  <div style="margin-top: 7px; margin-left: 8px">
                    <v-progress-circular
                        indeterminate
                        size="20"
                        color="grey lighten-5"
                    ></v-progress-circular>
                  </div>
                </template>
              </v-img>
            </v-list-item-avatar>
            <v-list-item-content>
              <v-list-item-title class="item-title" align="center" style="font-size: 18px;font-weight: bold;width: 120px;padding-top: 8px;">
                {{user.getPeerInfo().displayName}}
              </v-list-item-title>
              <v-list-item-subtitle align="center">
                <v-menu
                    attach>
                  <template v-slot:activator="{on, attrs}">
                    <v-btn
                        v-bind="attrs"
                        v-on="on"
                        icon>
                      <v-icon size="20" color="teal">mdi-cog-outline</v-icon>
                    </v-btn>
                  </template>
                  <v-list class="white" dense>
                    <v-list-item
                        v-for="(item, index) in menuItems"
                        :key="index"
                        @click="switchMenuFunc(index, user.getPeerInfo().id)">
                      <v-list-item-icon>
                        <v-icon :color="item.color">
                          {{item.icon}}
                        </v-icon>
                      </v-list-item-icon>
                      <v-list-item-title>{{item.text}}</v-list-item-title>
                    </v-list-item>
                  </v-list>
                </v-menu>
                <v-btn icon v-if="isHost">
                  <v-icon color="orange" size="20">mdi-microphone-off</v-icon>
                </v-btn>
                <v-btn icon v-if="isHost">
                  <v-icon color="orange" size="20px">mdi-account-remove</v-icon>
                </v-btn>
              </v-list-item-subtitle>
            </v-list-item-content>
          </v-list-item>
        </v-badge>
      </v-list>
    </v-navigation-drawer>

    <v-navigation-drawer
        app
        clipped
        right
    >
      <v-list>
        <v-list-item
            v-for="(user, index) in subFollowUsers"
            :key="index"
            link
        >
          <v-list-item-content>
            <v-hover v-slot="{hover}">
              <v-card
                  height="150px"
                  outlined>

                <my-video :src-object="user.mediaStream" :mirror="user.mirror" :my-id="'sub-video' + index" process-video-type="blur"
                          style="width: 100%; height: 100%"></my-video>
                <div
                    class="d-flex white black--text v-card--reveal"
                    style="height: 15%; margin-bottom: 10px;">
                  <div style="width: 100px; margin-left: 25%; margin-right: 10%; text-align: center;">
                    <p id="rightSideBarText" style="font-size: 12px; font-weight: bold;">
                      {{user.displayName}}
                    </p>
                  </div>
                  <v-fab-transition>
                    <div v-if="hover">
                      <v-btn icon x-small @click="sub2Main(index)">
                        <v-icon color="teal">
                          mdi-account-star
                        </v-icon>
                      </v-btn>
                      <v-btn icon x-small @click="removeSubFollowUser(index)">
                        <v-icon color="teal">
                          mdi-close
                        </v-icon>
                      </v-btn>
                    </div>
                  </v-fab-transition>
                </div>
              </v-card>
            </v-hover>
          </v-list-item-content>
        </v-list-item>
      </v-list>
    </v-navigation-drawer>

    <v-main style="text-align: center" id="main-video-window">
      <div id="mainVideo">
        <v-hover v-slot="{hover}">
          <v-card color="grey lighten-4" height="100%" width="100%">
            <my-video style="height: 100%; width: 100%" my-id="main-video" :mirror="mainFollowUser.mirror" :src-object="mainFollowUser.mediaStream"></my-video>
            <v-expand-transition>
              <div v-if="hover"
                   class="transition-fast-in-fast-out v-card--reveal-1"
                   style="height: 10% ">
                <p style="color: white;font-weight: bold; height: 10%" v-if="mainFollowUserId">
                  {{mainFollowUser.displayName}}
                </p>
                <v-btn icon @click="removeMainFollowUser" v-if="mainFollowUserId">
                  <v-icon small color="white">mdi-close</v-icon>
                </v-btn>
              </div>
            </v-expand-transition>
          </v-card>
        </v-hover>
      </div>
      <v-fade-transition>
        <div id="chatOverlay" v-show="chatOverlay">
          <v-container id="chatContainer" :class="['chatContainer-full', {'chatContainer-half' : captionIcon.icon === 'mdi-translate'}]">
            <v-row v-for="(msg, index) in allMsgs" :key="index">
              <v-col>
                <div style="display: inline-block" class="messageCard">
                  <v-avatar
                          color="grey darken-1"
                          size="30"
                          style="margin-right: 8px;">
                    <v-img :src="(msg.fromMyself) ?
                        GLOBAL.baseURL + GLOBAL.userInfo.portrait :
                        mediaService.getPeerDetailByPeerId(msg.fromPeerId).getPeerInfo().avatar">
                      <template v-slot:placeholder>
                        <div style="margin-top: 7px">
                          <v-progress-circular
                                  indeterminate
                                  size="20"
                                  color="grey lighten-5"
                          ></v-progress-circular>
                        </div>
                      </template>
                    </v-img>
                  </v-avatar>
                  <div style="display: inline-block; font-size: 15px">
                      <span style="font-weight: bold; margin-right: 5px; margin-left: 5px;">{{(msg.fromMyself) ?
                              GLOBAL.userInfo.nickname :
                              mediaService.getPeerDetailByPeerId(msg.fromPeerId).getPeerInfo().displayName}}</span>
                    <span v-if="!msg.broadcast"> to </span>
                    <span  v-if="!msg.broadcast" class="private-chat">{{formatToPeerName(msg)}} </span>
                  </div>
                  <p class="messageText" v-if="msg.type === MessageType.text">{{msg.text}}</p>
                  <upload-file
                          :file="msg.file"
                          v-else-if="msg.type === MessageType.file &&msg.fromMyself"
                          @file-sended="sendFile" style="margin-top:20px; margin-left: 15px"></upload-file>
                  <download-file :message="msg" v-else style="margin-top:15px"></download-file>
                </div>
                <div style="display: inline-block; margin:10px; font-size: small; color: gray">{{moment(msg.timestamp).format('HH:mm:ss')}}</div>
              </v-col>
            </v-row>
          </v-container>
          <v-container id="captionContainer" v-if="captionIcon.icon === 'mdi-translate'">
              <v-row v-for="(caption, index) in allCaptions" :key="index">
                <v-col>
                  <div style="display: inline-block" class="messageCard">
<!--                    <v-avatar-->
<!--                            color="grey darken-1"-->
<!--                            size="30"-->
<!--                            style="margin-right: 8px;">-->
<!--                      <v-img :src="mediaService.getPeerDetailByPeerId(caption.fromPeerId).getPeerInfo().avatar">-->
<!--                        <template v-slot:placeholder>-->
<!--                          <div style="margin-top: 7px">-->
<!--                            <v-progress-circular-->
<!--                                    indeterminate-->
<!--                                    size="20"-->
<!--                                    color="grey lighten-5"-->
<!--                            ></v-progress-circular>-->
<!--                          </div>-->
<!--                        </template>-->
<!--                      </v-img>-->
<!--                    </v-avatar>-->
                    <div style="display: inline-block; font-size: 15px">
                      <span style="font-weight: bold; margin-right: 10px; margin-left: 5px;">
                             {{caption.displayName}}</span>
                    </div>
                    <p class="messageText">{{caption.text}}</p>
                  </div>
                  <div style="display: inline-block; margin:10px; font-size: small; color: gray">{{moment(caption.startTime).format('HH:mm:ss')}} - {{moment(caption.updateTime).format('HH:mm:ss')}}</div>
                </v-col>
              </v-row>
            </v-container>
        </div>
      </v-fade-transition>
    </v-main>

    <v-footer
        app
        color="transparent"
        height="72"
        inset
    >
      <div @click="switchChat(null)" style="margin-right: 5px">
        <v-btn icon>
          <v-fab-transition>
            <v-badge
                v-if="!chatOverlay"
                :color="this.chatBadge"
                light
                dot>
              <v-icon color="teal">mdi-chat-outline</v-icon>
            </v-badge>
            <v-icon v-else color="teal">mdi-chat-remove-outline</v-icon>
          </v-fab-transition>
        </v-btn>
      </div>
      <v-text-field
          background-color="grey lighten-4"
          dense
          hide-details
          rounded
          outlined
          color="teal"
          :label="placeholdOfMsg"
          @focus="switchChat(true)"
          @keyup.enter="sendMsg"
          v-model="inputMsg"
      >
        <template v-slot:append>
          <v-menu
              top
              left
              nudge-top="50px"
              nudge-right="50px"
              min-width="150px"
              max-width="500px"
              attach
              close-on-content-click
              transition="scale-transition">
            <template v-slot:activator="{on, attrs}">
              <v-icon
                  :disabled="!chatOverlay"
                  color="teal"
                  v-bind="attrs"
                  v-on="on">
                mdi-broadcast</v-icon>
            </template>
            <v-list dense shaped>
              <v-list-item link @click="privateChat(null)">
                <v-list-item-content style="font-size: 15px; font-family: 'Cascadia Mono'">
                  All
                </v-list-item-content>
              </v-list-item>
              <v-list-item
                  v-for="(user, index) in allUsers"
                  :key="index"
                  link
                  @click="privateChat(user.getPeerInfo().id)">
                <v-list-item-content style="font-size: 15px; font-family: 'Cascadia Mono'">
                  {{user.getPeerInfo().displayName}}
                </v-list-item-content>
              </v-list-item>
            </v-list>
          </v-menu>
        </template>
      </v-text-field>
      <div>
        <v-menu
            top
            left
            nudge-top="50px"
            nudge-right="50px"
            attach
            transition="scale-transition"
            :close-on-content-click="false">
          <template v-slot:activator="{on, attrs}">
            <v-icon
                color="yellow darken-3"
                :disabled="!chatOverlay"
                style="margin-left:5px;"
                @click="showEmojiPicker = !showEmojiPicker"
                v-bind="attrs"
                v-on="on">
              mdi-emoticon-outline</v-icon>
          </template>
          <v-emoji-picker
              :emojiSize="24"
              :emojisByRow="5"
              @select="selectEmoji"></v-emoji-picker>
        </v-menu>
        <v-menu
            top
            left
            nudge-top="40px"
            attach
            min-width="200px"
            transition="scale-transition"
            :close-on-content-click="false">
          <template v-slot:activator="{on, attrs}">
            <v-icon
                color="blue"
                :disabled="!chatOverlay"
                style="margin-left:5px;margin-right: 5px;"
                @click="showFilePicker = !showFilePicker"
                v-bind="attrs"
                v-on="on">
              mdi-file</v-icon>
          </template>
          <v-file-input
              v-model="file"
              style="width: 180px"
              :clearable="false"
              append-icon="mdi-file-send-outline"
              @click:append="pickFile"></v-file-input>
        </v-menu>
        <v-icon color="teal" :disabled="!chatOverlay" @click="sendMsg">mdi-send</v-icon>
      </div>
    </v-footer>
  </v-app>

</template>

<script>
import {VEmojiPicker} from 'v-emoji-picker'
import {MediaService} from '../service/MediaService'
import MyVideo from "../components/myVideo"
import DownloadFile from "../components/DownloadFile"
import UploadFile from "../components/UploadFile";
import SettingDialog from "../components/SettingsDialog";
import axios from "axios";
import {MediaStreamFactory} from "@/utils/media/MediaStreamFactory";
import {BackgroundProcessType} from "@/utils/Types";
import {MeetingEndReason} from "@/ServiceConfig";

const moment = require("moment");

export default {
  name: "mainPage.vue",
  components : {
    SettingDialog,
    UploadFile,
    DownloadFile,
    MyVideo,
    VEmojiPicker
  },
  data () {
    return {
      mediaService : new MediaService(),
      drawer: null,
      isHost : false,
      videoIcon : {
        icon : 'mdi-video-outline',
        color : 'teal'
      },
      microIcon : {
        icon : 'mdi-microphone-outline',
        color : 'teal'
      },
      screenIcon : {
        icon : 'mdi-laptop-off',
        color : 'gray'
      },
      captionIcon : {
        icon : 'mdi-translate-off',
        color : 'gray'
      },
      chatBadge : '#00000000',
      chatOverlay : false,
      menuItems : [
        {
          icon : 'mdi-chat',
          color : 'green',
          text : '私聊',
          function : 'privateChat'
        },
        {
          icon : 'mdi-account-star',
          color: 'blue',
          text : '主关注',
          function: 'mainVideo'
        },
        {
          icon : 'mdi-account-plus',
          color: 'blue lighten-2',
          text : '侧关注',
          function: 'subVideo'
        },
      ],
      showEmojiPicker : false,
      showFilePicker : false,
      filterText : '',
      inputMsg : '',
      allMsgs : [],
      allUsers : [],
      mainFollowUserId : null,
      subFollowUserIds : [],
      mediaDevice : null,
      myVideoStream : new MediaStream(),
      myAudioStream : new MediaStream(),
      myDisplayAudioStream : new MediaStream(),
      mediaStreamFactory: new MediaStreamFactory(),
      video : false,
      audio : false,
      display : false,
      displayVideo: true,
      displayAudio: true,
      displaySourceId: null,
      moment : moment,
      placeholdOfMsg : '发送消息 to 所有人',
      privateChatPeerId : null,
      file : null,
      processVideoType : BackgroundProcessType.disable,
      snack : false,
      snackText : "",
      currTime : "",
      clock: null,
      allCaptions : [],
      exitDialog : false,
      exportMemeCheckBox : true
    }
  },
  methods: {
    async videoSwitch () {
      if (this.video) {
        this.video = false
        this.myVideoStream.getTracks().forEach((track) => {
          this.mediaService.closeTrack(track)
          this.myVideoStream.removeTrack(track)
        })
        this.mediaStreamFactory.stopCamera()
        this.videoIcon.icon = 'mdi-video-off'
        this.videoIcon.color = 'gray'

      } else {
        if (this.display) await this.screenSwitch()
        this.video = true
        this.myVideoStream.addTrack(await this.mediaStreamFactory.getProcessedCameraTrack(this.processVideoType, false))
        this.mediaService.sendMediaStream(this.myVideoStream)
        this.videoIcon.icon = 'mdi-video-outline'
        this.videoIcon.color = 'teal'
        if (this.mainFollowUserId !== this.GLOBAL.userInfo.id && this.subFollowUserIds.indexOf(this.GLOBAL.userInfo.id) === -1) {
          this.subFollowUserIds.push(this.GLOBAL.userInfo.id)
        }
      }
    },
    async microSwitch () {
      if (this.microIcon.icon === 'mdi-microphone-outline') {
        this.audio = false
        this.mediaService.speechRecognition.stop()
        this.myAudioStream.getTracks().forEach((track) => {
          this.mediaService.closeTrack(track)
          this.myAudioStream.removeTrack(track)
        })
        this.mediaStreamFactory.stopMicrophone();
        this.microIcon.icon = 'mdi-microphone-off'
        this.microIcon.color = 'gray'
      } else {
        this.audio = true
        this.mediaService.speechRecognition.start()
        this.myAudioStream.addTrack(await this.mediaStreamFactory.getMicrophoneTrack())
        this.mediaService.sendMediaStream(this.myAudioStream)
        this.microIcon.icon = 'mdi-microphone-outline'
        this.microIcon.color = 'teal'
      }
    },
    async screenSwitch () {
      if (this.screenIcon.icon === 'mdi-laptop') {
        this.display = false
        this.myVideoStream.getTracks().forEach((track) => {
          this.mediaService.closeTrack(track)
          this.myVideoStream.removeTrack(track)
        })
        this.myDisplayAudioStream.getTracks().forEach((track) => {
          this.mediaService.closeTrack(track)
          this.myDisplayAudioStream.removeTrack(track)
        })
        this.mediaStreamFactory.stopScreen();
        this.screenIcon.icon = 'mdi-laptop-off'
        this.screenIcon.color = 'gray'
      } else {
        if (this.video) await this.videoSwitch();
        this.display = true
        const {screenVideoTrack, screenAudioTrack} = await this.mediaStreamFactory.getScreenTracks(this.displayVideo, this.displayAudio, this.displaySourceId)
        if (this.displayVideo) {
          this.myVideoStream.addTrack(screenVideoTrack)
          this.mediaService.sendMediaStream(this.myVideoStream)
        }
        if (this.displayAudio) {
          this.myDisplayAudioStream.addTrack(screenAudioTrack)
          this.mediaService.sendMediaStream(this.myDisplayAudioStream)
        }
        this.screenIcon.icon = 'mdi-laptop'
        this.screenIcon.color = 'teal'
        if (this.mainFollowUserId !== this.GLOBAL.userInfo.id && this.subFollowUserIds.indexOf(this.GLOBAL.userInfo.id) === -1) {
          this.subFollowUserIds.push(this.GLOBAL.userInfo.id)
        }
      }
    },
    async captionSwitch () {
      if (this.captionIcon.icon === 'mdi-translate') {
        this.mediaService.speechRecognition.deleteSpeechListener('speechListener')
        this.captionIcon.icon = 'mdi-translate-off'
        this.captionIcon.color = 'gray'
      } else {
        this.mediaService.speechRecognition.registerSpeechListener('speechListener', (data) => {
          this.allCaptions = data
        })
        this.chatOverlay = true
        this.chatBadge = '#00000000'
        this.captionIcon.icon = 'mdi-translate'
        this.captionIcon.color = 'teal'
      }
    },
    switchChat (boolean) {
      let toStat;
      if (boolean == null) {
        toStat = !this.chatOverlay
      } else {
        toStat = boolean
      }

      if (!toStat) {
        this.chatOverlay = false
      } else {
        this.chatOverlay = true
        this.chatBadge = '#00000000'
        setTimeout(()=>{
          let col = document.getElementById('chatContainer');
          col.scrollTop = col.scrollHeight;
        }, 200)
      }
    },
    switchMenuFunc (index, userId) {
      switch (index) {
        case 0 :
        {
          this.privateChat(userId)
          break
        }
        case 1 :
        {
          this.mainVideo(userId)
          break
        }
        case 2 :
        {
          this.subVideo(userId)
          break;
        }
        default:
        {
          console.log(`switch menu function error!`)
        }
      }
    },
    privateChat (userId) {
      if (!this.chatOverlay) {
        this.chatOverlay = true
        setTimeout(()=>{
          let col = document.getElementById('chatContainer');
          col.scrollTop = col.scrollHeight;
        }, 200)
      }

      if (userId == null) {
        this.placeholdOfMsg =  this.placeholdOfMsg = '发送消息 to 所有人'
      } else {
        this.placeholdOfMsg = '发送消息 to ' + this.mediaService.getPeerDetailByPeerId(userId).getPeerInfo().displayName
      }

      this.privateChatPeerId = userId
    },
    mainVideo (userId) {
      for (let i = 0; i < this.subFollowUserIds.length; ++i) {
        if (this.subFollowUserIds[i] === userId) {
          this.subFollowUserIds.splice(i, 1)
          break
        }
      }

      this.mainFollowUserId = userId
      console.log('[Main Video]')
    },
    subVideo (userId) {
      if (this.mainFollowUserId === userId) {
        this.mainFollowUserId = null
      }

      if (this.subFollowUserIds.find((subUserId) => {
        return subUserId === userId
      })) {
        return;
      }

      if (userId === this.GLOBAL.userInfo.id) {
        this.subFollowUserIds.push(userId)
        return
      }

      this.subFollowUserIds.push(this.mediaService.getPeerDetailByPeerId(userId).getPeerInfo().id)

      console.log('[Add Sub Video]')
    },
    sendMsg () {
      if (this.inputMsg === '') {
        return
      }

      let timestamp = moment()

      this.mediaService.sendText(this.privateChatPeerId, this.inputMsg, timestamp)
      this.allMsgs.push({
        type : this.MessageType.text,
        broadcast : (!this.privateChatPeerId),
        fromMyself : true,
        fromPeerId : this.GLOBAL.userInfo.id,
        text : this.inputMsg,
        timestamp : timestamp,
        toPeerName : (!this.privateChatPeerId) ? '' :
            this.mediaService.getPeerDetailByPeerId(this.privateChatPeerId).getPeerInfo().displayName
      })
      this.inputMsg = ''

      console.log('send msgs')
    },
    sendFile (data, file) {

      let timestamp = moment()

      this.mediaService.sendFile(this.GLOBAL.baseURL+ data.path, timestamp, file.name, file.type)
      console.log('send file')
    },
    pickFile () {
      if (this.file) {
        let timestamp = moment()

        this.allMsgs.push({
          type : this.MessageType.file,
          file : this.file,
          broadcast : true,
          fromMyself : true,
          fromPeerId : this.GLOBAL.userInfo.id,
          timestamp : timestamp,
        })

      }
    },
    selectEmoji (emoji) {
      this.inputMsg += emoji.data
    },
    sub2Main (index) {
      let userId = this.subFollowUsers[index].id
      this.subFollowUserIds.splice(this.subFollowUserIds.indexOf(userId), 1)
      this.mainFollowUserId = userId
    },
    removeSubFollowUser (index) {
      this.subFollowUserIds.splice(index, 1)
    },
    removeMainFollowUser () {
      this.mainFollowUserId = null
    },
    async leaveMeeting () {
      if (this.exportMemeCheckBox) {
        this.exportMeme()
      }
      try {
        this.mediaStreamFactory.stopAll()
        await this.mediaService.leaveMeeting()
      } catch (error) {
        console.log('[LEAVE]', error)
      }

      this.$emit('back')
    },
    async closeMeeting () {
      if (this.exportMemeCheckBox) {
        this.exportMeme()
      }
      try {
        this.mediaStreamFactory.stopAll()
        await this.mediaService.closeRoom()
      } catch (error) {
        console.log('[LEAVE]', error)
      }

      this.$emit('back')
    },
    formatToPeerName (msg) {
      if (msg.broadcast) {
        return 'everyone'
      } else {
        if (msg.fromMyself) {
          return msg.toPeerName
        } else {
          return 'You'
        }
      }
    },
    muteAll() {
      this.snackText = "已静音所有人";
      this.snack = true;
      this.mediaService.mutePeer();
    },
    async changeSettings(blur, replace, backgroundImg, display) {
      const currentBackgroundOption = this.processVideoType
      if (blur) {
        this.processVideoType = BackgroundProcessType.blur
      } else if (replace) {
        this.processVideoType = BackgroundProcessType.virtual
        this.mediaStreamFactory.setBackground(backgroundImg)
      } else {
        this.processVideoType = BackgroundProcessType.disable
      }
      if (this.video && currentBackgroundOption !== this.processVideoType) {
        this.myVideoStream.getTracks().forEach((track) => {
          this.mediaService.closeTrack(track)
          this.myVideoStream.removeTrack(track)
        })
        this.myVideoStream.addTrack(await this.mediaStreamFactory.getProcessedCameraTrack(this.processVideoType, false))
        this.mediaService.sendMediaStream(this.myVideoStream)
      }
      const currentDisplayAudio = this.displayAudio
      const currentDisplayVideo = this.displayVideo
      const currentDisplaySourceId = this.displaySourceId
      this.displayAudio = display.audio
      this.displayVideo = display.video
      this.displaySourceId = display.id

      if (this.display) {
        const {screenVideoTrack, screenAudioTrack} = await this.mediaStreamFactory.getScreenTracks(this.displayVideo, this.displayAudio, this.displaySourceId);
        // 视频源变更或不需要视频，删除之前的视频流
        if (currentDisplayVideo && (!this.displayVideo || this.displaySourceId !== currentDisplaySourceId)) {
          this.myVideoStream.getTracks().forEach((track) => {
            this.mediaService.closeTrack(track)
            this.myVideoStream.removeTrack(track)
          })
        }
        if (currentDisplayAudio && (!this.displayAudio || this.displaySourceId !== currentDisplaySourceId)) {
          this.myDisplayAudioStream.getTracks().forEach((track) => {
            this.mediaService.closeTrack(track)
            this.myDisplayAudioStream.removeTrack(track)
          })
        }
        if (this.displayVideo) {
          this.myVideoStream.addTrack(screenVideoTrack)
          this.mediaService.sendMediaStream(this.myVideoStream)
        }
        if (this.displayAudio) {
          this.myDisplayAudioStream.addTrack(screenAudioTrack)
          this.mediaService.sendMediaStream(this.myDisplayAudioStream)
        }
      }
    },
    async getRoomInfo(){
      try{
        console.log('GET ROOM', this.GLOBAL.roomInfo)
        const response = await axios(
            {
              method : 'post',
              url : this.GLOBAL.baseURL + '/getRoom',
              data : {
                'id' : this.GLOBAL.roomInfo.id,
                'password' : this.GLOBAL.roomInfo.password,
              }
            })
        this.GLOBAL.roomInfo = response.data.room;
        this.snackText = '主持人变更';
        this.snack = true;
      } catch(error) {
        this.snackText = "与服务器失去连接"
        this.snack = true;
        setTimeout(()=>{this.$emit('back')},1600)
      }
    },
    exportMeme () {
      let fs = require('fs')
      let dialog = require('electron').remote.dialog
      let defaultFilePath = 'C:/' + moment().format('YYYY.MM.DD HH-mm-ss')
      dialog.showSaveDialog({
        title : '导出会议纪要',
        message : '选择导出路径',
        properties : 'openDirector',
        defaultPath : defaultFilePath,
        filters : [
        {name : 'txt', extensions : ['txt']}
      ]
      }).then((res) => {
        if (res.canceled) return
        let path = res.filePath
        let meme = this.mediaService.speechRecognition.exportMeme()
        fs.writeFile(path, meme,"utf-8",(err) => {
          if (err) {
            console.log(err)
          } else {
            console.log('store meme successfully!')
          }
        })
      })
    }
  },
  mounted() {
    this.clock = setInterval(()=>{
      let dur = moment.duration(moment().format('x')-moment(this.GLOBAL.roomInfo.start_time).format('x'));
      let hours = dur.hours()
      let minutes = dur.minutes()
      let seconds = dur.seconds()
      this.currTime = ((hours < 10) ? ('0' + hours) : hours) + ":" + ((minutes < 10) ? ('0' + minutes) : minutes) + ":" + ((seconds < 10) ? ('0' + seconds) : seconds);
    }, 1000)

  },
  destroyed() {
    clearInterval(this.clock);
  },
  async created() {
    this.mediaService.registerPeerUpdateListener('updateListener', () => {
      console.log('[User Update] HOST: ', this.mediaService.getHostPeerId())
      this.allUsers = this.mediaService.getPeerDetails()

      // this.subFollowUserIds.forEach((id, index) => {
      //   if ((id !== this.GLOBAL.userInfo.id) && (!this.allUsers.find((user) => {
      //     return user.id = id
      //   }))) {
      //     this.subFollowUserIds.splice(index, 1)
      //   }
      // })

      if(this.mediaService.getHostPeerId() !== this.GLOBAL.roomInfo.host){
        this.GLOBAL.roomInfo.host = this.mediaService.getHostPeerId();
        this.snackText = "主持人变更";
        this.snack = true;
      }
      this.isHost = this.GLOBAL.roomInfo.host === this.GLOBAL.userInfo.id;
    })

    this.mediaService.registerNewMessageListener('updateListener', (newMsg) => {
      if (!this.chatOverlay) {
        this.chatBadge = 'green'
      }

      this.allMsgs.push(newMsg);
      let col = document.getElementById('chatContainer');
      col.scrollTop = col.scrollHeight;
    })

    this.mediaService.registerMeetingEndListener('meetingEndListener',(reason) => {
      switch (reason) {
        case MeetingEndReason.kicked:
          this.snackText = "已被主持人强制离开会议"
          this.snack = true
          break
        case MeetingEndReason.roomClosed:
          this.snackText = "会议结束"
          this.snack = true
          break
        case MeetingEndReason.lostConnection:
          this.snackText = "已断开连接"
          this.snack = true
          break
      }
      setTimeout(()=>{
        this.$emit('back');
      }, 1600);
    })

    this.mediaService.registerBeMutedListener('mutedListener', async () => {
      console.log('Be Muted')
      this.snackText = "已被主持人静音";
      this.snack = true;
      if (this.audio) {
        await this.microSwitch()
      }
    })

    try {
      await this.mediaService.joinMeeting(
          this.GLOBAL.roomInfo.token,
          this.GLOBAL.userInfo.token,
          this.GLOBAL.userInfo.id,
          this.GLOBAL.userInfo.nickname,
          this.GLOBAL.userInfo.nickname + '\'s PC',
          this.GLOBAL.baseURL + this.GLOBAL.userInfo.portrait)
    } catch (e) {
      this.snackText = '主持人尚未入会';
      this.snack = true;
      setTimeout(()=>{
        this.$emit('back');
      }, 1600);
    }

    this.video = this.GLOBAL.openCameraWhenEnter
    this.audio = this.GLOBAL.openMicrophoneWhenEnter

    if (this.video) {
      this.myVideoStream.addTrack(await this.mediaStreamFactory.getCameraTrack())
      this.mediaService.sendMediaStream(this.myVideoStream)
    } else {
      this.videoIcon.icon = 'mdi-video-off'
      this.videoIcon.color = 'gray'
    }

    if (this.audio) {
      this.myAudioStream.addTrack(await this.mediaStreamFactory.getMicrophoneTrack())
      this.mediaService.sendMediaStream(this.myAudioStream)
    } else {
      this.microIcon.icon = 'mdi-microphone-off'
      this.microIcon.color = 'gray'
    }

    moment.locale('zh-cn')
  },
  computed : {
    filteredUsers () {
      if (this.filterText === '') {
        return this.allUsers
      }
      else {
        return this.allUsers.filter(user => {
          return user.getPeerInfo().displayName.search(this.filterText) !== -1
        })
      }
    },
    mainFollowUser () {
      if (this.mainFollowUserId == null) {
        return {
          id : "",
          displayName: "",
          mediaStream : null,
          mirror: false
        }
      }
      if (this.mainFollowUserId === this.GLOBAL.userInfo.id) {
        return {
          id : this.mainFollowUserId,
          displayName : this.GLOBAL.userInfo.nickname,
          mediaStream : this.myVideoStream,
          mirror: this.video
        }
      } else {
        const user = this.mediaService.getPeerDetailByPeerId(this.mainFollowUserId)
        if (user != null) {
          return {
            id : this.mainFollowUserId,
            displayName : user.getPeerInfo().displayName,
            mediaStream : new MediaStream(user.getTracks()),
            mirror: false
          }
        } else {
          return {
            id : "",
            displayName: "",
            mediaStream : null,
            mirror: false
          }
        }
      }

    },
    subFollowUsers () {
      const subUsers = []
      this.subFollowUserIds.forEach((id) => {
        const user = this.mediaService.getPeerDetailByPeerId(id);
        if (user == null) {
          if (id === this.GLOBAL.userInfo.id) {
            subUsers.push({
              id: this.GLOBAL.userInfo.id,
              displayName: this.GLOBAL.userInfo.nickname,
              mediaStream: this.myVideoStream,
              mirror: this.video
            })
          }
        } else {
          subUsers.push({
            id: user.getPeerInfo().id,
            displayName: user.getPeerInfo().displayName,
            mediaStream: new MediaStream(user.getTracks()),
            mirror: false
          })
        }
      })

      return subUsers
    }
  },
}
</script>

<style scoped>
#appBarContent {
  margin-top: 15px;
}

#mainVideo {
  width: 1000px ;
  height: 560px;
  position: absolute;
  left: 0;
  right: 0;
  top: 0;
  bottom: 0;
  margin: auto;
}

#sheetTitle {
  font-weight: bold;
  font-size: large;
  color: gray;
}

#sheetDiv {
  margin-left: 60px;
  padding-top: 20px;
  text-align: center;
}

.v-card--reveal {
  align-items: center;
  bottom: -10px;
  background-color: #aaaaaa55;
  position: absolute;
  width: 100%;
}

.v-card--reveal-1 {
  background-color: #00000066;
  position: absolute;
  justify-content: center;
  left: 0;
  right: 0;
  top: 0;
  margin : auto;
  width: 20%;
}

.messageCard {
  padding: 5px 0 0 10px;
  border-top: 1px solid #00838f;
  border-right: 1px solid #00838f;
  border-left: 1px solid #00838f;
  border-bottom: 1px solid #00838f;
  border-bottom-right-radius: 10px;
  border-top-right-radius: 10px;
  border-top-left-radius: 10px;
}

.messageText {
  margin: 5px 0 0 10px;
  padding: 0 10px 5px 20px;
  display: block;
    max-width: 350px;
    word-wrap: break-word;
}

.chatContainer-full {
    width: 100%;
    height: 100%;
    text-align: left;
    overflow: auto;
}

.chatContainer-half {
  width: 50%;
  height: 100%;
  text-align: left;
  overflow: auto;
}

#captionContainer {
    width: 50%;
    height: 100%;
    text-align: left;
    overflow: auto;
    border-left: 1px solid teal;
}

#chatContainer::-webkit-scrollbar{
    display: none;
}

#captionContainer::-webkit-scrollbar{
    display: none;
}

#chatOverlay {
  position: absolute;
  width: 1000px;
  height: 560px;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  margin: auto;
  background-color: #ffffff66;
  border: 2px solid #00838f44;
    display: flex;
    justify-content: flex-start;
}

#rightSideBarText {
  margin-top: 14px;
  margin-left: 4px;
}

.private-chat {
  color: #FF9800;
  font-weight: bold;
  margin-right: 10px;
}
.not-host-item.host-item{
  border-left: 1px solid #ff9800;
  transition: 0.1s ease-in-out;
}
.not-host-item.host-item:hover{
  background-color:  #ff980011;
  border-left: 15px solid #ff9800;
  transition: 0.1s ease-in-out;
}
.not-host-item{
  border-left: 1px solid #00838f;
  transition: 0.1s ease-in-out;
}
.not-host-item:hover{
  background-color:  #00838f11;
  border-left: 15px solid #00838f;
  transition: 0.1s ease-in-out;
}
.item-avatar{
}
.item-avatar.has-audio{
  border: 1px solid green;
}
</style>
