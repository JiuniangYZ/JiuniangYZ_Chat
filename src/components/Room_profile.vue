<template>
    <div id="room_profile">
        <div id="user_list" v-show="this.choose_show<1">
            <div id="topbar">
                I am top
            </div>
            <div id="profile_wrapper">
                <div class="profile" v-for="(user,index) in this.users" :key=user.name>
                    <div class="name">{{user.name}}</div>              
                </div>
                <div class="profile" @click="goto_choose()">
                    invite
                </div>
            </div>
            <div id="bot">
            </div>
            <mt-button type="primary" @click.native="load_user()">leave this place</mt-button>
        </div>
        <!--div id="user_choose" v-if="this.choose_show>0">
            <mt-checklist
                title="复选框列表"
                v-model="value"
                :options="['选项A', '选项B', '选项C']"
            >
            </mt-checklist>
            <mt-button type="primary" @click.native="show_invite()">Invite</mt-button>
        </div-->
        <user_choose v-if="choose_show==1" :friend_list="friend_list" :room_list="room_list" @back="choose_back(payload)">
        </user_choose>
    </div>
</template>

<script>
import axios from 'axios'
import {mapActions,mapState,mapGetters,mapMutations} from 'vuex'
import user_choose from './User_choose.vue'
export default {
    components:{'user_choose':user_choose},
    data(){
        return {
            users:[],
            potential_users:[
                //{name:'juicy'},{name:'only'}
            ],
            choose_show:0,
            value:[],
            friend_list:[],
            room_list:[]
        }
    },
    computed:{
        ...mapState(['friends'])
    },
    methods:{
        show_invite:function(){
            console.log(this.value)
            this.choose_show=0
        },
        send_sth:function(){
            console.log('sent')
        },
        load_user:function(type){
            let that=this
            if(type==1){//for load the user-list for current room
                axios.get('/show_server').then(
                    function(response){
                        console.log(that.$route.params.room)
                    }
                )
            }
            else{//for load the potential
                
            }
        },
        into_choose(){
            let that=this
            axios.get('/show_server').then(
                function(response){
                    window.response_data=response
                    that.choose_show=1
                }
            )
        }
        
    },
    watch:{
        choose_show:function(val){
            if(val==0){
                console.log('time to have fun~')
                this.load_user();
            }
        }
    },
    mounted:function(){
        this.load_user();
    }
}
</script>

<style lang="less">
    *{
        box-sizing: border-box;
        margin:0;
        padding:0;
        
    }
    #room_profile{
        position: absolute;
        width: 100vw;
        height:100vh;
        .mint-button{
            width:300px;
            height: auto;
            font-size:40px;
            padding:10px;
            margin-left:50px;
        }
        /**
        #user_choose{
            z-index:10;
            height:100vh;
            width:100vw;
            position: absolute;
            overflow: scroll;
            .mint-cell{
                margin-top:20px;
                margin-bottom:20px;
            }
            .mint-checklist-title{
                font-size:3rem;
            }
            .mint-checklist-label{
                font-size:3rem;
            }

        }
        **/
        #user_list{
            #topbar{
                text-align: center;
                font-size: 3rem;
                height: 100px;
                width:100%;
            }
            #profile_wrapper{
                position: relative;
                display: flex;
                flex-direction: row;
                flex-wrap:wrap;
                justify-content: flex-start;
                align-content:flex-start;
                height: 800px;
                width:100%;
                overflow-y: scroll;
                .profile{
                    position: relative;
                    flex-basis:auto;
                    height: 16vw;
                    width: 16vw;
                    margin-top:30px;
                    margin-left:2vw;
                    margin-right:2vw;
                    flex-shrink: 0;
                    flex-grow: 0;
                    overflow: hidden; 
                    font-size:4rem;  
                    border: solid;                     
                }
            }
            #bot{
            }
        }
    }
</style>
