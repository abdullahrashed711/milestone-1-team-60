const mongoose = require('mongoose');
const mongodb=require('mongodb');   
const staffSchema = new mongoose.Schema({

    id:{
        type:String, minlength: 1, maxlength: 30
    },
 name: {
 type: String, minlength: 4, maxlength: 30
 },
email:{type:String,required:true,unique:true}, role: {
    type: String}

    , password:{type:String,required:true,minlength:5}
 
 ,salary:{type:Number},faculty:{
     type:String
 },
 department:{
     type:String
 }
});


module.exports=mongoose.model('staff', staffSchema);
