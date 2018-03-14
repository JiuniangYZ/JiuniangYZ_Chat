<template lang="html">
<div id="chat_window_wrapper">
    <div id="chat_window" v-show="this.show_tab==1">
        <div id="func_bar" v-show="this.touch_menu_show>0" ref="touch_menu">
            <div class="func_bar_item">reply</div>
            <div class="func_bar_item" @click="into_choose(5)">forward</div>
        </div>
        <div id="chat_topbar">
            {{$route.params.to}}
            <button id="top_right_button" @click="into_choose(2)">   
                show room       
            </button>
        </div>
        <div id="chat_his">
            <div id="chat_his_inner" ref="chat_inner">
                <div class="chat_item" v-bind:class="{right: item.self, at:item.unread_at}"  
                v-for="(item,index) in this.current_his($route.params.to)"
                v-bind:from=item.from
                @touchstart="touchstart(item,$event)" @touchend="touchend(item,$event)"
                >
                    <div class="chatter_profile">{{item.from}}</div>
                    <div class="chat_bubble">{{item.content}}</div>
                </div>
                <div id="anchor_wrapper" v-if="this.anchor_show>0">
                    <div class="anchor_item" v-for="(item,index) in this.anchors" @click="jump(item.height,index)" >
                        {{item.content}}
                    </div>
                </div>
            </div>
        </div>
        <div id="chat_input">
            <div id="chat_inner">
                <div id="field">
                    <mt-field   v-model="msg_input" type="text"></mt-field>
                    <!-- 用watch检测msg_input来处理@的问题 -->
                </div>
                <div id="send">
                    <mt-button type="default" size="large" style="height:100%;font-size:3em"　
                    @click="msg({to:$route.params.to,msg:msg_input,is_room:is_room})">送る</mt-button>
                </div>
            </div>
        </div>
    </div>
    <!--div id="room_profile"-->
    <div id="user_list" v-if="this.show_tab==2">
        <div id="topbar">
            I am top
        </div>
        <div id="profile_wrapper">
            <div class="profile" v-for="(user,index) in this.current_users" :key=user>
                <div class="name">{{user}}</div>              
            </div>
            <div class="profile" @click="into_choose(3)">
            <!--  选择邀请新人加入房间群聊 此时showtab为3 -->
                invite
            </div>
        </div>
        <div id="bot">
        </div>
        <mt-button type="primary" class="mint-button-my" @click.native="leave_click()">leave this place</mt-button>
    </div>
    <!--div id="user_choose" v-if="this.show_tab==3 || this.show_tab==4">
        <mt-checklist
            :title="user_choose_title"
            v-model="invite_choose"
            :options="potential_user"
        >
        </mt-checklist>
        <mt-button type="primary" v-if="this.show_tab==3" class="mint-button-my" @click.native="invite_click()">Invite</mt-button>
        <mt-button type="primary" v-if="this.show_tab==4" class="mint-button-my" @click.native="at_click()">@ someone</mt-button>
    </div-->
    <user_choose v-if="this.show_tab==3 || this.show_tab==4 || this.show_tab==5" 
    :friend_list="potential_user" :room_list="potential_room"
    @back="after_choose">
    </user_choose>
</div>
</template>

