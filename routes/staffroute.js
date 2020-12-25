const express=require('express');
const app =express();
const mongoose=require('mongoose');
const bcryptjs=require('bcryptjs');
const jwt =require('jsonwebtoken');
const PORT=1000;


const staff = require('../database/staff');
const attendance = require('../database/attendance');
const locations=require('../database/locations')
const { findOneAndUpdate, off, findOne } = require('../database/staff');
const faculty = require('../database/faculty');
const department = require('../database/department');
const course = require('../database/course');
const request=require('../database/request')
const schedule=require('../database/schedule')
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



app.post('/staff/insertdata',async(req,res)=>{
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
 app.get('/staff/profile',auth,async(req,res)=>{

   
    const profile=  await staff.findById(req.staff);
    res.send(profile)
  
 })







 app.post('/staff/logout',auth,(req,res)=>{
    verified=false;
   res.send("logged out")
});


app.post('/staff/changePassword',auth,async(req,res)=>{
    
    const salt = await bcryptjs.genSalt();
    const  {newPassword}=req.body;
    const passwordHashed = await bcryptjs.hash(newPassword,salt);
   const currentstaff= await staff.findByIdAndUpdate(req.staff,{password:passwordHashed});
    
    await currentstaff.save()
    res.send("password changed successfully")
})
 
app.post('/staff/login',async(req,res)=>{
  

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

app.post('/staff/signin',auth,async(req,res)=>{
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


// app.get('/missingdays',auth,async (req,res)=>{
//     let currentlylogged2=await staff.findById(req.staff);
    
    
// })


app.post('/staff/hr/addLocation',auth,async (req,res)=>{
    const currentstaff1=await staff.findById(req.staff)
    const {room,roomType,capacity}=req.body;
    if(currentstaff1.role=="hr"){
        fetchroom=await locations.findOne({room:room})
        if(!fetchroom){const newLocation=new locations({
            room:room,roomType:roomType,capacity:capacity,isfull:false
        })
        await newLocation.save();
        res.send("room added successfully")}
        else{
            res.send("location already exists")
        }

        
    }else{
        res.send("Unauthorized access");
    }
    

})

app.post('/staff/hr/updateLocation',auth,async (req,res)=>{
    const currentstaff2=await staff.findById(req.staff)
    const {currentname,newname,type,capacity}=req.body;  
    if(currentstaff2.role=="hr"){
    const room1= await locations.findOneAndUpdate({room:currentname},{room:newname,roomType:type,capacity:capacity})
    if(!room1){
        const message="location doesnt exist"
        return res.send(message); 
    }else{
        res.send("location updated successfully")}
    
    }else{
        res.send("Unauthorized access");
    }
    

})

app.delete('/staff/hr/deleteLocation',auth,async (req,res)=>{
    const currentstaff3=await staff.findById(req.staff)
    const {room}=req.body;  
    if(currentstaff3.role=="hr"){
    const room1= await locations.findOneAndDelete({room:room})
    if(!room1){
        const message="location doesnt exist"
        return res.send(message); 
    }else{
        res.send("location deleted successfully")}
    
    }else{
        res.send("Unauthorized access");
    }
    

})

app.post('/staff/hr/addFaculty',auth,async (req,res)=>{
    const currentstaff4=await staff.findById(req.staff)
    const {name,departments}=req.body;
    if(currentstaff4.role=="hr"){
        const currentfac=await faculty.findOne({
            name:name
        }) 
        if(currentfac ){
            res.send("faculty already exists")    
        }else{
        const newFaculty=new faculty({
           name:name,departments:departments
        })
        
        var i;
        for(i=0;i<departments.length;i++ ){
            const newDepartment =new department({
                name:departments[i]
                
            })
            await newDepartment.save();
        }
        await newFaculty.save();
       
        res.send("faculty added successfully")
        }
    }else{
        res.send("Unauthorized access");
    }
    

})


app.post('/staff/hr/updateFaculty',auth,async (req,res)=>{
    const currentstaff5=await staff.findById(req.staff)
    const {name,newname,newdepartments}=req.body;
    if(currentstaff5.role=="hr"){
        const currentfac=await faculty.findOne({
            name:name
        })
        if(currentfac){
          
             currentfac.name=newname
             var x=await currentfac.departments.concat(newdepartments)
             
            const currentfac2=await faculty.findOneAndUpdate({name:name},{name:newname,departments:x})

            
            var i;
            for(i=0;i<newdepartments.length;i++ ){
                const fetchdepartment=await department.findOne({name:newdepartments[i]})
                if(!fetchdepartment){
                const newDepartment =new department({
                    name:newdepartments[i] 
                })
            
                await currentfac2.save()
                await newDepartment.save();
                }
            }
            res.send("faculty updated successfully")
        }else{
              
        res.send("faculty doesnt exist")
        }
    }else{
        res.send("Unauthorized access");
    }
    

})


app.delete('/staff/hr/deleteFaculty',auth,async (req,res)=>{
    const currentstaff6=await staff.findById(req.staff)
    const {name}=req.body;
    if(currentstaff6.role=="hr"){
        const currentfac=await faculty.findOne({
            name:name
        }) 
        if(currentfac ){
            var i;
            for(i=0;i<currentfac.departments.length;i++){
                await department.findOneAndDelete({
                    name:currentfac.departments[i]
                })
            }

            await faculty.findOneAndDelete({
                name:name
            })
            
            res.send("faculty deleted")
        }else{
            res.send("faculty doesn't exist")
        }
    }else{
        res.send("Unauthorized access");
    }
    

})

app.delete('/staff/hr/deleteDepartment',auth,async (req,res)=>{
    const currentstaff7=await staff.findById(req.staff)
    const {facname,name}=req.body;
    if(currentstaff7.role=="hr"){
        const currentfac=await faculty.findOne({
            name:facname
        }) 
        if(currentfac ){

            function checker(elem){
                return elem==name
            }
            
                if( await currentfac.departments.find(checker))
                {
                    const temp=currentfac.departments.indexOf(name)
                    currentfac.departments.splice(temp,1)
                    await currentfac.save()
                    res.send("department deleted from faculty :" + currentfac.name)
                    
                }else{
                    res.send("department not found")
                }

            
            
         
        }else{
            res.send("faculty doesn't exist")
        }
    }else{
        res.send("Unauthorized access");
    }
    

})


app.post('/staff/hr/addCourse',auth,async (req,res) =>{
    
    
    const currentstaff8=await staff.findById(req.staff)
    const {courseID,depart}=req.body;
    if(currentstaff8.role=="hr"){
       
        const currentCourse=await course.findOne({
            courseID:courseID
        }) 
        if(currentCourse ){
            res.send("course already exists")    
        }else{  
            
             const  newCourse=new course({
            courseID:courseID,department:depart
            })
            
            const tempdepartment= await department.findOne({
                name:depart
            })
           
          await  tempdepartment.courses.push(courseID)
            
            
            await tempdepartment.save();
            await newCourse.save();
            res.send("success")
        }
    }else{
        res.send("Unauthorized access");
    }
    



})

app.post('/staff/hr/updateCourse',auth,async (req,res) =>{
    
    
    const currentstaff9=await staff.findById(req.staff)
    const {courseID,newCourseID}=req.body;
    if(currentstaff9.role=="hr"){
        function checker(elem){
            return elem==courseID
        }
        const currentCourse=await course.findOne({
            courseID:courseID
        }) 
        const fetchdep=currentCourse.department
        const changedep=await department.findOne({name:fetchdep})
        if(changedep.courses.find(checker)){
            var temporary=changedep.courses.indexOf(courseID)
            changedep.courses[temporary]=newCourseID
           await changedep.save()
            console.log(temporary)
        }
       
        if(currentCourse ){
           const fetchcourse=await  course.findOneAndUpdate({
                courseID:currentCourse.courseID
            },{
                courseID:newCourseID
                
            }) 
            
            
             
            res.send("success")
            
        }else{
            res.send("course not found")
        }
    }else{
        res.send("Unauthorized access");
    }
    



})


app.delete('/staff/hr/deleteCourse',auth,async (req,res) =>{
    
    
    const currentstaff9=await staff.findById(req.staff)
    const {courseID,depart}=req.body;
    if(currentstaff9.role=="hr"){
       
        const currentCourse=await course.findOne({
            courseID:courseID
        }) 
        if(currentCourse ){

            function checker(elem){
                return elem==courseID
            }
            const tempdepart=await department.findOne({
                name:depart
            })
            if(tempdepart.courses.find(checker)){
                const temporary=tempdepart.courses.indexOf(courseID)
                tempdepart.courses.splice(temporary,1)
            }
            await course.findOneAndDelete({
                courseID:currentCourse.courseID
            })
            await tempdepart.save()
            res.send("course deleted")    
        }else{
            res.send("course not found")
        }
    }else{
        res.send("Unauthorized access");
    }
    



})


app.post('/staff/hr/addStaff',auth,async (req,res)=>{
    const current=await staff.findById(req.staff)
    const {id,name,email,salary,officelocation,role,personalInfo}=req.body;   
   
    if(current.role=="hr"){
            const emailcheck=await staff.findOne({
                email:email
            })     
            
            const idcheck=await staff.findOne({
                id:id
            })
            
            if(emailcheck || idcheck){
                res.send("already registered")
            }else{

                const temproom=locations.findOne({
                    room:officelocation
                })
                if(temproom.isfull){
                    res.send("office full")
                }else{

                    if(role=="hr"){
                        const salt = await bcryptjs.genSalt();
                      const  passwordd= "123456"
                     const passwordHashed = await bcryptjs.hash(passwordd,salt);
                const newStaff=new staff({
                    password:passwordHashed,
                   id:id, email:email,name:name,salary:salary,officelocation:officelocation,role:role,personalInfo:personalInfo
                    ,newuser:true,daysoff:"Saturday"
                })
                await newStaff.save();
            res.send("success")

            }else{
                const newStaff=new staff({
                    password:"123456",
                    id:id,
                    email:email,name:name,salary:salary,officelocation:officelocation,role:role,personalInfo:personalInfo
                    ,newuser:true
                })
                await newStaff.save();
                res.send("success")
    
            }
                        }
       
    }
    }else{
        res.send("unauthorized Access")
    }
})

app.post('/staff/hr/updateStaff',auth,async (req,res)=>{
    const current=await staff.findById(req.staff)
    const {id,email,newemail,newsalary,newofficelocation}=req.body;   
    const  emailcheck=await staff.findOne({
        email:email
    })     
    const idcheck=await staff.findOne({
        id:id
    })
    if(current.role=="hr" && current._id!=emailcheck._id){
           

                if(emailcheck || idcheck){
                    const currentstaff=await staff.findOne({
                        id:id
                    })
                      const temproom=await locations.findOne({
                        room:newofficelocation
                    })
                    
                    if(await temproom.isfull){
                        res.send("office full")
                    }else{
                       await staff.findOneAndUpdate({
                            email:email,id:id
                        
                        },{email:newemail,salary:newsalary,officelocation:newofficelocation})
                        
                    }

                    
                        res.send("updated successfully")

                    
            }else{
                res.send("staff doesnt exist")
            }      
    }else{
        res.send("unauthorized Access")
    }
})


app.delete('/staff/hr/deleteStaff',auth,async (req,res)=>{
     const current=await staff.findById(req.staff)
     const {id}=req.body
     const fetchstaff=await staff.findOne({id:id})
     
     if(current.role=="hr"){
         if(fetchstaff&&current.id!=id){
            await staff.findOneAndDelete({id:id})

            
            res.send("staff deleted")
            
         }else{
             res.send("staff not found")
         }
         
     }else{
         res.send("unauthorized access")
     }

})

app.post('/staff/hr/updateSalary',auth,async(req,res)=>{
    const current22=await staff.findById(req.staff)
    const {id,newsalary}=req.body;
    const fetchstaff=await staff.findOne({id:id})
    if(current22.role=="hr" && current22._id!=fetchstaff._id){
             fetchstaff.salary=newsalary;
             await fetchstaff.save()
        res.send("salary updated")
    }else{

        res.send("unauthorized access")
    }
})

app.post('/staff/hod/assignCourseinstructor',auth,async(req,res)=>{
        const currenthod=await staff.findById(req.staff);
        const {id,courseID}=req.body;
        const fetchcourse= await course.findOne({
            courseID:courseID
        })

       const fetchinstructor=await staff.findOne({
           id:id,
           role:'instructor'
       })
       function checkinstructor(inst){
        return inst == id
    }
   const fetchinstructor3= await fetchcourse.courseInstructor.find(checkinstructor);
       
        if(currenthod.role=="hod"){
            if(!fetchcourse || !fetchinstructor){
                res.send('problem occured')
            }else{
                if(!fetchinstructor3){
                 fetchcourse.courseInstructor.push(id);
                 fetchcourse.courseStaff.push(id);
                 const fetchdepartment= await department.findOne({
                     name:fetchcourse.department
                 })
                 fetchinstructor.department=fetchcourse.department
                 await fetchinstructor.save()
              await   fetchdepartment.staff.push(id)
                await fetchcourse.save()
                await fetchdepartment.save()
                res.send("course instructor added")
        }else{
            res.send("same instructor already exists for this course")
        }
    }
        }else {
            res.send("unauthorized access")
        }

})
app.delete('/staff/hod/deleteCourseinstructor',auth,async(req,res)=>{
    const currenthod=await staff.findById(req.staff);
    const {id,courseID}=req.body;
    const fetchcourse= await course.findOne({
        courseID:courseID
    })

    function checkinstructor(inst){
        return inst == id
    }
   const fetchinstructor= await fetchcourse.courseInstructor.find(checkinstructor);
   
    if(currenthod.role=="hod"){
        if(!fetchcourse || !fetchinstructor){
            res.send('problem occured')
        }else{
            const temp=fetchcourse.courseInstructor.indexOf(id)
            const temp2=fetchcourse.courseStaff.indexOf(id)
                    fetchcourse.courseInstructor.splice(temp,1)
                    fetchcourse.courseStaff.splice(temp2,1)
                    
                   
                    const fetchdepartment=await department.findOne({
                        name:fetchcourse.department
                    })
                    const temp3=fetchdepartment.staff.indexOf(id)
                    fetchdepartment.staff.splice(temp3,1)
             
             await fetchdepartment.save()
            await fetchcourse.save()
            res.send("course instructor deleted")
        }
    }else {
        res.send("unauthorized access")
    }

})

app.post('/staff/hod/updateCourseinstructor',auth,async(req,res)=>{
    const currentlogged=await staff.findById(req.staff)
    const {courseID}=req.body;

    if(currentlogged.role=="hod"){
            const fetchcourse= await course.findOne({
                courseID:courseID
            })
         const   fetchdepartment=await department.findOne({
                name:fetchcourse.department
            })

            if(fetchcourse){
                var i=0;
                for(i;i<fetchcourse.courseStaff.length;i++){
                     fetchcourseStaff= await staff.findOne({
                        id:fetchcourse.courseStaff[i]
                    })
                    fetchcourseInstructors=await staff.findOne({
                        id:fetchcourse.courseInstructor[i]
                    })
                    
                    fetchdepartmentstaff= await staff.findOne({
                        id:fetchdepartment.staff[i]
                    })
                   
                    if(!fetchcourseStaff){
                        const temp=fetchcourse.courseStaff.indexOf(fetchcourse.courseStaff[i])
                        await fetchcourse.courseStaff.splice(temp,1)
                        fetchcourse.save()

                    }
                    if(!fetchcourseInstructors){
                        const temp1=fetchcourse.courseInstructor.indexOf(fetchcourse.courseInstructor[i])
                        await fetchcourse.courseInstructor.splice(temp1,1)
                        fetchcourse.save()
                    }

                    if(!fetchdepartmentstaff){
                        const temp2=fetchdepartment.staff.indexOf(fetchdepartment.staff[i])
                        await fetchdepartment.staff.splice(temp2,1)
                        fetchdepartment.save()
                    }

                    res.send("finished")
                    
                }
            }else{
                res.send("course not found")
            }
    }else{
        res.send("unauthorized access")
    }

})


app.get('/staff/hod/viewdepartmentstaff',auth,async(req,res)=>{
    const current=await staff.findById(req.staff)
    
    const fetchdepartment=await department.findOne({
        name: current.department
    })
    if(current.role=="hod" ){
        if(fetchdepartment!=null){
        var result="";
            var i =0;
            for(i;i<fetchdepartment.staff.length;i++){
                if(fetchdepartment.staff[i]!=null ){
                    const fetchstaff=await staff.findOne({
                        id:fetchdepartment.staff[i]
                    })
                    result=result.concat("\n")
                    var temp="staff ID : " + fetchstaff.id + " \n" + "staff name : " + fetchstaff.name + "\n" +
                    "email : "+ fetchstaff.email + "\n" + "department : " + fetchstaff.department + "\n" 
                    + "days off: " +  fetchstaff.daysoff + "\n" + " personal info : " +fetchstaff.personalInfo
                    + "\n" + "office location: " + fetchstaff.officelocation
                    result=result.concat("\n")
                    result=result.concat("\n")
                    result=result.concat(temp)
                }
                    
                
            }
            res.send(result)
        }else{
            res.send("department doesnt exist")
        }
    }else{
        res.send("unauthorized")
    }
})


app.get('/staff/hod/viewcoursestaff',auth,async(req,res)=>{
    const current=await staff.findById(req.staff)
    const {courseID}=req.body;
    const fetchcourse=await course.findOne({
        courseID:courseID
    })
    if(current.role=="hod"){
        if(fetchcourse!=null){
        var result="";
            var i =0;
            
            for(i;i<fetchcourse.courseStaff.length;i++){
                if(fetchcourse.courseStaff[i]!=null){
                    const fetchstaff=await staff.findOne({
                        id:fetchcourse.courseStaff[i]
                    })
                    result=result.concat("\n")
                    var temp="staff ID : " + fetchstaff.id + " \n" + "staff name : " + fetchstaff.name + "\n" +
                    "email : "+ fetchstaff.email + "\n" + "department : " + fetchstaff.department + "\n" 
                    + "days off: " +  fetchstaff.daysoff + "\n" + " personal info : " +fetchstaff.personalInfo
                    + "\n" + "office location: " + fetchstaff.officelocation
                    result=result.concat("\n")
                    result=result.concat("\n")
                    result=result.concat(temp)
                }
                    
                
            }
            res.send(result)
   }else{
       res.send("course not found")
   }
 }else{
        res.send("unauthorized")
    }
})

app.get('/staff/hod/viewdaysoff',auth,async(req,res)=>{
    const current=await staff.findById(req.staff)
    const {view,id}=req.body;
    
    if(current.role=="hod"){
       if(view=="1"){
        const fetchstaff= await staff.findOne({
            id:id
        })
        var result=fetchstaff.daysoff
        res.send(result)
    }else{
        const currentdep= await department.findOne({
            name:current.department
        })
        var result="";
            var i =0;
            for(i;i<currentdep.staff.length;i++){
                if(currentdep.staff[i]!=null){
                    const fetchstaff=await staff.findOne({
                        id:currentdep.staff[i]
                    })
                    result=result.concat("\n")
                    var temp="staff ID : " + fetchstaff.id + " \n" + "days off: " + fetchstaff.daysoff
                    result=result.concat("\n")
                    result=result.concat("\n")
                    result=result.concat(temp)
                }
                    
                
            }
            res.send(result)
        
    }
 }else{
        res.send("unauthorized")
    }
})


app.get('/staff/hod/viewrequests',auth,async(req,res)=>{
    const current=await staff.findById(req.staff)
    
    
    if(current.role=="hod"){
        const fetchrequest=await request.find({
            receiver:current.id
        })
        if(fetchrequest!=null){
        res.send(fetchrequest)
        }else{
            res.send("no requests ")
        }

    }
 else{
        res.send("unauthorized")
    }
})

app.post('/staff/hod/acceptrequest',auth,async(req,res)=>{
    const current=await staff.findById(req.staff)
    const {reqid}=req.body
    
    if(current.role=="hod"){
        const fetchrequest=await request.findOne({
            _id:reqid
        })

        
        
        if(fetchrequest!=null &&  fetchrequest.status=="pending"){
            
            if(fetchrequest.requesttype=="changeDayOff"){
                const fetchstaff =await staff.findOne({id:fetchrequest.sender})
                fetchstaff.daysoff=fetchrequest.newDayoff
                console.log(fetchstaff.notifications)
                fetchstaff.notifications.push("change day off request is accepted ")
                await fetchstaff.save()
                fetchrequest.status="accepted"
                await fetchrequest.save()
                
                res.send("request accepted")
            }else{
                const fetchstaff =await staff.findOne({id:fetchrequest.sender})
                fetchstaff.notifications.push("leave accepted ")
                await fetchstaff.save()
                fetchrequest.status="accepted"
                await fetchrequest.save()
                res.send("request accepted")
            }






        }else{
            res.send("request not found ")
        }

    }
 else{
        res.send("unauthorized")
    }
})

app.post('/staff/hod/rejectrequest',auth,async(req,res)=>{
    const current=await staff.findById(req.staff)
    const {reqid}=req.body
    
    if(current.role=="hod"){
        const fetchrequest=await request.findOne({
            _id:reqid
        })

        
        
        if(fetchrequest!=null &&  fetchrequest.status=="pending"){
            
            fetchrequest.status="rejected"
            const fetchstaff= await staff.findOne({
                id:fetchrequest.sender
            })
            fetchstaff.notifications.push("your request was rejected")
            fetchrequest.save()
            fetchstaff.save()
            res.send("request rejected")
        }else{
            res.send("request not found ")
        }

    }
 else{
        res.send("unauthorized")
    }
})

app.get('/staff/instructor/viewteachingassignment',auth,async (req,res)=>{
        const currentstaff=await staff.findById(req.staff) ;
        const {courseID}=req.body
        if(currentstaff.role=="instructor"){
                const fetchcourse=await course.findOne({
                    courseID:courseID
                })

                if(fetchcourse!=null&&currentstaff.department==fetchcourse.department){
                    const fetchschedule=await schedule.find({
                        courseID:courseID
                    })
                    if(fetchschedule!=null){
                        res.send(fetchschedule)
                    }else{
                        res.send("no teaching assignment for this course yet")
                    }
                
                }else{
                    res.send("please select a valid course in your department")
                }


            


        }else{
            res.send("unauthorized ")
        }
})

app.get('/staff/instructor/viewslots',auth,async (req,res)=>{
         const currentstaff=await staff.findById(req.staff) ; 

         if(currentstaff.role('instructor')){
                    
           
         }else{
             res.send("unauthorized")
         }
})

app.get('/staff/instructor/viewdepartmentstaff',auth,async(req,res)=>{
    const current=await staff.findById(req.staff)
   
    const fetchdepartment=await department.findOne({
        name:current.department
    })
    if(current.role=="instructor" ){
        if(fetchdepartment!=null){
        var result="";
            var i =0;
            for(i;i<fetchdepartment.staff.length;i++){
                if(fetchdepartment.staff[i]!=null ){
                    const fetchstaff=await staff.findOne({
                        id:fetchdepartment.staff[i]
                    })
                    result=result.concat("\n")
                    var temp="staff ID : " + fetchstaff.id + " \n" + "staff name : " + fetchstaff.name + "\n" +
                    "email : "+ fetchstaff.email + "\n" + "department : " + fetchstaff.department + "\n" 
                    + "days off: " +  fetchstaff.daysoff + "\n" + " personal info : " +fetchstaff.personalInfo
                    + "\n" + "office location: " + fetchstaff.officelocation
                    result=result.concat("\n")
                    result=result.concat("\n")
                    result=result.concat(temp)
                }
                    
                
            }
            res.send(result)
        }else{
            res.send("department doesnt exist")
        }
    }else{
        res.send("unauthorized")
    }
})

    app.post('/staff/instructor/assignmember',auth,async(req,res)=>{
            const current=await staff.findById(req.staff)
            const {id,courseID}=req.body;
            function checker(elem){
                return elem==id
            }
            const fetchcourse=await course.findOne({
                courseID:courseID
            })
            const fetchstaff=await staff.findOne({
                id:id
            })
            if(current.role=="instructor"){
                if(fetchstaff!=null &&fetchcourse!=null &&fetchstaff.role=="academic member"){
                        const fetchcourseschedule=await schedule.findOne({
                            courseID:courseID
                        })
                        if(fetchcourseschedule!=null){

                        }else{

                        }
                }else{

                }
           
           
            }else{
                res.send("unauthorized")
            }
    })

app.post('/staff/instructor/assigncoursecoordinator',auth,async(req,res)=>{
    const current=await staff.findById(req.staff)

    const {id,courseID}=req.body
    
    function checker(elem){
        return elem==id
    }
    const fetchcourse=await course.findOne({courseID:courseID})
    if(current.role=="instructor"){
        if(fetchcourse!=null&&fetchcourse.courseStaff.find(checker)){
            fetchcourse.courseCoordinator=id;
            current.role="courseCoordinator"
            current.save()
            fetchcourse.save()
            res.send("course coordinator added successfully")
        }else{
            res.send("problem occurred")
        }
    }else{
        res.send("unauthorized")
    }
})

app.get('/staff/coordinator/viewlinkingrequests',auth,async (req,res)=>{
        const current=await staff.findById(req.staff)
        const fetchcourse=await course.findOne({
            courseCoordinator:current.id
        })
        const fetchrequest=await request.find({
            requesttype:"slotLinking",
            receiver:current.id
            
        })
        if(fetchcourse&&current.role=="coordinator"){
            if(fetchrequest){
                res.send(fetchrequest)
            }else{
                res.send("there are no requests for this member")
            }
        }else{
            res.send("you're not this course's coordinator")
        }

})

app.post('/staff/coordinator/acceptlinking',auth,async(req,res)=>{
        const current=await staff.findById(req.staff)
        const {reqid,comment}=req.body
        const fetchcourse=await course.findOne({
            courseCoordinator:current.id
        })
        const fetchrequest=await request.findOne({
            _id:reqid
        })

        if(current.role=="coordinator"){
                if(fetchcourse &&fetchrequest&& fetchrequest.status=="pending"){
                       fetchrequest.status="accepted"
                       fetchrequest.comment=comment
                       await fetchrequest.save()
                       const fetchstaff=await staff.findOne({
                           id:fetchrequest.sender
                       })
                       fetchstaff.notifications.push("slot linking request id :"+fetchrequest.id+"is accepted ,"+ "comment :"+fetchrequest.comment)
                       await fetchstaff.save()
                    res.send("request accepted")
                }else{
                    res.send("problem occurred")
                }
        }else{
            res.send("unauthorized")
        }
        
})

app.post('/staff/coordinator/rejectlinking',auth,async(req,res)=>{
    const current=await staff.findById(req.staff)
    const {reqid:comment}=req.body
    const fetchcourse=await course.findOne({
        courseCoordinator:current.id
    })
    const fetchrequest=await request.findOne({
        _id:reqid
    })

    if(current.role=="coordinator"){
            if(fetchcourse &&fetchrequest&& fetchrequest.status=="pending"){
                   fetchrequest.status="rejected"
                   fetchrequest.comment=comment
                   const fetchstaff=await staff.findOne({
                    id:fetchrequest.sender
                })
                fetchstaff.notifications.push("slot linking request id :"+fetchrequest.id+"is rejected, " + "comment :"+fetchrequest.comment)
                await fetchstaff.save()
                   await fetchrequest.save()
                   
                res.send("request rejected")
            }else{
                res.send("problem occurred")
            }
    }else{
        res.send("unauthorized")
    }
    
})

app.post('/staff/academicmember/sendreplacementrequest',auth,async(req,res)=>{
        const current=await staff.findById(req.staff)
        const {receiver}=req.body
        const fetchstaff=await staff.findOne({id:receiver})
        if(current.role=="academicmember"){
            if(fetchstaff!=null){
                    const newRequest=new request({
                    sender:current.id,receiver:receiver,requesttype:"replacement",status:"pending"
                })
                await newRequest.save()
                    fetchstaff.notifications.push("new replacement request, id:" + newRequest._id )
                    await fetchstaff.save()
                    res.send("replacement request sent")
            }else{
               res.send("receiver doesnt exist") 
        }
                        }else{
            res.send("problem occurred")
        }
})


app.get('/staff/academicmember/viewreplacementrequests',auth,async(req,res)=>{
    const current=await staff.findById(req.staff)
        
    
    if(current.role=="academicmember"){
            const fetchrequest=await request.find({
                requesttype:"replacement"
            })
            if(fetchrequest){
                res.send(fetchrequest)
            }else{
                res.send("no replacement requests")
            }
            
        }else{
           res.send("unauthorized") 
    }
                    
})

app.post('/staff/academicmember/sendlinkingrequest',auth,async(req,res)=>{
    const current=await staff.findById(req.staff)
        const {comment,receiver,courseID}=req.body
    
    if(current.role=="academicmember"){
        const fetchcourse=await course.findOne({
            courseID:courseID
        })
           const fetchstaff=await staff.findOne({id:await fetchcourse.courseCoordinator,role:"coordinator"})
            if(fetchstaff!=null&&fetchstaff.id==receiver ){
                const newRequest=new request({
                    requesttype:"slotLinking",status:"pending",comment:comment,receiver:receiver,sender:current.id
                }) 
                await newRequest.save()
                fetchstaff.notifications.push("new slot linking request "+ newRequest)
                fetchstaff.save()
                res.send("request sent successfully")
            }else{
                res.send(receiver +" is not a cooridnator")
            }
           
            
        }else{
           res.send("unauthorized") 
    }
                    
})

app.post('/staff/academicmember/sendchangedayoffrequest',auth,async(req,res)=>{
    const current=await staff.findById(req.staff)
    const {courseID,comment,newDayoff}=req.body
    const fetchcourse=await course.findOne({courseID:courseID}).department
    const fetchcoursedepartment=await department.findOne({name:fetchcourse})
    if(current.role=="academicmember"){
        if(fetchcoursedepartment){
                const newRequest=new request({
                       status:"pending", comment:comment,newDayoff:newDayoff,sender:current.id,receiver:fetchcoursedepartment.hod
                })
        }else{

        }


     }else{
        res.send("problem occurred")
    }
})
app.post('/staff/academicmember/sendleaverequest',auth,async(req,res)=>{
    const current=await staff.findById(req.staff)
    const {courseID,comment,leavereason}=req.body
    const fetchcourse=await course.findOne({courseID:courseID}).department
    const fetchcoursedepartment=await department.findOne({name:fetchcourse})
    if(current.role=="academicmember"){
        if(fetchcoursedepartment&&leavereason!=null){
                const newRequest=new request({
                     status:"pending", leavereason:leavereason,comment:comment,sender:current.id,receiver:fetchcoursedepartment.hod
                })
        }else{

        }


     }else{
        res.send("problem occurred")
    }
})

app.get('/staff/academicmember/viewnotifications',auth,async(req,res)=>{
    const current=await staff.findById(req.staff)
    if(current.notifications!=null){
        res.send(current.notifications)
    }else{
        res.send("problem occurred")
    }
})

app.get('/staff/academicmember/viewrequeststatus',auth,async(req,res)=>{
    const current=await staff.findById(req.staff)
        const {caseofview}=req.body
    if(current.role=="academicmember" ){
        if(s==1){  //accepted requests
                const fetchacceptedrequests=await request.find({
                    status:"accepted",sender:current.id
                })
                
                res.send(fetchacceptedrequests)
        }else if(s==2){  //rejected requests
            const fetchrejectedrequests=await request.find({
                status:"rejected",sender:current.id
            })
            res.send(fetchrejectedrequests)
        }else if(s==3){ //all requests
            const fetchallrequests=await request.find({
                sender:current.id
            })
            res.send(fetchallrequests)
        }else if(s==0){// pending requests
            const fetchpendingrequests=await request.find({
                status:"pending",sender:current.id
            })
            res.send(fetchpendingrequests)
        }else {
            res.send('problem occurred regarding view types')
        }
    }else{
        res.send("problem occurred")
    }
})


app.post('/staff/academicmember/deletependingrequest',auth,async(req,res)=>{
    const current=await staff.findById(req.staff)
        const {reqid}=req.body
    if(current.role=="academicmember" ){
        const fetchrequest=await request.findOne({status:pending,sender:current.id ,_id:reqid})
        if(fetchrequest){
            fetchrequest.delete()
            request.save()
            res.send("request deleted successfully")
        }else{
            res.send("no pending requests with specified id found")
        }
    }else{
        res.send("problem occurred")
    }
})
 app.listen(PORT,()=>{
    console.log(`The server is listening on port number ${PORT}`);
});