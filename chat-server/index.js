const fs=require('fs')
const Koa = require('../node_modules/koa');
const static=require('../node_modules/koa-static')
const path = require('path')
const http = require('http')
const route=require('koa-route')
const app = new Koa();
var socket_io = require('../node_modules/socket.io')
var static_path='..'
var compose = require('../node_modules/koa-compose')
var rooms=[
  {name:'first',creator:'juicy',users:[]},
  {name:'second',creator:'only',users:[]},
  {name:'public',users:[{name:'only'},{name:'jude'},{name:'juicy'},{name:'nine'}]},
]
var users=[ ]//array, each item has 'name' and 'id'
/** 
const main = ctx => {
  ctx.response.body = 'Hello World';
};
**/
const user_check= function(ctx){
  if( users.find((x)=>{ return x.name==ctx.request.query.username} )  ){
    ctx.body={result:"exist"}
  }
  else{
    ctx.body={result:"none"}
  }
}
const main=function(ctx){
  ctx.response.type='html'
  ctx.response.body = fs.createReadStream(path.join(__dirname,'../index.html')) ;
}
const show_server=function(ctx){
  ctx.body={
    users:users,
    rooms:rooms,
  }
}


app.use(static(path.join(__dirname,static_path)))
app.use(route.get('/',main)  );
app.use(route.get('/user_check',user_check) )
app.use(route.get('/show_server',show_server) )
var server=app.listen(3000)
var io=socket_io.listen(server)

io.on("connection",function(socket){
  socket.join('public')
  //console.log(socket.id+' connected');
  socket.on("logon",(payload)=>{
    users.push({id:socket.id,name:payload.name})
    //socket.join('public')
    rooms.find( (x)=>{return x.name=='public'} ).users.push( {name:payload.name} )
    console.log(payload.name+' '+socket.id+' logged on')
  })
  socket.on("msg",(payload)=>{
    //the id for the socket will be stored on server, and will be used to send private msg and system msg
    //socket.broadcast.emit('broad','main channel got u!')
    let juicy
    if(payload.is_room>0){ // for chatroom message
      if(juicy=rooms.find( (x)=>{return x.name==payload.to} )){//the room existing
        socket.broadcast.to(payload.to).emit( 'broad', {from:payload.from,msg:payload.msg,room:payload.to,is_room:1} )
      }
      else{
        io.to(socket.id).emit('sys_msg',{type:'error',content:'room not found'})
      }
    }
    else{ //for friend message
      if(juicy=users.find( (x)=>{ return x.name==payload.to} )){
        io.to(juicy.id).emit('broad', {from:payload.from,msg:payload.msg,to:payload.to,is_room:0}  )
      }
      else{
        io.to( socket.id ).emit('sys_msg',{type:'error',content:'user not found'})
        return
      }
    }
    io.to( socket.id ).emit('sys_msg',{type:'ok',content:'sent successfully'})
  })
  /////////for request(room invitation and friend)
  socket.on("request",(payload)=>{ 
    console.log('got a request '); console.log(payload);
    //payload.type('f' for friend 'i' for invite ), payload.to, payload.from, payload.room(if its a invitation)
    let juicy
    if(juicy=users.find((x)=>{return x.name==payload.to})  ){
      if(payload.type=='i'){ //which means this is a invitation
        if(rooms.map((x)=>{return x.name}).includes(payload.room)){
          //let the user join the room
          io.to(juicy.id).emit('request',{from:payload.from,type:payload.type,room:payload.room})
        }
        else{
          io.to(socket.id).emit('sys_msg',{type:'error',content:'cannot find a room with same name'})
          return
        }
      }
      if(payload.type=='f'){
        io.to(juicy.id).emit('request',{from:payload.from,type:payload.type,room:payload.room})
      }
    }
    else{
      io.to( socket.id ).emit('sys_msg',{type:'error',content:'user not found as target of request'})
      return
    }
    io.to( socket.id ).emit('sys_msg',{type:'ok',content:'sent successfully'})
  })
  socket.on( 'request_reply',(payload)=>{ 
    //type,from,to,room
    let juicy
    if(juicy=users.find((x)=>{return x.name==payload.from})){
      io.to(juicy.id).emit('request_reply',{type:payload.type,to:payload.to,room:payload.room,decision:payload.decision})
      if(payload.type=='i' && payload.decision==true){
        rooms.find( (x)=>{return x.name==payload.room} ).users.push( {name:payload.to} )
      }
    }
    else{
      io.to( socket.id ).emit('sys_msg',{type:'error',content:'user not found as sender of request'})
      return
    }
    io.to( socket.id ).emit('sys_msg',{type:'ok',content:'sent successfully'})
  })
  /////////
  ////// for room chat
  socket.on('new_room',(payload)=>{
    rooms.push( {name:payload.name,creator:payload.user,users:[payload.user]} )
  })
  socket.on( 'join',(payload)=>{
    socket.join(payload.room)
  })
  socket.on( 'leave',(payload)=>{
    let room_users=rooms.find( (x)=>{return x.name==payload.name} ).users
    room_users.splice( room_users.findIndex( (x)=>{return x.name==payload.name} ),1 )
    console.log( socket.id+' left room '+payload.name )
    socket.leave(payload.name)
  })
  //////
  socket.on('disconnect',()=>{
    users.map((element,index,array)=>{
      if(element.id==socket.id){
        let spliced=array.splice(index,1)[0]
        //console.log(spliced)
        console.log(spliced.name+' '+spliced.id+' logged off')
        //console.log(users)
      }
    })
    //console.log(socket.id+'')
  })
  


})