<script>
import Vue from 'vue'
import {mapActions,mapState,mapGetters,mapMutations} from 'vuex'
import axios from 'axios'
import user_choose from './User_choose.vue'
export default{
    components:{'user_choose':user_choose},
    data(){
        return{
            msg_input:'',
            is_room:0,
            user_list:[],//need it only when is_room==1 like ['juicy','only'],
            show_tab:1,
            invite_choose:[],
            anchors:[],
            his_height:0,//记录历史区域的可见高度
            his_scrollheight:0,//记录历史区域的总高度
            touch_timer:{},//用作唤出回复--转发菜单的定时器
            touch_menu_show:0,//用作标记是否显示回复--转发菜单
            anchor_show:0,
            forward_to:'',
            forward_content:'',
            //at:false,
            current_users:[],//每次试图@
            room_list:[]
        }       
    },
    computed:{
        ...mapGetters(['current_his','unread_all']),
        ...mapState(['system_msg','codename','friends','rooms']),
        potential_user:function(){
            if(this.is_room==0){
                //return this.user_list
            }
            if(this.is_room==1 && this.show_tab==4){ //3 means choose user to invite, 4 means choose user to @
                return this.current_users.filter((x)=>{ return !(x==this.codename) })
                .map( (x)=>{return {name:x}} )
            }
            if(this.is_room==1 && this.show_tab==3){//if this is a room
                return this.friends.map((x)=>{return x.name}).filter((x)=>{return !(this.current_users.includes(x)) })
                .map( (x)=>{return {name:x}} )
                
            }
            if(this.show_tab==5){
                return this.friends
            }
        },
        potential_room:function(){
            if(this.show_tab==5){
                return this.rooms
            }
            return []
        }
        /** 
        user_choose_title:function(){
            return 'jude'
        }
        **/
        
    },
    methods:{
        ...mapMutations(['msg','readed','leave','request','into_chat','leave_chat']),
        load_user:function(){
            let that=this
            axios.get('/show_server').then(
                function(response){
                    that.user_list=response.data.rooms.find( (x)=>{return x.name==that.$route.params.to} ).users.map( (x)=>{return x.name} )
                }
            )
        },
        into_choose:function(num){
            //num=2-----> 进入房间信息子页面   num=3 --> 邀请新人进入聊天  num=4 ---->选择@某人 num=5--->选择把某信息转发到某聊天或者某房间 
            let that=this
            if(num==2){
                axios.get('show_server').then(
                    function(response){
                        that.current_users=
                        response.data.rooms.find( (x)=>{return x.name==that.$route.params.to} ).users.map((x)=>{return x.name});
                        that.show_tab=2
                    }
                )
            }
            if(num==3){
                axios.get('show_server').then(
                    function(response){
                        that.current_users=
                        response.data.rooms.find( (x)=>{return x.name==that.$route.params.to} ).users.map((x)=>{return x.name});
                        that.show_tab=3
                    }
                )
            }
            if(num==4){
                axios.get('show_server').then(
                    function(response){
                        that.current_users=
                        response.data.rooms.find( (x)=>{return x.name==that.$route.params.to} ).users.map((x)=>{return x.name});
                        that.show_tab=4
                    }
                )
            }
            if(num==5){//已把准备转发的信息预先复制到foward_content里面
                that.touch_menu_show=0
                that.show_tab=5
            }
        },
        after_choose:function(payload){//处理从user_choose的返回
            let that=this
            if(that.show_tab==3){//向目标发出进入房间的邀请
                //console.log({to:payload.name,room:that.$route.params.to,type:'i'})
                for(let juicy of payload.name){
                    that.request( {to:juicy,room:that.$route.params.to,type:'i'} )
                    //console.log({to:juicy.name,room:that.$route.params.to,type:'i'})
                }
                that.show_tab=1
            }
            if(that.show_tab==4){//@某人
                let mymsg=that.msg_input.substr(0,that.msg_input.length-1)
                //console.log('mymsg is '+mymsg)
                for(let juicy of payload.name){
                    mymsg=mymsg.concat('@',juicy)
                }
                that.msg_input=mymsg
                that.show_tab=1
            }
            if(that.show_tab==5){//@转发信息
                for(let juicy of payload.name){
                    let is_room_here=that.rooms.map( (x)=>{return x.name} ).includes(juicy)? 1:0
                    that.msg({to:juicy,msg:that.msg_input,is_room:is_room_here})
                    //msg({to:$route.params.to,msg:msg_input,is_room:is_room})
                }
                that.show_tab=1
            }
            
        },
        send_click:function(){

        },
        leave_click:function(){
            this.leave( {room:this.$route.params.to} )
            this.$router.push('/')
            //this.show_tab=1
        },
        ////////////////////// tobe 废案
        /** 
        invite_click:function(){
            console.log({to:this.invite_choose,room:this.$route.params.to,type:'i'})
            this.request( {to:this.invite_choose,room:this.$route.params.to,type:'i'} )
            this.show_tab=1
        },
        **/
        at_click:function(){
            if(this.invite_choose.length>0){//if user really choose someone
                //this.msg_input.splice(this.msg_input.length-1,1)
                this.msg_input=this.msg_input.slice(0,-1)
                this.at_someone=true;
                for( let nine of this.invite_choose ){
                    this.msg_input=this.msg_input.concat('@'+nine)
                }
                console.log(this.invite_choose+'   '+this.msg_input)
            }
            this.show_tab=1
        },
        ///////////////////////
        jump:function(nine,index){
            let juicy=this.$refs.chat_inner;
            //juicy.scrollTop=nine-this.his_height+50;//当前位置是juicy.schrolltop  需要达到的位置是 nine-this.his_height+50
            let single_step=function(el,dis,time){
            //el is the element to be scrolled, dis is the distance, time is the time for single step
                return new Promise(
                    function(resolve,reject){
                        setTimeout( ()=>{
                            el.scrollTop=el.scrollTop+dis;                               
                            resolve();
                        },time )
                    }
                )
            }
            let gen=async function(times,el,dis,time){
                //console.log(' my dis is '+dis)
                for(let i=0;i<times;i++){
                    await single_step(el,dis,time)
                }
            }
            gen(50,juicy, (nine-this.his_height+200-juicy.scrollTop)/50 ,10)
            this.anchors.splice(index,1)
        },
        touchstart:function(item,event){
            //let myitem=item;let myevent=event;window.myitem=myitem;window.myevent=event
            this.forward_to=item.from; this.forward_content=item.content;
            console.log('content stored as '+item.content)
            let juicy=event.changedTouches[0]
            //console.log('screen x: '+juicy.screenX+' y: '+juicy.screenY+' client x: '+juicy.clientX+' y: '+juicy.clientY)
            let that=this; let screen_height=document.documentElement.clientHeight; let screen_width=document.body.clientWidth
            that.touch_menu_show=0
            //the width of the func_bar is 350px
            if(screen_width-juicy.clientX<400){
                this.$refs.touch_menu.style.left=(juicy.clientX-350)+'px'
            }
            else{
                this.$refs.touch_menu.style.left=juicy.clientX+'px'
            }
            if(screen_height-juicy.clientY<350){
                this.$refs.touch_menu.style.top=(juicy.clientY-200)+'px'
            }
            else{
                this.$refs.touch_menu.style.top=juicy.clientY+'px'
            }
            that.touch_timer=setTimeout(()=>{that.touch_menu_show=1},500)
        },
        touchend:function(item,event){
            if(this.touch_menu_show==0){clearTimeout(this.touch_timer)}
            else{return}
        },
        touch_forward:function(){

        },
        touch_reply:function(){

        }
    },
    /** 
    beforeRouteEnter: (to, from, next) => {
        if(to.params.to){
            console.log(to.params.to)
            //console.log(state.codename)
        }
        next()
    },
    **/
    watch:{
        system_msg:function(payload){
            console.log('type: '+payload.type+' content: '+payload.content)
        },
        /** 
        show_tab:function(value,oldvalue){
            this.load_user()
        },
        **/
        msg_input:function(value){
            let that=this
            if(value[value.length-1]=='@' && that.$route.query.is_room>0){
                that.into_choose(4)
            }
        }
    },
    
    mounted:function(){//get all the information for the unread_at msgs
        /** 
        this.readed(this.$route.params.to)
        this.is_room=(this.$route.query.is_room)
        this.load_user()
        **/
        this.his_height=this.$refs.chat_inner.offsetHeight//to get the viewable height of the history area
        this.his_scrollheight=this.$refs.chat_inner.scrollHeight// to get the whole height of the history area
        let list=Array.from(this.$el.querySelectorAll(".at"))
        let that=this
        list.forEach( (cur,index)=>{ 
            if( cur.offsetTop-that.$refs.chat_inner.scrollTop>0 && cur.offsetTop-that.$refs.chat_inner.scrollTop<that.his_height ){
                //which means you can still see the sentence in the viewable area 
                return
            }
            that.anchors.push( {content:cur.innerText,height:cur.offsetTop,index:index} ) 
            //for all the things you cannot see
        } )
        window.mylist=that.anchors
        this.anchor_show=1
    },
    created:function(){
        this.into_chat( {name:this.$route.params.to} ) //change the current chat in the store
        this.readed(this.$route.params.to)
        this.is_room=(this.$route.query.is_room)
        /** 
        if(this.is_room>0){
            this.load_user()
        }
        **/
    },
    beforeRouteLeave:function(to, from, next){
        this.leave_chat()
        next()
    }
}   
</script>

