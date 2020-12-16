const mongoose = require('mongoose');
const mongodb=require('mongodb');   
const staffSchema = require('../database/staff');
const attendanceSchema= new mongoose.Schema({
    month:{
        type:Number 
    }
    ,day :{
        type:Number
    },
    attended:{
        type:Boolean
    },staffId:{
      type:  [String] ,required:true
    }
})

module.exports=mongoose.model('attendance',attendanceSchema);