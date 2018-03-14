import Vue from 'vue'
import Router from 'vue-router'
import HelloWorld from '../components/HelloWorld.vue'
import Minttest from '../components/Minttest.vue'
import Chat_main from '../components/chat_main.vue'
import Chat_window from '../components/chat_window.vue'
import System_msg from '../components/Systemmsg.vue'
import Room_profile from '../components/Room_profile.vue'

Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/',
      name: 'Hello',
      component:Chat_main 
    },
    {
      path: '/chat/:to',
      name: 'Chat',
      component:Chat_window 
    },
    {
      path:'/sys_msg',
      name:'Sys_msg',
      component:System_msg
    },
    {
      path:'/room_profile/:room',
      name:'Room_profile',
      component:Room_profile
    }
  ]
})