<style lang="less">
*{
    box-sizing: border-box;
    margin:0;
    padding:0;
}
.mint-button-my{
    width:300px;
    height: auto;
    font-size:40px;
    padding:10px;
    margin-left:50px;
}
#chat_window_wrapper{
    position: absolute;
    height: 100vh;
    width: 100vw;

    #chat_window{
        position: absolute;
        height: 100vh;
        width: 100vw;
        //border: solid;
        //border-color: purple;
        #func_bar{
            position: absolute;
            width:350px;
            z-index: 100000;
            .func_bar_item{
                width:100%;
                height:100px;
                font-size:3rem;
                background-color: grey;
                border: solid;
            }
        }
        #chat_topbar{
            position: relative;
            background: grey;
            color:white;
            top:0px;
            left:0;
            width:100%;
            height:5vh;
            font-size:3em;
            #top_right_button{
                position:absolute;
                right: 20px;
                width:50px;
                height: 50px;
                top: calc(~" ( 5vh - 50px ) / 2 ");
                background:white;
            }
        }
        #chat_his{
            #chat_his_inner{
                background: white;
                overflow: scroll;
                height:100%;
                border-radius: 20px;
                #anchor_wrapper{
                    position:absolute;
                    width:calc(~"100% - 30px");
                    bottom:30px;
                    .anchor_item{
                        height: 50px;
                        font-size:40px;
                        text-align: center;
                        background: red;
                        color:white;
                        width:100%;
                        opacity:0.7;
                    }
                }
            }
            background: skyblue;
            padding:15px;
            position:relative;
            font-size:2.5em;
            width:100%;
            text-align:left;
            border: solid;
            height:84vh;
            .chat_item{
                margin-top:2vh;
                margin-bottom: 2vh;
                display: flex;
                align-items: flex-start;
                .chatter_profile{
                    order:0;
                    flex-basis: auto;
                    height: 50px;
                    width: 50px;
                    overflow: hidden;
                    margin: 20px;
                    border: solid;
                }
                .chat_bubble{
                    order: 1;
                    flex-basis:auto;
                    height: auto;
                    width:500px;
                    overflow-wrap: break-word;
                    background:skyblue;
                    color:white;
                    padding:30px;
                    border-radius: 30px;
                }
            }
            .at{
                color:purple;
            }
            .right{
                flex-direction: row-reverse;
            }
        }
        #chat_input{
            position:relative;
            height:10vh;
            border: solid;
            //background: red;
            width:100%;
            font-size:10px;
            #chat_inner{
                //border-radius: 10px;
                height:100%;
                padding:10px;
                background: skyblue;
                position: relative;
            
                #field{    
                    border-radius: 20px;
                    position: relative; 
                    width:100%;
                    height:100%;
                    border:solid;
                    display: inline-block;
                    text-align:left;
                    padding-right:20%;
                    background: white;
                }
                #send{
                    position:absolute;
                    width:20%;
                    height:50%;
                    top:0;
                    background: white;
                    top:0;
                    bottom:0;
                    right:20px;
                    border-radius:20px;
                    margin:auto;
                }
            }
        }
        input[type='text']{font-size:3em}
    }
    //#room_profile{
    #user_choose{
        position: absolute;
        height: 100%;
        width: 100%;
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
    #user_list{
        position: absolute;
        height: 100%;
        width: 100%;
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
    //}
}



</style>
