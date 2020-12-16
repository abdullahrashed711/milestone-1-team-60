const express=require('express');
const app =express();
const mongoose=require('mongoose');
const bcryptjs=require('bcryptjs');
const jwt =require('jsonwebtoken');
const PORT=1000;


const staff = require('../database/staff');
const attendance = require('../database/attendance');
const { findOneAndUpdate } = require('../database/staff');
app.use(express.json())
app.use(express.urlencoded({extended:false}));
const connectionParams={
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true 
}
const URL = "mongodb+srv://abdullah:123@cluster0.ehj0u.mongodb.net/staffdata?retryWrites=true&w=majority";
mongoose.connect(URL,connectionParams).then(()=>{
    console.log("Db is successfully created");
}).catch(()=>{
    console.log("DB failed");
}); 

app.get('/',(req,res)=>{
    res.send('hello world');
});



app.post('/insertdata',async(req,res)=>{
    const {email,password}=req.body;
    const salt = await bcryptjs.genSalt();
  const passwordHashed = await bcryptjs.hash(password,salt);
  
    const newStaff=new staff({
        email:email,
        password:passwordHashed
    });
   await newStaff.save();
   

})








const auth = (req,res,next)=>{
    try{
             const token=req.header('x-auth-token');
             const JWT_Password="r)ch\4g<=FWw;uzdj/:;$'aj4m`7aeDdXD9'T#r-C:p}>RBJsu";
 
             
             const verified = jwt.verify(token,JWT_Password);
             console.log(verified);
             
             if(!verified){
                 return res.status(401).json({msg:"authorization failed"});
             }
             req.staff=verified._id;
             next();
    }
    catch(error){
     res.status(500).json({error:error.message});
 
    }
 }
 app.get('/profile',auth,async(req,res)=>{

   
    const profile=  await staff.findById(req.staff);
    console.log(profile)
  
 })







 app.get('/logout',auth,(req,res)=>{
    verified=false;
   res.send("logged out")
});


app.post('/changePassword',auth,async(req,res)=>{
    
    const salt = await bcryptjs.genSalt();
    const  {newPassword}=req.body;
    const passwordHashed = await bcryptjs.hash(newPassword,salt);
   const currentstaff= await staff.findByIdAndUpdate(req.staff,{password:passwordHashed});
    
})
 
app.post('/login',async(req,res)=>{
  

    try{
        const {email,password}=req.body;
        if(!email||!password){
            return res.status(400).json({msg:"Please Enter a valid email or password"});

        }
        const existingStaff= await staff.findOne({email:email});
        if(!existingStaff){
            return res.status(400).json({msg:"User is not registered"});
        }
    //    const isMatched=await staff.findOne({email:email,password:password});
         const isMatched=await bcryptjs.compare(password,existingStaff.password);
        if(!isMatched)
        {
            return res
            .status(400)
            .json({msg:"Invalid credentials"});

        }
      
        const JWT_Password="r)ch\4g<=FWw;uzdj/:;$'aj4m`7aeDdXD9'T#r-C:p}>RBJsu";
        const token = jwt.sign({_id:existingStaff._id},JWT_Password);
       res.json({token,staff:{
         id:existingStaff._id,
         email:existingStaff.email,
         displayName:existingStaff.displayName}});




        
    }
    catch(error)
    {
        res.status(500).json({error:error.message});
    }
    
});

app.post('/signin',auth,async(req,res)=>{
    let currentlylogged=await staff.findById(req.staff);
   console.log(currentlylogged._id)
  const {month,day}=req.body;


    const occupiedMD=await attendance.findOne({
       month:month,day:day
        
   }) 

   if(occupiedMD && occupiedMD.staffId.find(element=> element==currentlylogged._id)){
       
       res.send("you've already checked attendance");
   }else if(!occupiedMD){
    const newAttendance=new attendance({
    month:month,
    day:day,
    attended:true,
    staffId:currentlylogged._id
        
})
await newAttendance.save();
}else{
    await attendance.findOneAndUpdate({
        month:month,day:day
        
    },{ $push: { staffId: currentlylogged._id } })

}

})


 app.listen(PORT,()=>{
    console.log(`The server is listening on port number ${PORT}`);
});