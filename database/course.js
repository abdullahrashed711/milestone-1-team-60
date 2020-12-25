const mongoose=require('mongoose');
const mongodb=require('mongodb');
const courseSchema=new mongoose.Schema({

    courseID:{
        type:String,required:true
    },courseInstructor:{
        type:[String]
    },courseStaff:{
        type:[String]
    },department:{
        type:String
    },courseCoordinator:{
        type:String
    }

})


module.exports=mongoose.model('course',courseSchema);