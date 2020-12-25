const mongoose=require('mongoose');
const mongodb=require('mongodb');
const locationSchema=new mongoose.Schema({

    room:{
        type:String , required:true 
    },roomType:{
        type:String,required:true
    },capacity:{
        type:Number,required:true
    },isfull:{
        type:Boolean
    }


})


module.exports=mongoose.model('locations',locationSchema);