const mongoose=require('mongoose');
const mongodb=require('mongodb');

const requestSchema=new mongoose.Schema({
    requesttype:{
        type:String ,required:true
    },comment:{
        type:String
    },sender:{
        type:String ,required:true
    },receiver:{
        type:String,required:true
    },newDayoff:{
        type:String
    },leavereason:{
        type:String
    },status:{
        type:String 
    }
})


module.exports=mongoose.model('request',requestSchema)