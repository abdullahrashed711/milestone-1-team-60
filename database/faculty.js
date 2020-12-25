const mongoose=require('mongoose');
const mongodb=require('mongodb');

const facultySchema=new mongoose.Schema({
    name:{
        type:String ,required:true
    },departments:{
        type:[String],required:true
    }

})


module.exports=mongoose.model('faculty',facultySchema);