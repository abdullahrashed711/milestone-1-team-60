const mongoose=require('mongoose');
const mongodb=require('mongodb');
const departmentSchema=new mongoose.Schema({

    name:{
        type:String,required:true
    },staff:{
        type:[String]
    },courses:{
        type:[String]
    },hod:{
        type:String
    }


})



module.exports=mongoose.model('department',departmentSchema);