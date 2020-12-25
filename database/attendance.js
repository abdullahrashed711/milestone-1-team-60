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
    staffattend:{
        staffID:{type:String},
        attended:{type:[Boolean]}
    }
})

module.exports=mongoose.model('attendance',attendanceSchema);