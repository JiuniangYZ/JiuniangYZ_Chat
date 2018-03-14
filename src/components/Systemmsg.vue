<template lang="html">
    <div id="sys_msg_wrapper">
        <div class="sys_msg_item" v-for="(item,index) in this.requests">
            <h2> A {{ request_types[item.type] }} from {{item.from}}  </h2>
            <div class="buttons">
                <mt-button type="default" 
                @click.native="request_reply({type:item.type,from:item.from,room:item.room,decision:true,index:index})"
                >いいよ</mt-button>
                <mt-button type="default" 
                @click.native="request_reply({type:item.type,from:item.from,room:item.room,decision:false,index:index})"
                >ダメ</mt-button>
            </div>
        </div>
    </div>
</template>

<script>
import Vue from 'vue'
import {mapActions,mapState,mapGetters,mapMutations} from 'vuex'
export default {
    data(){
        return{
            /** 
            system_msgs:[
                //1--> invite to room 2-->friend 
                {from:'only',type:'i',room:'yume'},
                {from:'holy',type:'f',}
            ],
            **/
            request_types:{'i':'Chat Invitation','f':'Friend request'}
        }
    },
    computed:{
        ...mapState(['requests','codename'])
    },
    methods:{
        ...mapMutations(['request_reply'])
    }
}
</script>

<style lang="less">
.sys_msg_item{
    margin-top: 50px;
    margin-bottom: 50px;
    font-size:2rem;
    text-align: center;
    position: relative;
    .buttons{
    display: flex;
        justify-content: center;
        .mint-button{
           margin-left: 100px;
           margin-right:100px;
           label{
               font-size:2rem;
           }
       }
       
   }
}
</style>


