const mongodb=require('mongodb')
const mongoose=require('mongoose')
const scheduleSchema=new mongoose.Schema({
    day:{
        type:String,required:true
    },slots:{
        first:{
            type:[String]
        },second:{
            type:[String]
        },third:{
            type:[String]
        },fourth:{
            type:[String]
        },fifth:{
          type:[String]  
        }
    },courseID:{
        type:String,required:true
    }
})

module.exports=mongoose.model('schedule',scheduleSchema)