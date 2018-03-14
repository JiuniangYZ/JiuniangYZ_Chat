import Vue from 'vue'
import Vuex from 'vuex'
import axios from 'axios'
import io from 'socket.io-client'
//const request_types={'f':}
Vue.use(Vuex)
const state={
    logged:false,
    codename:'',
    current_chat:'',
    main_socket:{},
    active_chats:[
        {name:'juicy',history:[{from:'only',content:'a'}],unread:1,is_room:0,at:false},
        {name:'only',history:[{from:'juicy',content:'好き'}],unread:2,is_room:0,at:false},
        {name:'public',history:[
            {from:'juicy',content:'好き'},{from:'juicy',content:'好き'},{from:'juicy',content:'@好き',unread_at:true},
            {from:'juicy',content:'好き'},{from:'juicy',content:'好き'},{from:'juicy',content:'好き',unread_at:false},
            {from:'juicy',content:'好き'},{from:'juicy',content:'好き'},{from:'juicy',content:'@好き',unread_at:true},
            {from:'juicy',content:'好き'},{from:'juicy',content:'好き'},{from:'juicy',content:'好き',unread_at:false},
            {from:'juicy',content:'好き'},{from:'juicy',content:'好き'},{from:'juicy',content:'@好き',unread_at:true},
            {from:'juicy',content:'好き'},{from:'juicy',content:'好き'},{from:'juicy',content:'@好き',unread_at:false},
            {from:'juicy',content:'好き'},{from:'juicy',content:'好き'},{from:'juicy',content:'好き',unread_at:false},
            {from:'juicy',content:'好き'},{from:'juicy',content:'好き'},{from:'juicy',content:'@好き',unread_at:true},
            {from:'juicy',content:'好き'},{from:'juicy',content:'好き'},{from:'juicy',content:'好き',unread_at:false},
            {from:'juicy',content:'好き'},{from:'juicy',content:'好き'},{from:'juicy',content:'@好き',unread_at:true},
        ],unread:0,is_room:1,at:true},
    ],
    system_msg:{type:' ',content:' '},
    friends:[
        {name:'juicy'},
        {name:'only'}
    ],
    rooms:[
        {name:'public',creator:'juicy'},
    ],
    requests:[
        {from:'juicy',type:'f'},
        {from:'only',type:'i'}
    ]
    //test_socket:{},
    //current_socket:{name:'main',socket:undefined}
}
const mutations={
    //logon:(state,payload)=>{if(state.logged==true){return}state.holy.push({name:'main',socket:io()});state.logged=true },
    logon:(state,payload)=>{
        if(state.logged==true){return}
        var holy=io()
        //holy.on('broad',(msg)=>{console.log(msg)})
        holy.on('broad',(payload)=>{//for getting msg
            //let target=state.active_chats.find((x)=>{return x.name==payload.from})
            let target,at=false,unread_at=false//at_unread is only for checking whether this at_msg is readed
            let chat_name=payload.is_room>0 ? payload.room : payload.from //for comparison with the current_chat
            if(payload.is_room>0){
                target=state.active_chats.findIndex((x)=>{return x.name==payload.room})//because this is a room chat 
                if(target<0){
                    state.active_chats.unshift( {name:payload.room,history:[],unread:0,is_room:1} )
                    target=0
                }
            }
            else{
                target=state.active_chats.findIndex((x)=>{return x.name==payload.from})
                if(target<0){
                    state.active_chats.unshift( {name:payload.from,history:[],unread:0,is_room:0}  )
                    target=0
                }
            }   
            /**         
            if(payload.msg.match( getters.regex()(state.codename) ) && !(state.current_chat) ){
                //console.log('we found something')
                at=true              
                state.active_chats[target].at=true
            }  
            **/         
            if( !(chat_name==state.current_chat) ){
                state.active_chats[target].unread+=1
                if(payload.msg.match( getters.regex()(state.codename))){
                    unread_at=true
                }
            }
            state.active_chats[target].history.push(  { from:payload.from,content:payload.msg,unread_at:unread_at }  )
            //unread_at is the mark for getting the @ function
            state.active_chats.unshift(  state.active_chats.splice(target,1)[0]  )
            console.log('got msg from: '+payload.from+' as '+payload.msg)
            //need to handle the unread
        })
        holy.on('sys_msg',(payload)=>{
            state.system_msg=payload
        })
        holy.on('request',(payload)=>{
            state.requests.unshift( {from:payload.from,type:payload.type,room:payload.room} )
        })
        holy.on('request_reply',(payload)=>{
            if(payload.type=='f'){//for friends invitation
                if(payload.decision==false){
                    state.system_msg={type:'f_deny',content:payload.to+'rejected your friend request'}
                    return
                }
                state.friends.push({name:payload.to})
            }
        })
        state.main_socket=holy;
        state.main_socket.emit('logon',{name:payload})
        state.codename=payload
        state.logged=true 
    },
    msg:(state,payload)=>{
        if (!state.logged){console.log('log first plz!');return}
        let target=state.active_chats.findIndex((x)=>{return x.name==payload.to})
        state.active_chats[target].history.push({from:state.codename,content:payload.msg,self:true})
        state.main_socket.emit('msg', {from:state.codename,to:payload.to, msg:payload.msg, is_room:payload.is_room })
        //if it is a room msg the is_room attribute will be 1
        state.active_chats.unshift( state.active_chats.splice(target,1)[0]  )
        //you only need to provide the text and to
    },
    request:(state,payload)=>{ 
    //payload: {type:request_type, to:..., from:... room... } if type is f then room will be undefined
        //if(payload.type=='f' && state.friends.find( (x)=>{return x.name==payload.to} )){return}
        if(payload.to==state.codename){return}
        if (payload.to instanceof Array){
            let to 
            for (to of payload.to){
                console.log('to is '+to )
                state.main_socket.emit('request',{type:payload.type,to:to,from:state.codename,room:payload.room})
            }
            return
        }
        state.main_socket.emit('request',{ type:payload.type,to:payload.to,from:state.codename,room:payload.room })
    },
    request_reply:(state,payload)=>{
        if(state.friends.find( (x)=>{return x.name==payload.from} ) && payload.type=='f' ){return}
        state.main_socket.emit(
            'request_reply',{ type:payload.type,to:state.codename,from:payload.from,room:payload.room,decision:payload.decision }
        )
        if(payload.decision==true && payload.type=='f'){
            state.friends.push({name:payload.from})
        }
        if(payload.decision==true && payload.type=='i'){
            state.rooms.push({name:payload.room})
            state.main_socket.emit('join',{room:payload.room})
        }
        state.requests.splice(payload.index,1)
    },
    leave:(state,payload)=>{//for leaing a room
        state.main_socket.emit('leave',{name:payload.room,from:state.codename})
        state.active_chats.splice( state.active_chats.findIndex((x)=>{return x.name==payload.room}),1 )
        state.rooms.splice( state.rooms.findIndex((x)=>{return x.name==payload.room}),1 )
    },
    friend_click:(state,payload)=>{
        if( state.active_chats.findIndex((x)=>{return x.name==payload.name &&x.is_room==0 })<0 ){
            state.active_chats.unshift({ name:payload.name,history:[],unread:0,is_room:0 })
        }
    },
    room_click:(state,payload)=>{
        if( state.active_chats.findIndex( (x)=>{return x.name==payload.name && x.is_room==1} )<0 ){
            state.active_chats.unshift({name:payload.name,history:[],unread:0,is_room:1})
        }
    },
    /** 
    new_room:(state,payload)=>{ //payload is string as the room name
        if(payload=='main'){console.log('cannot use this name');return}
        if(!state.logged){console.log('plz login');return}
        state.main_socket.emit('new_room',payload)
        var holy=io('/'+payload)
        holy.on('broad',(msg)=>{console.log(payload+' got msg as '+msg)})
        state.current_socket=({name:payload,socket:holy})
       //state.test_socket=io('/test')
    }
    **/
    readed:(state,payload)=>{
        state.active_chats.find((x)=>{return x.name==payload}).unread=0
        state.active_chats.find((x)=>{return x.name==payload}).at=false
    },
    into_chat:(state,payload)=>{
        state.current_chat=payload.name
    },
    leave_chat:(state)=>{
        if( state.active_chats.find((x)=>{return x.name==state.current_chat}).is_room==1 ){
            state.active_chats.find((x)=>{return x.name==state.current_chat}).history
            .filter( (x)=>{return x.unread_at==true} ).forEach( (x)=>{x.unread_at=false} )
        }
        state.current_chat=''
    },
}

