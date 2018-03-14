<template lang="html">
<div id="chat_main">
    <div id="main_head">
        <div id="username" v-if="this.logged"><b>{{this.codename}}</b></div> 
        <div id="login" v-if="!this.logged">
            <mt-field label="login" v-model="this.input_username"></mt-field>
            <mt-button @click.native="logon(this.input_username)">login</mt-button>
        </div> 
    </div>
    <div class="add_chatter" v-if="this.logged">
        <mt-field label='添加朋友' v-model="this.input_friend"></mt-field>
        <mt-button @click.native="request({type:'f',from:this.codename,to:this.input_friend})">探す</mt-button>
    </div>
    <div id="chats_wrapper" v-if="this.logged"　v-show="this.tab_shift==1">
        <div class="chatter_item" @click="$router.push('/sys_msg')">
            <span>check system messages</span>
        </div>
        <div class="chatter_item" v-for="(chatter,index) in this.active_chats" @click="$router.push('chat/'+chatter.name+'?is_room='+chatter.is_room)">
            <div class="avatar"></div>
            <div class="info">
                <div class="username">{{chatter.name}}</div>
                <div class="chat_top">
                    {{chatter.history.length? chatter.history[chatter.history.length-1].content : 'new'}}
                    <div class="unread" v-if="chatter.unread>0">{{chatter.unread}}</div>
                </div>
            </div>
        </div>
    </div>
    <div id="friends_wrapper" v-if="this.logged"  v-show="this.tab_shift==2">
        <div class="friend_item" v-for="(friend,index) in this.friends" @click="friend_to_chat(friend.name)">
            <span>{{friend.name}}</span>
        </div>
    </div>
    <div id="rooms_wrapper" v-if="this.logged" v-show="this.tab_shift==3">
        <div class="room_item" v-for="(room,index) in this.rooms" @click="room_to_chat(room.name)" >
            <span>{{room.name}}</span>
        </div>
    </div>
    <div id="main_bot" v-if="this.logged">
        <div class="bot_item" @click="shift_tab(1)">chats</div>
        <div class="bot_item" @click="shift_tab(2)">friends</div>
        <div class="bot_item" @click="shift_tab(3)">rooms</div>
    </div>
</div>
</template>

<script>
import Vue from 'vue'
import {mapActions,mapState,mapGetters,mapMutations} from 'vuex'

export default {
    data(){
        return{
            input_username:'',
            input_chatter:'',
            input_friend:'',
            show_chats:true,
            tab_shift:1,
        }
    },
    computed:{
        ...mapState(['active_chats','logged','codename','friends','system_msg','rooms'])
        ,
        /** 
         num_unread(){
             return this.active_charts.reduce( (pre,cur)=>{return pre+cur},0)
        }
        **/
    },
    methods:{
        ...mapActions(['add_chatter']),
        ...mapMutations(['logon','request','friend_click','room_click']),
        shift_tab:function(num){
            this.tab_shift=num
        },
        friend_to_chat:function(name){
            this.friend_click({name:name})
            this.$router.push('/chat/'+name+'?is_room=0')
        },
        room_to_chat:function(name){
            this.room_click({name:name})
            this.$router.push('/chat/'+name+'?is_room=1')
        }
    },
    watch:{
        system_msg:function(payload){
        console.log('type: '+payload.type+' content: '+payload.content)
        }
    },

}
</script>

<style lang="less">
    *{
        box-sizing: border-box;
        margin:0;
        padding:0;
        
    }
    #chat_main{
        position: absolute;
        width:100vw;
        height:100vh;
        #main_head{
            position: relative;
            border: solid;
            height: 120px;
            width:100%;
            padding:20px;
            font-size:50px;
            padding-right:200px;
            .mint-cell{
                height:80px;
            }
            #username{
                text-align: left;
            }
            .mint-button{
                position:absolute;
                right: 20px;
                height: 80px;
                top:20px; 
                width:200px;
                font-size:40px;
            }
            .mint-cell-title{
                width:auto;
                font-size:50px;
                margin-right: 20px;
            }
            input[type="text"]{
                font-size:50px;
            }

        }
        #chats_wrapper{
            height: calc(~"90vh - 350px");
            width:100%;
            padding:0px;
            overflow: scroll;
            .chatter_item{
                display: flex;
                flex-direction: row;
                position: relative;
                height: 180px;
                width:100vw;
                font-size:50px;
                .avatar{
                    order:0;
                    flex-basis:auto;
                    position: relative;
                    width:180px;
                    height:100%;
                    padding:10px;
                    background: url(/static2/pic/link.png);
                    background-size: contain;
                    
                }
                .info{
                    order:1;
                    //flex-basis:100%;
                    //display:inline-block;
                    height:100%;
                    //border:solid;
                    width: calc(~"100% - 180px");
                    text-align: left;
                    position: relative;
                    padding-left:20px;
                    display: flex;
                    direction: row;
                    flex-wrap: wrap;
                    .username{
                        order:0;
                        //top:0;
                        //left:0;
                        width:100%;
                        //position: absolute;
                        height:60%;
                        //border:solid;
                        font-size:60px;            
                    }
                    .chat_top{
                        position: relative;
                        order:1;
                        width:100%;
                        height:40%;
                        font-size:40px;
                        color:grey;
                        padding:20px 100px 20px 20px;
                        overflow: hidden;
                        text-overflow:ellipsis;
                        white-space: nowrap;
                        .unread{
                            position: absolute;
                            height: 30px;
                            right: 20px;
                            bottom:20px; 
                        }
                    }
                }
            }
        }
        #friends_wrapper , #rooms_wrapper  {
            height:calc(~"90vh - 250px");
            width:100%;
            padding:0px;
            overflow: scroll;
            .friend_item, .room_item{
                height: 100px;
                font-size: 50px;
            }
        }
        #main_bot{
            height:10vh;
            position: absolute;
            bottom: 0;
            width:100%;
            display:flex;
            .bot_item{
                width:1px;
                font-size:3rem;
                flex-grow: 1;
            }
        }
        .add_chatter{
            height: 100px;
            width: 100%;
            padding-right: 200px;
            position: relative;
            .mint-button{
                position:absolute;
                right: 20px;
                height: 60px;
                top:20px; 
                width:200px;
                font-size:40px;
            }
            .mint-cell{
                height:100%
            }
            .mint-cell-title{
                width:auto;
                padding:10px;
            }
            .mint-cell-text{
                font-size:50px;
            }
        }
        input.mint-field-core{
            font-size:40px;
        }
    }

</style>

