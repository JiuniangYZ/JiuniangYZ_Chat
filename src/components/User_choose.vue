<template>
<div id="user_choose">
    <div id="top_bar">
        <div class="side" @click="back"><i class="iconfont icon-back"></i></div>
        <div>選択して</div>
        <div class="side"><i class="iconfont icon-selected" @click="back"></i></div>
    </div>
    <div id="list_wrapper">
        <div id="search">
            <div id="input_wrapper" ref="input_wrapper">
                <input type="text"  v-model="for_search" 
                @focus="input_focus" @blur="input_blur">
                <label id="place_holder" v-show="this.for_search.length<1" ref="place_holder">kona-yuki</label>
            </div>
        </div>
        <div class="delimeter"> <span>Friends</span> </div>
        <div id="choose_friend_wrapper">
            <label class="choose_item" v-for="(item,index) in this.filtered_friends" :key=index :for="item.name">
                <div class="avator"></div>
                <div class="name"> {{item.name}} </div>
                <input type="checkbox" v-model="chosen" :id=item.name :value=item.name></input>
                <i class="iconfont icon-favorites" v-if="chosen.includes(item.name)" ></i>
            </label>
        </div>
        <div class="delimeter" v-if="filtered_rooms.length>0"> <span>Rooms</span> </div>
        <div id="choose_room_wrapper" >
            <label class="choose_item" v-for="(item,index) in this.filtered_rooms" :key=index :for="item.name">
                <div class="avator"></div>
                <div class="name"> {{item.name}} </div>              
                <input type="checkbox" v-model="chosen" v-bind:id="item.name" v-bind:value="item.name"></input>
                <i class="iconfont icon-favorites" v-if="chosen.includes(item.name)" ></i>
            </label>
        </div>
    </div>
</div>
</template>

<script>
import Vue from 'vue'
export default {
    props:['friend_list','room_list'],
    data(){
        return{
            friends:[
                {name:'juicy'},{name:'only'},{name:'nine'},{name:'dream'},
            ],
            rooms:[
                {name:'public'},{name:'zero'},{name:'first'},{name:'second'},
            ],
            for_search:'',
            holder_left:0,
            chosen:[],
        }
    },
    computed:{
        filtered_friends:function(){
            let that=this;
            return that.friend_list.filter( (x)=>{return x.name.match('^'+that.for_search)} );
        },
        filtered_rooms:function(){
            let that=this;
            return that.room_list.filter( (x)=>{return x.name.match('^'+that.for_search)} );
        }
    },
    methods:{
        input_blur:function(){
            this.$refs.place_holder.style.left=this.holder_left+"px"
        },
        input_focus:function(){
            this.$refs.place_holder.style.left="10px"
        },
        back:function(){
            this.$emit('back',{name:this.chosen})
        }
    },
    mounted(){
        this.holder_left=(this.$refs.input_wrapper.offsetWidth-this.$refs.place_holder.offsetWidth)/2
        this.input_blur()
    },
    watch:{
        chosen:function(){
            console.log(this.chosen)
        }
    }
  
}
</script>

<style lang="less">
*{
    box-sizing: border-box;
    margin:0;
    padding:0;
}
#user_choose{
    position: absolute;
    height: 100vh;
    width: 100vw;
    #top_bar{
        height:120px;
        display: flex;
        flex-direction: row;
        justify-content: space-between;
        padding:20px 20px;
        font-size:45px;
        .side{
            flex-basis: auto;
            height:80px;
            //border:solid;
            //border-radius: 40px;
            i{
                font-size: 80px;
            }
        }
    }
    #list_wrapper{
        height: calc(~"100vh - 120px");
        overflow: scroll;
        -webkit-overflow-scrolling: touch;
        #search{
            border: solid;
            height:80px;
            margin-bottom: 20px;
            position: sticky;
            top:0px;
            //input::-webkit-input-placeholder{text-align: left;} 
            #input_wrapper{
                position:relative;
                //margin-left:180px;
                //width: calc( ~"100% - 180px" ) ;
                width:100%;
                height:100%;
                padding:0px 10px;
                input::-webkit-input-placeholder{text-align: center;};
                input[type="text"]{
                    font-size:3rem;
                    display: block;
                    height:100%;
                    width:100%;
                    //z-index:0;
                    opacity: 0.7;
                }
                #place_holder{
                    position: absolute;
                    line-height: 80px;
                    //text-align: center;
                    height:100%;
                    width:auto;
                    //border: solid;
                    color:black;
                    bottom: 0;
                    font-size: 3rem;
                    z-index: -1;
                    transition: 0.3s;
                }
            }
            #input_wrapper:hover{
                #place_holder{
                    text-align: left;
                    margin:auto;
                }
            }
        }
        .delimeter{
            height: 50px;
            background: grey;
            //color: white;
            //text-align: center;
            span{
                font-size:40px;
                line-height: 50px;
                position: relative;
                left: 20px;
            }
        }
        .choose_item{
            //border: solid;
            display:block;
            height:140px;
            position: relative;
            border-bottom: solid;
            border-bottom-color: purple;
            input[type="checkbox"]{
                visibility: hidden;
            }
            .avator{
                position:absolute;
                margin:10px;
                height:120px;
                width: 120px;
                background:blue;
                
            }
            .name{
                //position: absolute;
                margin-left:200px;
                //margin:auto;
                font-size:3.9rem;
                vertical-align: middle;
                line-height: 140px;
                //text-align: center;
                
            }
            i{
                position: absolute;
                font-size:60px;
                right: 50px;
                top:40px;
            }
        }
    }
}


</style>