const getters={
    current_his(state,getters){
        return (name)=>{
            return state.active_chats.find( (x)=>{return x.name==name}  ).history
         }
    },
    unread_all(state,getters){
        return (name)=>{
            return state.active_chats.filter( (x)=>{return x.name!==name} )
            .reduce((pre,cur)=>{
                return cur.unread+pre
            },0)
        }
    },
    regex(state,getters){
        /** 
        let nine=state.codename
        return new RegExp( '@'+nine+'_' )
        **/
        return (name)=>{
            return new RegExp(name)
        }
    }

}

const actions={
    add_chatter:(context,payload)=>{
        //payload should have only the name of user
        if(context.state.active_chats.find( (x)=>{return x.name==payload} )){return}
        if(payload==context.state.codename){return}
        axios.get('/user_check?username='+payload).then(
            function(response){
                if(response.data.result=="exist"){
                    context.state.active_chats.push( {name:payload,history:[],unread:0} )
                    console.log(context.state.active_chats)
                }
            }
        )
    },
    new_room:(context,payload)=>{
        axios.get('/show_server').then(
            function(response){
                if (response.data.rooms.findIndex((x)=>{return x.name==payload.name})<0){
                    context.state.main_socket.emit('new_room',{user:context.state.codename,name:payload.name})
                }
                else{
                    context.state.system_msg={type:'error',content:'room with same name already exist'}
                }
            }
        )
    }

}


export default new Vuex.Store({
    state,
    getters,
    actions,
    mutations
})
