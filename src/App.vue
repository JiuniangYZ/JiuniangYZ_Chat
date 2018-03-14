<template>
  <div id="app">
    <router-view/>
    <!--h1 v-if="$store.state.logged">your current room is {{current_room}}</h1>
    <h2 v-if="$store.state.logged">your codename is {{codename}}</h2>
    <div>
      <input v-model="username">   
      <button @click.stop="logon(username)">logon</button>
    </div>
    <div>
      <input v-model="msg"/>
      <button @click.stop="send(msg)">msg</button>
    </div>
    <div>
      <input v-model="roomname"/>
      <button @click.stop="new_room(roomname)">Open new room</button>
    </div-->
  </div>
</template>

<script>
/** 
import vue from 'vue'
import {mapActions,mapState,mapGetters,mapMutations} from 'vuex'
//import io from '../node_modules/socket.io-client'
//var socket=io();
export default {
  name: 'app',
  data(){
    return{
      roomname:'',
      msg:'',
      username:'',
      //current_room:'default'
    }
  },
  methods:{
    ...mapMutations(['send','logon','new_room']),
    show(){
      console.log('see you?')
    }
  },
  computed:{
    //...mapGetters(['current_room','codename'])
    ...mapState(['current_room','codename'])
  },
  mounted(){
    //window.socket=io()
    //window.socket.emit('msg',"jude")
  }
}
*/
</script>
<style>
#app {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 0;
}
</style>
